from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
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
# Removed machine learning models as requested

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

# ------------------ RELATED SYMPTOMS ------------------
def get_related_symptoms(input_symptoms):
    related = set()
    if "fever" in input_symptoms or "cough" in input_symptoms:
        related.update(["headache", "fatigue", "sore throat"])
    if "abdominal_pain" in input_symptoms or "nausea" in input_symptoms:
        related.update(["vomiting", "diarrhea", "loss of appetite"])
    if "period" in input_symptoms or "cramps" in input_symptoms:
        related.update(["back pain", "bloating", "mood swings"])
    if "itching" in input_symptoms or "rash" in input_symptoms:
        related.update(["redness", "swelling", "dry skin"])
    if "headache" in input_symptoms or "sensitivity" in input_symptoms:
        related.update(["nausea", "dizziness", "blurred vision"])
    if "chest" in input_symptoms or "pain" in input_symptoms:
        related.update(["shortness of breath", "sweating", "fatigue"])
        
    return list(related)[:5]

from disease_data import get_disease_info

# ------------------ MAIN API ------------------
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    raw = data.get('symptoms', [])
    userId = data.get('userId')  # Can be None for guests
    location = data.get("location", "Unknown Area")
    if not location.strip():
        location = "Unknown Area"

    # Step 1: Clean + Map
    symptoms = clean_input(raw)
    symptoms = map_symptoms(symptoms)

    print("FINAL SYMPTOMS:", symptoms)

    # Step 2: RULE BASED (strong layer)
    if "fever" in symptoms and "cough" in symptoms:
        prediction = "Common Cold"
    elif "fever" in symptoms:
        prediction = "Viral Fever"
    elif "itching" in symptoms or "rash" in symptoms:
        prediction = "Allergy"
    elif "vomiting" in symptoms and "diarrhea" in symptoms:
        prediction = "Food Poisoning"
    elif "headache" in symptoms and ("sensitivity" in symptoms or "light" in symptoms):
        prediction = "Migraine"
    elif "headache" in symptoms:
        prediction = "Migraine"
    elif "abdominal_pain" in symptoms or "nausea" in symptoms or "stomach" in symptoms:
        prediction = "Gastritis"
    elif "period" in symptoms or "cramps" in symptoms:
        prediction = "Menstrual Cramps"
    elif "chest" in symptoms and "pain" in symptoms:
        prediction = "Heart attack"
    else:
        prediction = "General Health Issue"

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
    info = get_disease_info(prediction)

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

    mock_hospitals = [
        {
            "name": "Apollo Super Specialty Hospital",
            "area": location,
            "distance": "2.5 km",
            "travelTime": "10 mins",
            "fee": "₹500"
        },
        {
            "name": "Care Hospitals",
            "area": location,
            "distance": "4.2 km",
            "travelTime": "15 mins",
            "fee": "₹800"
        }
    ]

    mock_pharmacies = [
        {
            "name": "MedPlus Pharmacy",
            "area": location,
            "distance": "1.0 km",
            "deliveryTime": "30 mins"
        },
        {
            "name": "Apollo Pharmacy",
            "area": location,
            "distance": "1.5 km",
            "deliveryTime": "45 mins"
        }
    ]

    # Step 7: Response
    return jsonify({
        "disease": prediction,
        "severity": severity,
        "doctorType": info["doctor"],
        "relatedSymptoms": related,
        "remedies": info["remedies"],
        "medicines": info["medicines"],
        "hospitals": mock_hospitals,
        "pharmacies": mock_pharmacies
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
        "createdAt": datetime.datetime.now(datetime.timezone.utc)
    }

    if role == "doctor":
        new_user["hospitalName"] = data.get("hospitalName", "")
        new_user["specialization"] = data.get("specialization", "")
        new_user["experience"] = data.get("experience", "")
    elif role == "pharmacist":
        new_user["pharmacyName"] = data.get("pharmacyName", "")
        new_user["licenseNumber"] = data.get("licenseNumber", "")

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
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Handle both plain text (legacy) and hashed passwords securely
    is_valid_password = False
    if "password" in user:
        if user["password"] == password:
            is_valid_password = True
        else:
            try:
                if check_password_hash(user["password"], password):
                    is_valid_password = True
            except ValueError:
                pass # Not a valid hash format
                
    if not is_valid_password:
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
            "phone": user.get("phone", ""),
            "hospitalName": user.get("hospitalName", ""),
            "specialization": user.get("specialization", ""),
            "experience": user.get("experience", ""),
            "pharmacyName": user.get("pharmacyName", ""),
            "licenseNumber": user.get("licenseNumber", "")
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

@app.route('/doctor/history', methods=['POST'])
def add_doctor_history():
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    try:
        data["createdAt"] = datetime.datetime.now(datetime.timezone.utc)
        appointments_collection.insert_one(data)
        return jsonify({"message": "Appointment accepted successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/doctor/history/<user_id>', methods=['GET'])
def get_doctor_history(user_id):
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = list(appointments_collection.find({"doctorId": user_id}, {"_id": 0}).sort("createdAt", -1))
    return jsonify(data)

@app.route('/pharmacist/history', methods=['POST'])
def add_pharmacist_history():
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    try:
        data["createdAt"] = datetime.datetime.now(datetime.timezone.utc)
        orders_collection.insert_one(data)
        return jsonify({"message": "Order delivered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/pharmacist/history/<user_id>', methods=['GET'])
def get_pharmacist_history(user_id):
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500
    data = list(orders_collection.find({"pharmacistId": user_id}, {"_id": 0}).sort("createdAt", -1))
    return jsonify(data)


# ------------------ RUN ------------------
if __name__ == '__main__':
    app.run(debug=True)