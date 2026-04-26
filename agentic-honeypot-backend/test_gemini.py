import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Testing API Key: {api_key[:5]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, respond with 'API Key is working!' if you can read this.")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
