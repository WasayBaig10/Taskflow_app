"""
FastAPI application entry point.

Per @specs/001-auth-api-bridge/plan.md and @specs/001-auth-api-bridge/quickstart.md

Includes password reset functionality.
"""
from datetime import datetime, timedelta
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.config import settings
from src.api.routes import tasks_router, health_router
from src.services.auth import create_token, create_password_reset_token, verify_password_reset_token, consume_password_reset_token
from src.services.email import send_password_reset_email


# Create FastAPI application
app = FastAPI(
    title="Task Management API",
    description="FastAPI backend for task management with JWT authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# =============================================================================
# CORS Middleware
# Per @specs/001-auth-api-bridge/quickstart.md
# =============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Register Routes
# =============================================================================
app.include_router(health_router)
app.include_router(tasks_router)


# =============================================================================
# Startup Event
# =============================================================================
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    from src.config import init_db
    init_db()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Task Management API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# =============================================================================
# Demo Token Generation (for testing login page)
# =============================================================================
class TokenRequest(BaseModel):
    email: str


@app.post("/generate-token")
async def generate_token(request: TokenRequest):
    """
    Generate a test JWT token for demo purposes.

    In production, this would be replaced by Better Auth's actual authentication.
    """
    # Generate a user ID (in production, this would come from the database)
    user_id = str(uuid4())

    # Create JWT token
    token = create_token(user_id)

    return {
        "token": token,
        "userId": user_id,
        "email": request.email
    }


# =============================================================================
# Password Reset (Demo Mode)
# =============================================================================
class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    Initiate password reset process.

    Sends an email with a password reset link.
    In demo mode (without email configured), the token is logged and can be used directly.
    """
    # Create a password reset token
    reset_token = create_password_reset_token(request.email)

    # Send password reset email
    email_sent = await send_password_reset_email(
        email=request.email,
        reset_token=reset_token,
        frontend_url="http://localhost:3002"  # In production, use settings.better_auth_url
    )

    # For demo mode, include token in response if email wasn't actually sent
    # In production with real email, never include the token in the response
    include_token = not settings.emails_enabled or not settings.email_username

    response_data = {
        "message": "If an account exists with that email, a password reset link has been sent.",
        "email": request.email
    }

    if include_token:
        response_data["reset_token"] = reset_token
        response_data["demo_mode"] = True

    return response_data


@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Reset password using the token received from forgot-password.

    In production, this would update the user's password in the database.
    For demo purposes, it just validates the token.
    """
    # Verify the reset token
    email = verify_password_reset_token(request.token)

    if email is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    # In production, you would update the password in the database here
    # For demo, we just consume the token
    consume_password_reset_token(request.token)

    return {
        "message": "Password reset successfully",
        "email": email
    }
