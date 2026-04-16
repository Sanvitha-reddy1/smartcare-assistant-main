from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
import joblib
from dotenv import load_dotenv
import os
import re

# ------------------ SETUP ------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

client = MongoClient(os.getenv("MONGO_URI"))
db = client["health_db"]
history_collection = db["history"]

print("API STARTED")

# ------------------ LOAD MODEL + DATA ------------------
model = joblib.load("disease_prediction_model.pkl")
df = pd.read_csv("Testing.csv")

all_symptoms = list(df.columns[:-1])

# ------------------ CLEAN INPUT ------------------
def clean_input(raw):
    if isinstance(raw, list):
        text = " ".join(raw)
    else:
        text = raw

    text = text.lower()

    stopwords = {"i", "have", "feel", "and", "the", "a"}
    words = re.findall(r'\b\w+\b', text)

    return [w for w in words if w not in stopwords]

# ------------------ SYMPTOM MAPPING ------------------
mapping = {
    "stomach": "abdominal_pain",
    "stomach pain": "abdominal_pain",
    "runny": "runny_nose",
    "breathlessness": "shortness_of_breath",
    "tired": "fatigue",
    "cold": "common_cold",
    "cramps": "abdominal_pain"
}

def map_symptoms(symptoms):
    return [mapping.get(s, s) for s in symptoms]

# ------------------ VECTORIZE ------------------
def vectorize(user_symptoms):
    return [1 if symptom in user_symptoms else 0 for symptom in all_symptoms]

# ------------------ RELATED SYMPTOMS ------------------
def get_related_symptoms(input_symptoms):
    scores = []

    for _, row in df.iterrows():
        row_symptoms = [col for col in all_symptoms if row[col] == 1]

        match_count = len(set(input_symptoms) & set(row_symptoms))

        if match_count > 0:
            scores.append((match_count, row_symptoms))

    scores.sort(reverse=True, key=lambda x: x[0])

    related = set()
    for _, sym_list in scores[:5]:
        related.update(sym_list)

    return list(related)[:8]

# ------------------ DISEASE DATA ------------------
disease_data = {
    "Common Cold": {
        "doctor": "General Physician",
        "medicines": [
            {"name": "Paracetamol", "usage": "Fever & pain", "timing": "After food"},
            {"name": "Cetirizine", "usage": "Cold & allergy", "timing": "Night"}
        ],
        "remedies": [
            {"name": "Steam Inhalation", "preparation": "Hot water steam", "measurement": "2 times daily"},
            {"name": "Ginger Tea", "preparation": "Boil ginger in water", "measurement": "2 cups daily"}
        ]
    },

    "Gastritis": {
        "doctor": "Gastroenterologist",
        "medicines": [
            {"name": "Omeprazole", "usage": "Acid control", "timing": "Before breakfast"},
            {"name": "Antacid", "usage": "Relief from acidity", "timing": "After meals"}
        ],
        "remedies": [
            {"name": "Banana & Rice", "preparation": "Eat light food", "measurement": "Small portions"},
            {"name": "Ginger Water", "preparation": "Grate ginger in warm water", "measurement": "Sips throughout day"}
        ]
    },

    "Menstrual Cramps": {
        "doctor": "Gynecologist",
        "medicines": [
            {"name": "Ibuprofen", "usage": "Pain relief", "timing": "After food"}
        ],
        "remedies": [
            {"name": "Hot Water Bag", "preparation": "Apply on abdomen", "measurement": "15 mins"},
            {"name": "Light Exercise", "preparation": "Stretching / yoga", "measurement": "Daily"}
        ]
    }
}

# ------------------ MAIN API ------------------
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    raw = data['symptoms']

    # Step 1: Clean + Map
    symptoms = clean_input(raw)
    symptoms = map_symptoms(symptoms)

    print("FINAL SYMPTOMS:", symptoms)

    # Step 2: RULE BASED (strong layer)
    if "fever" in symptoms and "cough" in symptoms:
        prediction = "Common Cold"

    elif "abdominal_pain" in symptoms or "nausea" in symptoms:
        prediction = "Gastritis"

    elif "period" in symptoms or "cramps" in symptoms:
        prediction = "Menstrual Cramps"

    else:
        vector = vectorize(symptoms)
        prediction = model.predict([vector])[0]

    # Step 3: Severity
    if "chest" in symptoms:
        severity = "critical"
    elif len(symptoms) > 4:
        severity = "moderate"
    else:
        severity = "mild"

    # Step 4: Related Symptoms
    related = get_related_symptoms(symptoms)

    # Step 5: Dynamic Data
    info = disease_data.get(prediction, {
        "doctor": "General Physician",
        "medicines": [],
        "remedies": []
    })

    # Step 6: Save History
    history_collection.insert_one({
        "symptoms": symptoms,
        "disease": prediction,
        "severity": severity,
        "doctor": info["doctor"]
    })

    # Step 7: Response
    return jsonify({
        "disease": prediction,
        "severity": severity,
        "doctorType": info["doctor"],
        "relatedSymptoms": related,
        "remedies": info["remedies"],
        "medicines": info["medicines"]
    })


# ------------------ HISTORY API ------------------
@app.route('/history', methods=['GET'])
def get_history():
    data = list(history_collection.find({}, {"_id": 0}))
    return jsonify(data)


# ------------------ RUN ------------------
if __name__ == '__main__':
    app.run(debug=True)