"""
FastAPI dependencies for authentication and authorization.

Per @specs/001-auth-api-bridge/research.md - FastAPI Dependencies pattern
"""
from fastapi import Depends, HTTPException, Request, status
from src.services.auth import verify_token


async def get_current_user(request: Request) -> str:
    """
    Extract and verify user_id from JWT token.

    This dependency enforces JWT authentication on protected endpoints.
    Per @specs/001-auth-api-bridge/research.md

    Args:
        request: FastAPI request object

    Returns:
        User ID (UUID string) from verified JWT token

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = auth_header.split(" ")[1]
    user_id = await verify_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Attach user_id to request state for use in route handlers
    request.state.user_id = user_id
    return user_id


async def verify_user_ownership(request: Request, user_id: str) -> None:
    """
    Verify that the requested user_id matches the authenticated user.

    This enforces user isolation - users can only access their own resources.
    Per @specs/001-auth-api-bridge/api/rest-endpoints.md security requirements

    Args:
        request: FastAPI request object (contains authenticated user_id in state)
        user_id: User ID from URL path parameter

    Raises:
        HTTPException 403: If user_id doesn't match authenticated user
    """
    current_user = request.state.user_id
    if current_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only access your own resources"
        )
