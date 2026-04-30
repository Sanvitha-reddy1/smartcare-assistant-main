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
    "Allergy": {
        "doctor": "Allergist",
        "medicines": [
            {"name": "Loratadine", "usage": "Allergy relief", "timing": "Morning"},
            {"name": "Hydrocortisone Cream", "usage": "Rash/Itching", "timing": "Apply twice daily"}
        ],
        "remedies": [
            {"name": "Cold Compress", "preparation": "Apply ice pack to rash", "measurement": "15 mins"},
            {"name": "Oatmeal Bath", "preparation": "Soak in colloidal oatmeal", "measurement": "20 mins"}
        ]
    },
    "Food Poisoning": {
        "doctor": "General Physician / Gastroenterologist",
        "medicines": [
            {"name": "ORS (Oral Rehydration Salts)", "usage": "Hydration", "timing": "After every loose motion"},
            {"name": "Loperamide", "usage": "Diarrhea control", "timing": "As prescribed"}
        ],
        "remedies": [
            {"name": "Hydration", "preparation": "Drink clear fluids", "measurement": "Constantly"},
            {"name": "BRAT Diet", "preparation": "Bananas, Rice, Applesauce, Toast", "measurement": "Small portions"}
        ]
    },
    "Migraine": {
        "doctor": "Neurologist",
        "medicines": [
            {"name": "Sumatriptan", "usage": "Migraine relief", "timing": "Onset of headache"},
            {"name": "Naproxen", "usage": "Pain relief", "timing": "After food"}
        ],
        "remedies": [
            {"name": "Dark Room Rest", "preparation": "Rest in a quiet, dark room", "measurement": "As needed"},
            {"name": "Cold Pack", "preparation": "Apply to forehead", "measurement": "15 mins"}
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
    },
    "Heart Issue": {
        "doctor": "Cardiologist",
        "medicines": [
            {"name": "Aspirin", "usage": "Emergency use", "timing": "Chew immediately if suspected heart attack"}
        ],
        "remedies": [
            {"name": "Rest Immediately", "preparation": "Stop all physical activity", "measurement": "Now"},
            {"name": "Call Emergency", "preparation": "Seek immediate medical help", "measurement": "Urgent"}
        ]
    },
    "General Health Issue": {
        "doctor": "General Physician",
        "medicines": [
            {"name": "General Medication", "usage": "As prescribed", "timing": "Consult doctor"}
        ],
        "remedies": [
            {"name": "Rest and Hydration", "preparation": "Drink plenty of water and rest", "measurement": "Daily"},
            {"name": "Maintain Hygiene", "preparation": "Keep surroundings clean", "measurement": "Always"}
        ]
    }
}

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
    elif "itching" in symptoms or "rash" in symptoms:
        prediction = "Allergy"
    elif "vomiting" in symptoms and "diarrhea" in symptoms:
        prediction = "Food Poisoning"
    elif "headache" in symptoms and ("sensitivity" in symptoms or "light" in symptoms):
        prediction = "Migraine"
    elif "abdominal_pain" in symptoms or "nausea" in symptoms or "stomach" in symptoms:
        prediction = "Gastritis"
    elif "period" in symptoms or "cramps" in symptoms:
        prediction = "Menstrual Cramps"
    elif "chest" in symptoms and "pain" in symptoms:
        prediction = "Heart Issue"
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
    app.run(debug=True)