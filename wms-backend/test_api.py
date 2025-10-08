import os
from dotenv import load_dotenv
import requests

load_dotenv('.env')

url = f"{os.getenv('ERPNEXT_URL')}/api/resource/Warehouse"
headers = {
    "Authorization": f"token {os.getenv('ERPNEXT_API_KEY')}:{os.getenv('ERPNEXT_API_SECRET')}"
}

# Simple test - just get first warehouse
response = requests.get(url, headers=headers, params={"limit_page_length": 1})
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}")
