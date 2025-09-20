#!/usr/bin/env python3
"""
Quick URL updater for Colab backend integration
Run this script to easily update the backend URL in your frontend
"""

import re
import os

def update_backend_url(new_url):
    """Update the backend URL in the route.ts file"""
    
    # Ensure URL has proper format
    if not new_url.startswith('http'):
        new_url = f"https://{new_url}"
    
    if not new_url.endswith('/analyze'):
        new_url = f"{new_url}/analyze"
    
    # File path
    route_file = "app/api/analyze/route.ts"
    
    if not os.path.exists(route_file):
        print(f"❌ File not found: {route_file}")
        return False
    
    try:
        # Read the file
        with open(route_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update the URL
        pattern = r'const pythonBackendUrl = process\.env\.PYTHON_BACKEND_URL \|\| "https://[^"]*"'
        replacement = f'const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "{new_url}"'
        
        new_content = re.sub(pattern, replacement, content)
        
        if new_content == content:
            print("⚠️ No URL found to update. Make sure the file has the expected format.")
            return False
        
        # Write back to file
        with open(route_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Successfully updated backend URL to: {new_url}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating file: {e}")
        return False

def main():
    print("🚀 SIH Sentiment Analysis - URL Updater")
    print("=" * 50)
    
    # Get URL from user
    print("\n📋 Enter your Colab ngrok URL:")
    print("Example: https://abc123.ngrok.io")
    print("Or just: abc123.ngrok.io")
    
    url = input("\n🔗 URL: ").strip()
    
    if not url:
        print("❌ No URL provided. Exiting.")
        return
    
    # Update the URL
    if update_backend_url(url):
        print("\n🎉 URL updated successfully!")
        print("\n📋 Next steps:")
        print("1. Start your Next.js frontend: pnpm dev")
        print("2. Open http://localhost:3000")
        print("3. Upload a CSV file to test!")
    else:
        print("\n❌ Failed to update URL. Please check the file manually.")

if __name__ == "__main__":
    main()
