"""
Test script to verify login endpoint works.
Run this to check if the backend is functioning properly.
"""
import requests
import time

def test_backend():
    print("=" * 60)
    print("Testing Backend Server")
    print("=" * 60)
    print()

    # Test 1: Health check
    print("[1/3] Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("[OK] Health check passed")
            print(f"  Response: {response.json()}")
        else:
            print(f"[FAIL] Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] Cannot connect to backend: {e}")
        print("\nMake sure the backend is running:")
        print("  cd backend")
        print("  python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000")
        return False

    print()

    # Test 2: Token generation
    print("[2/3] Testing token generation...")
    try:
        response = requests.post(
            "http://localhost:8000/generate-token",
            json={"email": "test@example.com"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print("[OK] Token generation successful")
            print(f"  User ID: {data['userId']}")
            print(f"  Email: {data['email']}")
            print(f"  Token: {data['token'][:30]}...")
            token = data['token']
            user_id = data['userId']
        else:
            print(f"[FAIL] Token generation failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Token generation error: {e}")
        return False

    print()

    # Test 3: API access with token
    print("[3/3] Testing authenticated API access...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"http://localhost:8000/api/{user_id}/tasks",
            headers=headers,
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print("[OK] API access successful")
            print(f"  Tasks count: {data['count']}")
        else:
            print(f"[FAIL] API access failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] API access error: {e}")
        return False

    print()
    print("=" * 60)
    print("ALL TESTS PASSED!")
    print("=" * 60)
    print()
    print("Your backend is working correctly.")
    print("If the frontend still can't connect, check:")
    print("1. Frontend is running (npm run dev)")
    print("2. Browser console for errors (F12)")
    print("3. CORS settings in backend/src/main.py")
    return True

if __name__ == "__main__":
    success = test_backend()
    exit(0 if success else 1)
