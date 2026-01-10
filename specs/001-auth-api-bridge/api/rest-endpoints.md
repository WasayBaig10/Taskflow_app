# REST API Endpoints Specification

**Feature**: 001-auth-api-bridge
**Purpose**: Define the technical bridge between Better Auth JWT tokens and FastAPI protected endpoints
**Version**: 1.0.0

## Authentication Mechanism

### JWT Token Structure

FastAPI will validate JWT tokens issued by Better Auth using the following configuration:

**Environment Variables:**
- `BETTER_AUTH_SECRET`: Shared secret used to sign and verify JWT tokens
- `BETTER_AUTH_URL`: Origin URL of the Better Auth service (for token verification if needed)

**Token Format (JWT):**
```
header.payload.signature

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user_id",           # User's unique identifier (UUID or string)
  "iat": 1234567890,          # Issued at timestamp
  "exp": 1234567890           # Expiration timestamp
}
```

### Middleware Verification Flow

```python
# Pseudocode for FastAPI middleware
async def verify_jwt_middleware(request: Request):
    # 1. Extract Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    # 2. Extract token
    token = auth_header.split(" ")[1]

    # 3. Verify token signature using BETTER_AUTH_SECRET
    try:
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    # 4. Check expiration
    if payload.get("exp", 0) < current_timestamp():
        raise HTTPException(status_code=401, detail="Token expired")

    # 5. Extract user_id from sub claim
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing user identifier")

    # 6. Attach user_id to request state for use in route handlers
    request.state.user_id = user_id

    # 7. Proceed to next handler/middleware
    await next_handler(request)
```

## Protected Endpoints

All task management endpoints require valid JWT authentication. The `user_id` extracted from the token is used to:

1. **Authorize requests**: Ensure the user can only access their own resources
2. **Scope database queries**: Filter all task queries by `user_id`
3. **Audit logging**: Track which user performed which actions

### GET /api/{user_id}/tasks

List all tasks for the authenticated user.

**Security**: The `user_id` in the path MUST match the `user_id` from the JWT token.

**Request:**
```http
GET /api/{user_id}/tasks HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "completed": false,
      "created_at": "2026-01-07T10:00:00Z",
      "completed_at": null
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `401 Unauthorized`: Missing, invalid, or expired JWT token
- `403 Forbidden`: `user_id` in path does not match JWT `sub` claim

### POST /api/{user_id}/tasks

Create a new task for the authenticated user.

**Request:**
```http
POST /api/{user_id}/tasks HTTP/1.1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "New task title",
  "description": "Optional description"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "New task title",
  "description": "Optional description",
  "completed": false,
  "created_at": "2026-01-07T10:00:00Z",
  "completed_at": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body (missing title, etc.)
- `401 Unauthorized`: Missing, invalid, or expired JWT token
- `403 Forbidden`: `user_id` in path does not match JWT `sub` claim

### GET /api/{user_id}/tasks/{task_id}

Retrieve details of a specific task.

**Security**: Must verify both that the `user_id` matches the JWT AND that the task belongs to this user.

**Request:**
```http
GET /api/{user_id}/tasks/{task_id} HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "created_at": "2026-01-07T10:00:00Z",
  "completed_at": null
}
```

**Error Responses:**
- `401 Unauthorized`: Missing, invalid, or expired JWT token
- `403 Forbidden`: `user_id` in path does not match JWT `sub` claim, or task belongs to different user
- `404 Not Found`: Task does not exist

### PATCH /api/{user_id}/tasks/{task_id}/complete

Mark a specific task as completed. This is the primary endpoint specified in the requirements.

**Security**: Must verify both that the `user_id` matches the JWT AND that the task belongs to this user before updating.

**Request:**
```http
PATCH /api/{user_id}/tasks/{task_id}/complete HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Request Body:** Empty (no request body needed)

**Pydantic Request Model:**
```python
from pydantic import BaseModel

class CompleteTaskRequest(BaseModel):
    pass  # No fields required - action is implicit in the endpoint path
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "completed": true,
  "created_at": "2026-01-07T10:00:00Z",
  "completed_at": "2026-01-07T11:30:00Z"
}
```

**Pydantic Response Model:**
```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the auth bridge feature",
                "completed": true,
                "created_at": "2026-01-07T10:00:00Z",
                "completed_at": "2026-01-07T11:30:00Z"
            }
        }
```

**Error Responses:**
- `401 Unauthorized`: Missing, invalid, or expired JWT token
- `403 Forbidden`: `user_id` in path does not match JWT `sub` claim, or task belongs to different user
- `404 Not Found`: Task does not exist
- `409 Conflict`: Task is already completed (optional - could also just return current state)

**Idempotency:** Calling this endpoint multiple times for the same task should not cause errors. If the task is already completed, return the current state with 200 OK.

### DELETE /api/{user_id}/tasks/{task_id}

Delete a specific task.

**Request:**
```http
DELETE /api/{user_id}/tasks/{task_id} HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (204 No Content):** Empty body

**Error Responses:**
- `401 Unauthorized`: Missing, invalid, or expired JWT token
- `403 Forbidden`: `user_id` in path does not match JWT `sub` claim, or task belongs to different user
- `404 Not Found`: Task does not exist

## Common Error Response Format

All error responses follow this consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Pydantic Error Response Model:**
```python
from pydantic import BaseModel
from typing import Dict, Any

class ErrorResponse(BaseModel):
    error: Dict[str, Any]

    class Config:
        json_schema_extra = {
            "example": {
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid or expired authentication token",
                    "details": {}
                }
            }
        }
```

**Common Error Codes:**
- `UNAUTHORIZED`: 401 - Authentication failed or token invalid
- `FORBIDDEN`: 403 - User lacks permission for this resource
- `NOT_FOUND`: 404 - Resource does not exist
- `VALIDATION_ERROR`: 400 - Request body validation failed
- `CONFLICT`: 409 - Resource state conflicts with operation

## Security Considerations

1. **Token Validation**: Every request to a protected endpoint MUST validate the JWT signature and expiration
2. **User ID Matching**: The `user_id` in the URL path MUST match the `sub` claim from the JWT
3. **Ownership Verification**: Before performing any operation on a task, verify the task's `user_id` matches the authenticated user
4. **No Bypass**: All database queries MUST include the `user_id` filter; never query by `task_id` alone
5. **Timing Attacks**: Use constant-time comparison for token validation when applicable
6. **Error Messages**: Keep error messages generic to avoid information leakage (don't reveal if a user exists, etc.)

## OpenAPI Specification

The FastAPI application will auto-generate OpenAPI documentation including:

- All endpoints with proper HTTP methods
- Request/response schemas using Pydantic models
- Security scheme for JWT Bearer authentication
- Example requests and responses
- Error response schemas

Example security scheme definition for OpenAPI:
```yaml
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
```
