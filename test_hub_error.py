import requests
import json

BASE_URL = "http://localhost/api"
login_payload = {
    "email": "admin@scalareye.com",
    "password": "admin@123"
}
res = requests.post(f"{BASE_URL}/users/token/", json=login_payload)
token = res.json()["access"]
headers = {"Authorization": f"Bearer {token}"}
res2 = requests.get(f"{BASE_URL}/analysis/hubs/", headers=headers)
print("Status:", res2.status_code)
print("Body:", res2.text)
