"""
Generate a test JWT token for API testing.

Run: python generate_token.py
"""
from jose import jwt
from datetime import datetime, timedelta
import uuid

# Your secret (must match .env)
SECRET = "f8aK3mP9nQ2xL5vR7sT4uW8yZ1bC6dF3gH5jK8"

# Generate a test user ID
user_id = str(uuid.uuid4())

# Create JWT payload
payload = {
    "sub": user_id,  # User ID
    "iat": datetime.utcnow(),
    "exp": datetime.utcnow() + timedelta(hours=24)  # Expires in 24 hours
}

# Generate token
token = jwt.encode(payload, SECRET, algorithm="HS256")

print("=" * 60)
print("TEST JWT TOKEN GENERATED")
print("=" * 60)
print(f"\nUser ID: {user_id}")
print(f"\nYour JWT Token:\n{token}")
print(f"\nUse this in Swagger UI:")
print(f"1. Click 'Authorize' button")
print(f"2. Enter: Bearer {token}")
print("=" * 60)
