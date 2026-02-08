import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key present: {bool(api_key)}")

if api_key:
    try:
        genai.configure(api_key=api_key)
        with open("models_list.txt", "w", encoding="utf-8") as f:
            f.write("Listing models...\n")
            found_any = False
            for m in genai.list_models():
                if 'embedContent' in m.supported_generation_methods:
                    f.write(f"- {m.name}\n")
                    found_any = True
            if not found_any:
                f.write("No models found with 'embedContent' support.\n")
    except Exception as e:
        with open("models_list.txt", "w", encoding="utf-8") as f:
            f.write(f"Error: {e}\n")
else:
    with open("models_list.txt", "w", encoding="utf-8") as f:
        f.write("Cannot check models without API key.\n")
