"""
TodoAgent - OpenAI Agent orchestration with MCP tools.

Per @specs/001-chatbot-mcp/plan.md Section VIII - AI Chatbot Architecture
OpenAI Agents SDK for orchestration with MCP tool calling.
"""
from openai import OpenAI
from typing import List, Dict, Any, Optional, AsyncGenerator
from uuid import UUID
import logging
import json

from src.config import settings
from src.mcp.server import get_mcp_server

logger = logging.getLogger(__name__)


class TodoAgent:
    """
    OpenAI Agent for Todo task management with MCP tool integration.

    This agent:
    - Uses OpenAI Chat Completions API with tool calling
    - Integrates with MCP tools for task operations
    - Maintains conversation context for multi-turn dialogs
    - Enforces user isolation by passing user_id to all tool calls
    """

    # System prompt for friendly, concise, task-oriented behavior
    SYSTEM_PROMPT = """You are a helpful task management assistant for TaskFlow. Your role is to help users manage their todo tasks through natural language.

Key behaviors:
- Be friendly and concise in your responses
- Focus on helping users create, view, complete, and delete tasks
- When users ask to add tasks, extract the task title and any description
- When users ask to see tasks, list their tasks clearly with numbers for easy reference
- When users ask to complete/delete/update tasks, ALWAYS call list_tasks FIRST to identify the task
- Users may refer to tasks by number (e.g., "first task", "task 2") or by title/content
- Use the available tools to perform all task operations
- Never make up task information - always use the tools
- The user_id parameter is automatically injected - do NOT ask the user for it

Task identification workflow:
1. When user wants to update/delete/complete a task, FIRST call list_tasks
2. Show the user the tasks with numbers: "1. Task title", "2. Task title", etc.
3. If user specified a number or title, match it to get the task_id
4. Then call the appropriate tool (update_task, delete_task, complete_task) with the task_id

Available tools:
- add_task: Create a new task with title and optional description
- list_tasks: Show all tasks with their IDs (call this FIRST before update/delete/complete)
- complete_task: Mark a task as completed (requires task_id from list_tasks)
- delete_task: Remove a task permanently (requires task_id from list_tasks)
- update_task: Change a task's title or description (requires task_id from list_tasks)

Note: user_id is automatically provided for all tool calls. Never ask the user for their user ID."""

    def __init__(self, user_id: UUID):
        """
        Initialize the TodoAgent for a specific user.

        Args:
            user_id: The user's UUID for data isolation
        """
        self.user_id = user_id

        # Log API key info for debugging (don't log full key)
        key_preview = settings.openai_api_key[:10] if settings.openai_api_key else "None"
        key_length = len(settings.openai_api_key) if settings.openai_api_key else 0
        logger.info(f"TodoAgent initializing with OpenAI API key: {key_preview}... (length: {key_length})")

        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

        # Get MCP server and register tools as OpenAI functions
        self.mcp_server = get_mcp_server()
        self.tools = self._get_openai_tools()

        logger.info(f"TodoAgent initialized for user {user_id}")

    def _get_openai_tools(self) -> List[Dict[str, Any]]:
        """
        Convert MCP tools to OpenAI function format.

        Returns:
            List of tool definitions in OpenAI format

        Per @specs/001-chatbot-mcp/contracts/mcp-tools.json
        """
        tools = []

        # Get all registered MCP tools from SimpleMCPRegistry
        mcp_tools = self.mcp_server.list_tools()

        for tool in mcp_tools:
            # Convert MCP tool schema to OpenAI function format
            function_def = {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters.copy()  # Copy to avoid mutation
                }
            }

            # Add user_id parameter to all tools for data isolation
            # Note: user_id is auto-filled and should NOT be in required parameters
            if "properties" not in function_def["function"]["parameters"]:
                function_def["function"]["parameters"]["properties"] = {}

            function_def["function"]["parameters"]["properties"]["user_id"] = {
                "type": "string",
                "description": "User ID for data isolation (auto-filled, do not ask user)",
            }

            # Initialize required array if not present
            if "required" not in function_def["function"]["parameters"]:
                function_def["function"]["parameters"]["required"] = []

            # IMPORTANT: Do NOT add user_id to required - it's auto-injected
            # This prevents the model from asking the user for their user_id

            tools.append(function_def)

        logger.info(f"Registered {len(tools)} tools with OpenAI agent")
        return tools

    async def process_message(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message through the agent with tool execution.

        Args:
            user_message: The user's message text
            conversation_history: Previous messages in the conversation

        Yields:
            Response text chunks as they're generated

        Per @specs/001-chatbot-mcp/plan.md - MCP First with OpenAI Agents
        """
        # Build messages array
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT}
        ]

        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        logger.info(f"Processing message for user {self.user_id}: {user_message[:50]}...")

        # Check if this is an update/delete/complete request
        # If so, pre-load tasks to provide context
        update_delete_keywords = ["update", "delete", "remove", "change", "modify", "complete", "finish", "mark"]
        needs_task_list = any(keyword in user_message.lower() for keyword in update_delete_keywords)

        if needs_task_list:
            # Get tasks first and add to context
            list_tool = self.mcp_server.get_tool("list_tasks")
            if list_tool:
                tasks_result = await list_tool.handler(user_id=str(self.user_id), include_completed=True)
                if tasks_result.get("success") and tasks_result.get("tasks"):
                    # Add task context to system prompt
                    task_list = "\n".join([
                        f"Task {i+1}: ID={t['id']}, Title='{t['title']}', Completed={t['completed']}"
                        for i, t in enumerate(tasks_result["tasks"])
                    ])
                    enhanced_prompt = self.SYSTEM_PROMPT + f"\n\nCURRENT USER TASKS:\n{task_list}\n\nWhen user refers to a task by number or title, use the corresponding ID from this list."
                    messages[0] = {"role": "system", "content": enhanced_prompt}
                    logger.info(f"Pre-loaded {len(tasks_result['tasks'])} tasks for context")

        try:
            # Make chat completion request with tools
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=self.tools,
                tool_choice="auto",  # Let model decide when to use tools
                temperature=0.7,  # Slightly creative but focused
                max_tokens=1000,  # Reasonable response length
            )

            # Process response
            choice = response.choices[0]
            message = choice.message

            # Check if model wants to call tools
            if message.tool_calls:
                # Execute tool calls and collect results
                tool_messages = []
                for tool_call in message.tool_calls:
                    result = await self._execute_tool_call(tool_call)
                    # Add tool result as a tool message
                    tool_messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result
                    })

                # Add assistant message with tool calls
                messages.append({
                    "role": "assistant",
                    "content": message.content or "",
                    "tool_calls": message.tool_calls
                })

                # Add tool result messages
                messages.extend(tool_messages)

                # Get follow-up response with tool results
                follow_up = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000,
                )

                if follow_up.choices[0].message.content:
                    yield follow_up.choices[0].message.content

            # Direct text response (no tools needed)
            elif message.content:
                yield message.content

            else:
                yield "I understand. How can I help you with your tasks?"

        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            logger.error(f"Error processing message: {error_type}: {error_msg}", exc_info=True)

            # Provide more helpful error messages
            if "Connection" in error_msg or "connect" in error_msg.lower():
                yield "I'm having trouble connecting to my AI service. Please check if the OpenAI API key is configured correctly in Railway environment variables."
            elif "401" in error_msg or "Unauthorized" in error_msg or "authentication" in error_msg.lower():
                yield "My AI service credentials are invalid. Please check the OpenAI API key in Railway environment variables."
            elif "rate" in error_msg.lower() or "limit" in error_msg.lower():
                yield "I've reached my rate limit. Please try again in a moment."
            else:
                yield f"I encountered an error ({error_type}): {error_msg}"

    async def _execute_tool_call(self, tool_call) -> str:
        """
        Execute a single tool call from OpenAI.

        Args:
            tool_call: The OpenAI tool call object

        Returns:
            Result message to display to user

        Per @specs/001-chatbot-mcp/plan.md - MCP First architecture
        """
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)

        # Inject user_id for data isolation
        function_args["user_id"] = str(self.user_id)

        logger.info(f"Executing tool: {function_name} with args: {function_args}")

        try:
            # Get the tool from SimpleMCPRegistry
            tool = self.mcp_server.get_tool(function_name)

            if not tool:
                return f"Error: Tool '{function_name}' not found"

            # For update_task and delete_task, validate task_id exists first
            if function_name in ["update_task", "delete_task", "complete_task"]:
                task_id = function_args.get("task_id")
                if task_id:
                    # Verify the task exists and belongs to user before proceeding
                    list_tool = self.mcp_server.get_tool("list_tasks")
                    tasks_result = await list_tool.handler(user_id=str(self.user_id), include_completed=True)
                    valid_task_ids = [t["id"] for t in tasks_result.get("tasks", [])]

                    if task_id not in valid_task_ids:
                        # Task doesn't exist or doesn't belong to user
                        # Provide helpful error with current tasks
                        if tasks_result.get("tasks"):
                            task_list = "\n".join([
                                f"Task {i+1}: {t['title']}"
                                for i, t in enumerate(tasks_result["tasks"])
                            ])
                            return f"Error: Task not found. Here are your current tasks:\n{task_list}\n\nPlease specify which task you'd like to {function_name.replace('_', ' ')}."
                        else:
                            return "Error: You don't have any tasks yet. Create some tasks first!"

            # Execute the tool via MCP
            result = await tool.handler(**function_args)

            # Parse result
            if isinstance(result, dict):
                if result.get("success"):
                    # Format success message based on tool
                    if function_name == "add_task":
                        return f"✓ Task '{result.get('title')}' created successfully!"
                    elif function_name == "complete_task":
                        return f"✓ Task '{result.get('title')}' marked as complete!"
                    elif function_name == "delete_task":
                        return f"✓ Task '{result.get('title')}' deleted."
                    elif function_name == "update_task":
                        return f"✓ Task updated successfully!"
                    elif function_name == "list_tasks":
                        tasks = result.get("tasks", [])
                        count = result.get("count", 0)
                        if count == 0:
                            return "You don't have any tasks yet."
                        # Number tasks for easy reference
                        task_list = "\n".join([
                            f"{i+1}. {t['title']}" + (" ✓" if t['completed'] else "")
                            for i, t in enumerate(tasks)
                        ])
                        return f"You have {count} task(s):\n{task_list}\n\nYou can refer to tasks by number (e.g., \"complete task 1\")"
                    else:
                        return "Operation completed successfully!"
                else:
                    return f"Error: {result.get('error', 'Unknown error')}"

            return str(result)

        except Exception as e:
            logger.error(f"Error executing tool {function_name}: {e}")
            return f"Error executing {function_name}: {str(e)}"


def create_todo_agent(user_id: UUID) -> TodoAgent:
    """
    Factory function to create a TodoAgent instance.

    Args:
        user_id: The user's UUID

    Returns:
        Initialized TodoAgent instance
    """
    return TodoAgent(user_id)
