#!/usr/bin/env python3
"""
Startup script for the Sentiment Analysis Backend
This script handles the installation of dependencies and starts the FastAPI server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    return True

def start_server():
    """Start the FastAPI server"""
    print("Starting FastAPI server...")
    try:
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    print("🚀 Starting Sentiment Analysis Backend...")
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Install dependencies
    if install_requirements():
        # Start the server
        start_server()
    else:
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
