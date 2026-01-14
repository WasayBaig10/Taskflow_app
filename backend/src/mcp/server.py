"""
MCP Server initialization for Todo task management.

Per @specs/001-chatbot-mcp/plan.md Section VIII - AI Chatbot Architecture
MCP First: All task operations go through MCP SDK for OpenAI Agents integration.

Note: We create a simple tool registry instead of using FastMCP server
to avoid transport initialization issues in embedded mode.
"""
from typing import List, Dict, Any, Callable, Optional, Union
from dataclasses import dataclass


@dataclass
class Tool:
    """Simple tool definition for task management."""
    name: str
    description: str
    parameters: Dict[str, Any]
    handler: Callable


class SimpleMCPRegistry:
    """Simple tool registry for MCP-compatible tools without server overhead."""

    def __init__(self, name: str, instructions: str):
        self.name = name
        self.instructions = instructions
        self._tools: Dict[str, Tool] = {}

    def tool(self, name: Optional[str] = None, description: Optional[str] = None):
        """Decorator to register tools."""
        def decorator(func: Callable):
            tool_name = name or func.__name__
            self._tools[tool_name] = Tool(
                name=tool_name,
                description=description or func.__doc__ or "",
                parameters=self._get_parameters_from_func(func),
                handler=func
            )
            return func
        return decorator

    def _get_parameters_from_func(self, func: Callable) -> Dict[str, Any]:
        """Extract parameters from function signature."""
        import inspect
        sig = inspect.signature(func)
        properties = {}
        required = []

        for param_name, param in sig.parameters.items():
            param_type = param.annotation if param.annotation != inspect.Parameter.empty else "string"
            properties[param_name] = {
                "type": self._get_type_string(param_type),
                "description": f"{param_name} parameter"
            }
            if param.default == inspect.Parameter.empty:
                required.append(param_name)

        return {
            "type": "object",
            "properties": properties,
            "required": required
        }

    def _get_type_string(self, type_hint) -> str:
        """Convert type hint to JSON schema type string."""
        type_map = {
            str: "string",
            int: "integer",
            float: "number",
            bool: "boolean",
            list: "array",
            dict: "object"
        }
        if type_hint in type_map:
            return type_map[type_hint]
        # Handle Optional types and other generics
        if hasattr(type_hint, "__origin__"):
            origin = getattr(type_hint, "__origin__", None)
            if origin is Union:
                return "string"
            if origin is list:
                return "array"
        return "string"

    def list_tools(self) -> List[Tool]:
        """List all registered tools."""
        return list(self._tools.values())

    def get_tool(self, name: str) -> Optional[Tool]:
        """Get a tool by name."""
        return self._tools.get(name)


# Create the tool registry
mcp_server = SimpleMCPRegistry(
    name="todo-mcp-server",
    instructions="MCP server for Todo task management operations. Provides tools for creating, listing, completing, deleting, and updating tasks with user isolation."
)


def get_mcp_server() -> SimpleMCPRegistry:
    """
    Get the MCP server/tool registry instance.

    Returns:
        The configured tool registry with all tools registered.

    This function is called by the FastAPI application during startup
    to initialize the MCP server lifecycle.
    """
    # Import and register tools
    from src.mcp.tools import register_task_tools
    register_task_tools(mcp_server)

    return mcp_server
