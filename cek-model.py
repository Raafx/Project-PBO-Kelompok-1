from google import genai

client = genai.Client(api_key="API_KEY_KAMU")

for model in client.models.list():
    if "generateContent" in model.supported_actions:
        print(model.name)