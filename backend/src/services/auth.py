"""
JWT verification service for Better Auth integration.

Per @specs/001-auth-api-bridge/research.md
"""
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from src.config import settings
import uuid

SECRET_KEY = settings.better_auth_secret
ALGORITHM = "HS256"

# In-memory store for password reset tokens (in production, use Redis or database)
PASSWORD_RESET_TOKENS: Dict[str, dict] = {}


def create_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token for a user.

    Args:
        user_id: User UUID to embed in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)

    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": expire
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def verify_token(token: str) -> Optional[str]:
    """
    Verify JWT token and return user_id.

    Args:
        token: JWT token string

    Returns:
        User ID (UUID string) if token is valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None


def create_password_reset_token(email: str) -> str:
    """
    Create a password reset token for an email.

    Args:
        email: User's email address

    Returns:
        Password reset token
    """
    reset_token = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour

    PASSWORD_RESET_TOKENS[reset_token] = {
        "email": email,
        "expires": expiry
    }

    return reset_token


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify password reset token and return email.

    Args:
        token: Password reset token

    Returns:
        Email if token is valid, None otherwise
    """
    if token not in PASSWORD_RESET_TOKENS:
        return None

    token_data = PASSWORD_RESET_TOKENS[token]

    # Check if token has expired
    if datetime.utcnow() > token_data["expires"]:
        del PASSWORD_RESET_TOKENS[token]
        return None

    return token_data["email"]


def consume_password_reset_token(token: str) -> bool:
    """
    Consume (invalidate) a password reset token after use.

    Args:
        token: Password reset token to consume

    Returns:
        True if token was valid and consumed, False otherwise
    """
    if token in PASSWORD_RESET_TOKENS:
        del PASSWORD_RESET_TOKENS[token]
        return True
    return False
