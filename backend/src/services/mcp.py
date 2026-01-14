"""
MCP service wrapper for MCP server lifecycle management.

Per @specs/001-chatbot-mcp/plan.md Section VIII - AI Chatbot Architecture
MCP First: All task operations go through MCP SDK for OpenAI Agents integration.

This service manages the MCP server lifecycle including startup, shutdown,
and tool registration.
"""
from typing import Optional, Any, Dict
from contextlib import asynccontextmanager
import logging

from src.mcp.server import get_mcp_server

logger = logging.getLogger(__name__)


class MCPService:
    """
    Service wrapper for MCP server lifecycle management.

    This class provides a singleton interface to the MCP server,
    managing its lifecycle and providing access to tool execution.
    """

    _instance: Optional["MCPService"] = None
    _server: Optional[Any] = None

    def __new__(cls) -> "MCPService":
        """Singleton pattern to ensure only one MCP server instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def initialize(self) -> None:
        """
        Initialize the MCP server and register all tools.

        This should be called during FastAPI application startup.
        Per @specs/001-chatbot-mcp/plan.md, MCP server starts with the FastAPI app.
        """
        if self._server is None:
            try:
                self._server = get_mcp_server()
                logger.info("MCP server initialized successfully with todo-mcp-server")
            except Exception as e:
                logger.error(f"Failed to initialize MCP server: {e}")
                raise

    async def shutdown(self) -> None:
        """
        Shutdown the MCP server gracefully.

        This should be called during FastAPI application shutdown.
        """
        if self._server is not None:
            try:
                # FastMCP handles cleanup automatically
                logger.info("MCP server shut down successfully")
            except Exception as e:
                logger.error(f"Error during MCP server shutdown: {e}")

    def get_server(self) -> Any:
        """
        Get the MCP server instance.

        Returns:
            The FastMCP server instance

        Raises:
            RuntimeError: If server has not been initialized
        """
        if self._server is None:
            raise RuntimeError("MCP server not initialized. Call initialize() first.")
        return self._server

    async def list_tools(self) -> list[Dict[str, Any]]:
        """
        List all available MCP tools.

        Returns:
            List of tool definitions with name, description, and schemas

        Per @specs/001-chatbot-mcp/contracts/mcp-tools.json
        """
        server = self.get_server()
        # FastMCP stores tools in _tool_manager
        if hasattr(server, '_tool_manager'):
            tools = server._tool_manager.list_tools()
            return [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "input_schema": tool.inputSchema,
                    "output_schema": tool.outputSchema if hasattr(tool, 'outputSchema') else None
                }
                for tool in tools
            ]
        return []

    def get_tool_info(self) -> Dict[str, Any]:
        """
        Get information about available MCP tools.

        Returns:
            Dict with tool count, server info, and tool names

        Useful for debugging and monitoring.
        """
        server = self.get_server()
        return {
            "server_name": getattr(server, 'name', 'todo-mcp-server'),
            "initialized": self._server is not None,
            "tool_count": len(server.list_tools()) if hasattr(server, 'list_tools') else 0
        }

    def _get_tool_names(self) -> list[str]:
        """Get list of registered tool names."""
        server = self.get_server()
        if hasattr(server, 'list_tools'):
            tools = server.list_tools()
            return [tool.name for tool in tools]
        return []


# Singleton instance
mcp_service = MCPService()


@asynccontextmanager
async def mcp_lifespan():
    """
    Async context manager for MCP server lifecycle.

    Usage in FastAPI:
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            async with mcp_lifespan():
                yield

    Per @specs/001-chatbot-mcp/plan.md, MCP server lifecycle tied to FastAPI app.
    """
    try:
        await mcp_service.initialize()
        yield
    finally:
        await mcp_service.shutdown()
