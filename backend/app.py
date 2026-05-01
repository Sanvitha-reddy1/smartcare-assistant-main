from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
import joblib
from dotenv import load_dotenv
import os
import re
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# ------------------ SETUP ------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

# ------------------ MONGODB SETUP ------------------
# Safe connection handling
try:
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    # Ping to check connection
    client.admin.command('ping')
    db = client["smartcare"]
    
    # Collections
    users_collection = db["users"]
    history_collection = db["history"]
    appointments_collection = db["appointments"]
    orders_collection = db["orders"]
    
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    db = None

print("API STARTED")

# ------------------ LOAD MODEL + DATA ------------------
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
# def vectorize(user_symptoms):
#     return [1 if symptom in user_symptoms else 0 for symptom in all_symptoms]

# ------------------ RELATED SYMPTOMS ------------------
# def get_related_symptoms(input_symptoms):
#     scores = []

#     for _, row in df.iterrows():
#         row_symptoms = [col for col in all_symptoms if row[col] == 1]

#         match_count = len(set(input_symptoms) & set(row_symptoms))

#         if match_count > 0:
#             scores.append((match_count, row_symptoms))

#     scores.sort(reverse=True, key=lambda x: x[0])

#     related = set()
#     for _, sym_list in scores[:5]:
#         related.update(sym_list)

#     return list(related)[:8]

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
    userId = data.get('userId')  # Can be None for guests

    # Step 1: Clean + Map
    symptoms = clean_input(raw)
    symptoms = map_symptoms(symptoms)

    print("FINAL SYMPTOMS:", symptoms)

    # Step 2: RULE BASED (strong layer)
    # if "fever" in symptoms and "cough" in symptoms:
    #     prediction = "Common Cold"

    # elif "abdominal_pain" in symptoms or "nausea" in symptoms:
    #     prediction = "Gastritis"

    # elif "period" in symptoms or "cramps" in symptoms:
    #     prediction = "Menstrual Cramps"

    # else:
    #     vector = vectorize(symptoms)
    #     prediction = model.predict([vector])[0]

    
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
        "medicines": [
            {"name": "General Medication", "usage": "As prescribed", "timing": "Consult doctor"}
        ],
        "remedies": [
            {"name": "Rest and Hydration", "preparation": "Drink plenty of water and rest", "measurement": "Daily"},
            {"name": "Maintain Hygiene", "preparation": "Keep surroundings clean", "measurement": "Always"}
        ]
    })

    # Step 6: Save History
    if db is not None:
        try:
            history_collection.insert_one({
                "userId": userId,
                "symptoms": symptoms,
                "disease": prediction,
                "severity": severity,
                "doctorType": info["doctor"],
                "createdAt": datetime.datetime.utcnow()
            })
        except Exception as e:
            print("Error saving history:", e)

    # Step 7: Response
    return jsonify({
        "disease": prediction,
        "severity": severity,
        "doctorType": info["doctor"],
        "relatedSymptoms": related,
        "remedies": info["remedies"],
        "medicines": info["medicines"]
    })


# ------------------ AUTH APIs ------------------
"""
User Schema reference:
{
  name: string,
  email: string,
  password: string (hashed),
  role: "patient" | "doctor" | "pharmacist",
  location: string,
  createdAt: datetime
}
"""

@app.route('/signup', methods=['POST'])
def signup():
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "patient")
    location = data.get("location", "")

    if not all([name, email, password, role]):
        return jsonify({"error": "Missing required fields: name, email, password, role"}), 400

    if role not in ["patient", "doctor", "pharmacist"]:
        return jsonify({"error": "Invalid role. Allowed: patient, doctor, pharmacist"}), 400

    # Check if user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 400

    hashed_password = generate_password_hash(password)

    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role,
        "location": location,
        "createdAt": datetime.datetime.utcnow()
    }

    try:
        users_collection.insert_one(new_user)
        return jsonify({"message": f"User ({role}) created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = users_collection.find_one({"email": email})
    
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "location": user.get("location", ""),
            "age": user.get("age", ""),
            "gender": user.get("gender", ""),
            "height": user.get("height", ""),
            "weight": user.get("weight", ""),
            "phone": user.get("phone", "")
        }
    }), 200

@app.route('/profile', methods=['PUT'])
def update_profile():
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Missing email"}), 400

    update_fields = {}
    for field in ["name", "age", "gender", "height", "weight", "phone", "location"]:
        if field in data:
            update_fields[field] = data[field]

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        users_collection.update_one(
            {"email": email},
            {"$set": update_fields}
        )
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------ HISTORY API ------------------
@app.route('/history', methods=['GET'])
def get_history():
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = list(history_collection.find({}, {"_id": 0}))
    return jsonify(data)


# ------------------ RUN ------------------
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)