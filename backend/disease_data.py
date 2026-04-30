# This file contains details for predicted diseases.
# It maps disease name to doctor type, medicines, remedies, severity, and precautions.

disease_data = {
    # 1. Cardiovascular
    "Heart attack": {
        "doctor": "Cardiologist",
        "medicines": [{"name": "Aspirin", "usage": "Blood thinner during emergency", "timing": "Immediately"}],
        "remedies": [
            {"name": "Emergency Medical Help", "preparation": "Call ambulance", "measurement": "Immediate"},
            {"name": "Rest", "preparation": "Sit down and stay calm", "measurement": "Until help arrives"}
        ],
        "precautions": ["Avoid panic", "Do not exert yourself", "Take prescribed emergency meds"],
        "severity": "critical"
    },
    "Hypertension": {
        "doctor": "Cardiologist",
        "medicines": [{"name": "Amlodipine", "usage": "Blood pressure control", "timing": "Morning"}],
        "remedies": [
            {"name": "Reduce Salt Intake", "preparation": "Avoid salty foods", "measurement": "Daily"},
            {"name": "Exercise", "preparation": "Brisk walking", "measurement": "30 mins daily"}
        ],
        "precautions": ["Monitor blood pressure", "Avoid stress", "Limit alcohol"],
        "severity": "moderate"
    },
    
    # 2. Respiratory
    "Common Cold": {
        "doctor": "General Physician",
        "medicines": [
            {"name": "Paracetamol", "usage": "Fever & pain", "timing": "After food"},
            {"name": "Cetirizine", "usage": "Cold & allergy", "timing": "Night"}
        ],
        "remedies": [
            {"name": "Steam Inhalation", "preparation": "Hot water steam", "measurement": "2 times daily"},
            {"name": "Ginger Tea", "preparation": "Boil ginger in water", "measurement": "2 cups daily"}
        ],
        "precautions": ["Wash hands regularly", "Avoid cold drinks", "Cover mouth when coughing"],
        "severity": "mild"
    },
    "Flu": {
        "doctor": "General Physician",
        "medicines": [{"name": "Oseltamivir", "usage": "Antiviral", "timing": "As prescribed"}],
        "remedies": [{"name": "Bed Rest", "preparation": "Sleep and isolate", "measurement": "Full day"}],
        "precautions": ["Stay hydrated", "Avoid public places", "Use warm blankets"],
        "severity": "moderate"
    },
    "Asthma": {
        "doctor": "Pulmonologist",
        "medicines": [{"name": "Salbutamol Inhaler", "usage": "Bronchodilator", "timing": "During attack"}],
        "remedies": [{"name": "Breathing Exercises", "preparation": "Deep breathing", "measurement": "10 mins"}],
        "precautions": ["Avoid dust and smoke", "Keep inhaler handy", "Avoid cold air"],
        "severity": "critical"
    },
    "Sinusitis": {
        "doctor": "ENT Specialist",
        "medicines": [{"name": "Decongestant", "usage": "Clear nasal passage", "timing": "Twice daily"}],
        "remedies": [{"name": "Warm Compress", "preparation": "Apply to face", "measurement": "15 mins"}],
        "precautions": ["Avoid AC draft", "Use humidifier", "Drink warm fluids"],
        "severity": "moderate"
    },
    
    # 3. Gastrointestinal
    "Food Poisoning": {
        "doctor": "Gastroenterologist",
        "medicines": [{"name": "ORS", "usage": "Rehydration", "timing": "Continuous"}],
        "remedies": [{"name": "BRAT Diet", "preparation": "Bananas, Rice, Applesauce, Toast", "measurement": "Meals"}],
        "precautions": ["Avoid spicy food", "Do not consume dairy", "Drink boiled water"],
        "severity": "moderate"
    },
    "Gastroenteritis": {
        "doctor": "Gastroenterologist",
        "medicines": [{"name": "Loperamide", "usage": "Control diarrhea", "timing": "As prescribed"}],
        "remedies": [{"name": "Hydration", "preparation": "Drink plenty of fluids", "measurement": "Continuous"}],
        "precautions": ["Wash hands before eating", "Eat freshly cooked food", "Avoid outside food"],
        "severity": "moderate"
    },
    "Gastritis": {
        "doctor": "Gastroenterologist",
        "medicines": [{"name": "Pantoprazole", "usage": "Reduce stomach acid", "timing": "Before breakfast"}],
        "remedies": [{"name": "Cold Milk", "preparation": "Sip slowly", "measurement": "1 glass"}],
        "precautions": ["Avoid skipping meals", "Reduce coffee intake", "Avoid oily food"],
        "severity": "moderate"
    },
    "Constipation": {
        "doctor": "General Physician",
        "medicines": [{"name": "Laxative", "usage": "Stool softener", "timing": "Night"}],
        "remedies": [{"name": "High Fiber Foods", "preparation": "Eat fruits and oats", "measurement": "Daily"}],
        "precautions": ["Drink lots of water", "Exercise regularly", "Do not ignore bowel urges"],
        "severity": "mild"
    },
    
    # 4. Endocrine / Metabolic
    "Diabetes": {
        "doctor": "Endocrinologist",
        "medicines": [{"name": "Metformin", "usage": "Blood sugar control", "timing": "With meals"}],
        "remedies": [
            {"name": "Low Carb Diet", "preparation": "Avoid sugars and refined carbs", "measurement": "All meals"}
        ],
        "precautions": ["Monitor blood sugar", "Exercise daily", "Check feet for wounds"],
        "severity": "moderate"
    },
    "Hypothyroidism": {
        "doctor": "Endocrinologist",
        "medicines": [{"name": "Levothyroxine", "usage": "Thyroid hormone", "timing": "Empty stomach morning"}],
        "remedies": [{"name": "Iodine Rich Diet", "preparation": "Include seafood/dairy", "measurement": "Meals"}],
        "precautions": ["Don't skip medication", "Monitor weight", "Get routine blood tests"],
        "severity": "moderate"
    },
    
    # 5. Neurological / Psychological
    "Migraine": {
        "doctor": "Neurologist",
        "medicines": [{"name": "Sumatriptan", "usage": "Severe headache relief", "timing": "Onset of migraine"}],
        "remedies": [{"name": "Rest in Dark Room", "preparation": "Turn off lights", "measurement": "Until relief"}],
        "precautions": ["Identify triggers", "Avoid loud noises", "Sleep adequately"],
        "severity": "moderate"
    },
    "Anxiety": {
        "doctor": "Psychiatrist",
        "medicines": [{"name": "Anxiolytic", "usage": "Reduce anxiety", "timing": "As prescribed"}],
        "remedies": [{"name": "Meditation", "preparation": "Mindfulness", "measurement": "15 mins"}],
        "precautions": ["Avoid caffeine", "Talk to someone", "Practice deep breathing"],
        "severity": "moderate"
    },
    "Depression": {
        "doctor": "Psychiatrist",
        "medicines": [{"name": "Antidepressant", "usage": "Mood stabilizer", "timing": "As prescribed"}],
        "remedies": [{"name": "Therapy", "preparation": "Talk therapy/Counseling", "measurement": "Weekly"}],
        "precautions": ["Seek support", "Maintain a routine", "Engage in hobbies"],
        "severity": "moderate"
    },
    
    # 6. Infectious Diseases
    "Dengue": {
        "doctor": "General Physician",
        "medicines": [{"name": "Paracetamol", "usage": "Fever management", "timing": "Every 6 hours"}],
        "remedies": [{"name": "Papaya Leaf Extract", "preparation": "Crush leaves", "measurement": "2 spoons"}],
        "precautions": ["Use mosquito nets", "Avoid NSAIDs like Ibuprofen", "Monitor platelets"],
        "severity": "critical"
    },
    "Typhoid": {
        "doctor": "General Physician",
        "medicines": [{"name": "Antibiotics", "usage": "Kill bacteria", "timing": "Full course"}],
        "remedies": [{"name": "Soft Diet", "preparation": "Easily digestible food", "measurement": "Meals"}],
        "precautions": ["Drink boiled water", "Wash hands", "Avoid raw vegetables"],
        "severity": "moderate"
    },
    "Viral Fever": {
        "doctor": "General Physician",
        "medicines": [{"name": "Antipyretic", "usage": "Fever reduction", "timing": "When feverish"}],
        "remedies": [{"name": "Sponge Bath", "preparation": "Tepid water", "measurement": "As needed"}],
        "precautions": ["Rest completely", "Eat light food", "Stay hydrated"],
        "severity": "moderate"
    },
    "Chicken pox": {
        "doctor": "Dermatologist",
        "medicines": [{"name": "Calamine Lotion", "usage": "Soothe itching", "timing": "Apply topically"}],
        "remedies": [{"name": "Oatmeal Bath", "preparation": "Soak in tub", "measurement": "20 mins"}],
        "precautions": ["Isolate yourself", "Do not scratch blisters", "Cut nails short"],
        "severity": "moderate"
    },
    "Malaria": {
        "doctor": "General Physician",
        "medicines": [{"name": "Antimalarial", "usage": "Kill parasite", "timing": "Full course"}],
        "remedies": [{"name": "Rest", "preparation": "Complete bed rest", "measurement": "Continuous"}],
        "precautions": ["Use mosquito repellent", "Wear long sleeves", "Keep surroundings dry"],
        "severity": "moderate"
    },
    
    # 7. Skin / Allergy
    "Allergy": {
        "doctor": "Allergist",
        "medicines": [{"name": "Antihistamine", "usage": "Reduce reaction", "timing": "As needed"}],
        "remedies": [{"name": "Cool Shower", "preparation": "Wash off allergens", "measurement": "Once"}],
        "precautions": ["Identify allergen", "Avoid dust/pollen", "Keep windows closed"],
        "severity": "mild"
    },
    "Skin Infection": {
        "doctor": "Dermatologist",
        "medicines": [{"name": "Antibiotic Cream", "usage": "Kill bacteria", "timing": "Apply twice daily"}],
        "remedies": [{"name": "Keep Area Dry", "preparation": "Clean and dry", "measurement": "Always"}],
        "precautions": ["Do not share towels", "Wash clothes in hot water", "Don't scratch"],
        "severity": "moderate"
    },
    "Fungal infection": {
        "doctor": "Dermatologist",
        "medicines": [{"name": "Antifungal Powder", "usage": "Stop fungus", "timing": "Twice daily"}],
        "remedies": [{"name": "Wear Cotton", "preparation": "Breathable clothes", "measurement": "Always"}],
        "precautions": ["Keep skin dry", "Bathe daily", "Change socks frequently"],
        "severity": "mild"
    },
    "Acne": {
        "doctor": "Dermatologist",
        "medicines": [{"name": "Salicylic Acid", "usage": "Unclog pores", "timing": "Nightly"}],
        "remedies": [{"name": "Aloe Vera", "preparation": "Apply gel", "measurement": "Leave on"}],
        "precautions": ["Don't pop pimples", "Wash face twice daily", "Use non-comedogenic products"],
        "severity": "mild"
    },
    
    # 8. Musculoskeletal / Joint
    "Arthritis": {
        "doctor": "Rheumatologist",
        "medicines": [{"name": "NSAIDs", "usage": "Reduce inflammation", "timing": "With food"}],
        "remedies": [{"name": "Warm Joint Compress", "preparation": "Apply to joints", "measurement": "20 mins"}],
        "precautions": ["Avoid heavy lifting", "Do gentle stretches", "Maintain healthy weight"],
        "severity": "moderate"
    },
    "Osteoarthristis": {
        "doctor": "Orthopedist",
        "medicines": [{"name": "Pain Relievers", "usage": "Manage pain", "timing": "As needed"}],
        "remedies": [{"name": "Physical Therapy", "preparation": "Guided exercise", "measurement": "Weekly"}],
        "precautions": ["Avoid high impact exercise", "Use supportive footwear", "Manage weight"],
        "severity": "moderate"
    },
    "Cervical spondylosis": {
        "doctor": "Orthopedist",
        "medicines": [{"name": "Muscle Relaxant", "usage": "Ease neck stiffness", "timing": "Night"}],
        "remedies": [{"name": "Neck Collar", "preparation": "Support neck", "measurement": "When sitting"}],
        "precautions": ["Correct posture", "Don't use thick pillows", "Take screen breaks"],
        "severity": "moderate"
    },
    
    # 9. Genitourinary
    "UTI": {
        "doctor": "Urologist",
        "medicines": [{"name": "Antibiotics", "usage": "Clear infection", "timing": "Full course"}],
        "remedies": [{"name": "Cranberry Juice", "preparation": "Unsweetened", "measurement": "2 glasses"}],
        "precautions": ["Drink lots of water", "Don't hold urine", "Maintain hygiene"],
        "severity": "moderate"
    },
    "Menstrual Cramps": {
        "doctor": "Gynecologist",
        "medicines": [{"name": "Ibuprofen", "usage": "Pain relief", "timing": "After food"}],
        "remedies": [{"name": "Hot Water Bag", "preparation": "Apply on abdomen", "measurement": "15 mins"}],
        "precautions": ["Avoid caffeine", "Rest adequately", "Do light stretching"],
        "severity": "mild"
    },
    
    # 10. Liver / Others
    "Jaundice": {
        "doctor": "Gastroenterologist",
        "medicines": [{"name": "Liver Supplements", "usage": "Support liver", "timing": "Daily"}],
        "remedies": [{"name": "Sugarcane Juice", "preparation": "Fresh juice", "measurement": "2 glasses"}],
        "precautions": ["Complete bed rest", "Avoid fatty foods", "Drink boiled water"],
        "severity": "moderate"
    },

    "General Health Issue": {
        "doctor": "General Physician",
        "medicines": [{"name": "Multivitamins", "usage": "General wellness", "timing": "Daily"}],
        "remedies": [{"name": "Rest", "preparation": "Get adequate sleep", "measurement": "8 hours"}],
        "precautions": ["Eat a balanced diet", "Stay hydrated", "Monitor symptoms"],
        "severity": "mild"
    }
}

# Ensure all 30+ diseases exist in disease_data. If not explicitly mapped, get a fallback.
def get_disease_info(disease_name):
    default_info = {
        "doctor": "General Physician",
        "medicines": [{"name": "Symptom Relief Medication", "usage": "As prescribed", "timing": "As needed"}],
        "remedies": [{"name": "Rest and Hydration", "preparation": "Drink water and rest", "measurement": "Daily"}],
        "precautions": ["Consult a doctor for accurate diagnosis", "Rest adequately", "Stay hydrated"],
        "severity": "moderate"
    }
    
    info = disease_data.get(disease_name, default_info)
    # Ensure precautions is present even if some older dictionary didn't have it
    if "precautions" not in info:
        info["precautions"] = default_info["precautions"]
        
    return info
