import requests

url = "http://127.0.0.1:5000/analyze"

test_cases = [
    "chest pain and breathlessness", # Rule based: Heart attack
    "fever with cough for 2 days and sore throat", # Rule based: Common Cold
    "stomach pain and vomiting", # ML model or Rule based
    "I have itching and skin rash", # ML model
    "My eye is hurting", # Low confidence
]

for case in test_cases:
    print(f"\n--- Testing: {case} ---")
    try:
        response = requests.post(url, json={"symptoms": case})
        print(response.json())
    except Exception as e:
        print(f"Error: {e}")
