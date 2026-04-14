from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
import joblib
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["health_db"]
history_collection = db["history"]

print("API HIT")
model = joblib.load("disease_prediction_model.pkl")

df = pd.read_csv("Testing.csv")   # your dataset file name
all_symptoms = list(df.columns[:-1])   # remove disease column

def vectorize(user_symptoms):
    user_symptoms = [s.lower() for s in user_symptoms]
    return [1 if symptom.lower() in user_symptoms else 0 for symptom in all_symptoms]
    
app = Flask(__name__)
CORS(app)
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    raw = data['symptoms']

    # handle both cases
    if isinstance(raw, list):
        symptoms = []
        for item in raw:
            symptoms.extend(item.lower().split(","))
            symptoms.extend(item.lower().split(" "))
    else:
        symptoms = raw.lower().split()

    # remove empty words
    symptoms = [s.strip() for s in symptoms if s.strip()]

    print("FINAL SYMPTOMS:", symptoms)
    print("API HIT:", symptoms)

    #    ✅ RULE-BASED CHECK FIRST
    if ("fever" in symptoms and "cough" in symptoms and 
        ("runny" in symptoms or "nose" in symptoms or "sore" in symptoms)):
        prediction = "Common Cold"

    # Menstrual case
    elif ("period" in symptoms or "menstrual" in symptoms):
        prediction = "Menstrual Cramps"

    # Food poisoning
    elif ("vomiting" in symptoms and "diarrhea" in symptoms):
        prediction = "Food Poisoning"

    # Migraine
    elif ("headache" in symptoms and "sensitivity" in symptoms):
        prediction = "Migraine"

    # Chest pain (critical)
    elif ("chest" in symptoms and "pain" in symptoms):
        prediction = "Possible Heart Issue"
    else:
        # ML only if no rule matched
        vector = vectorize(symptoms)
        prediction = model.predict([vector])[0]

    if "chest" in symptoms:
        severity = "critical"
    elif len(symptoms) > 4:
        severity = "moderate"
    else:
        severity = "mild"

    # ✅ ALWAYS define default first
    doctor = "General Physician"

    if prediction == "Common Cold":     
        doctor = "General Physician"

    elif prediction == "Menstrual Cramps":
        doctor = "Gynecologist"

    elif prediction == "Food Poisoning":
        doctor = "Gastroenterologist"

    elif "Heart" in prediction:
        doctor = "Cardiologist"

    elif prediction == "Hypertension":
        doctor = "Cardiologist"       

    history_collection.insert_one({
    "symptoms": symptoms,
    "disease": prediction,
    "severity": severity,
    "doctor": doctor
    })

    return jsonify({
        "disease": prediction,
        "severity": severity,
        "doctorType": doctor,
        "remedies": [
            {
                "name": "Ginger Tea",
                "preparation": "Boil ginger in water",
                "measurement": "1 cup daily"
            }
        ],
        "medicines": [
            {
                "name": "Paracetamol",
                "usage": "Pain relief",
                "timing": "After food"
            }
        ]
    })   

@app.route('/history', methods=['GET'])
def get_history():
    data = list(history_collection.find({}, {"_id": 0}))
    return jsonify(data)
    
if __name__ == '__main__':
    app.run(debug=True)