import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing API Key: {api_key[:5]}...{api_key[-5:]}")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Hello, respond with "API Key is working!" if you can read this.'
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
