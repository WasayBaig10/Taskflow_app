"""
Helper script to restart the backend server cleanly.
Run this script instead of manually restarting uvicorn.
"""
import subprocess
import sys
import os

def start_backend():
    """Start the backend server."""
    print("Starting backend server...")
    print("=" * 60)
    print("Backend will be available at: http://localhost:8000")
    print("API docs available at: http://localhost:8000/docs")
    print("=" * 60)
    print()
    print("NOTE: If you get 'port already in use' error:")
    print("1. Find the process: netstat -ano | findstr :8000")
    print("2. Kill it: taskkill /PID <PID> /F")
    print()
    print("-" * 60)
    print()

    # Change to backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Start uvicorn
    subprocess.run([
        sys.executable, "-m", "uvicorn", "src.main:app",
        "--reload", "--host", "0.0.0.0", "--port", "8000"
    ])

if __name__ == "__main__":
    print("Backend Server Start Script")
    print("=" * 60)
    print()

    # Start new backend
    start_backend()
