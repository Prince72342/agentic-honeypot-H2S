import requests
import json

url = "http://localhost:8000/honeypot"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "12345"
}

data = {
    "sessionId": "test-gemini-session",
    "message": {
        "text": "Your SBI account is blocked. Send OTP to unlock.",
        "sender": "scammer"
    },
    "conversationHistory": []
}

response = requests.post(url, headers=headers, json=data)
print(json.dumps(response.json(), indent=2))
