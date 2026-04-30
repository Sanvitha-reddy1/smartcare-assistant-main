import re
import pandas as pd

def load_symptoms(csv_path="Testing.csv"):
    try:
        df = pd.read_csv(csv_path)
        return list(df.columns[:-1]) # Exclude prognosis
    except Exception as e:
        print(f"Error loading {csv_path}: {e}")
        return []

# Dictionary to map natural language phrases to standard dataset features
SYNONYM_MAP = {
    # Itching / Skin
    "itch": "itching",
    "itching": "itching",
    "scratch": "itching",
    "rash": "skin_rash",
    "skin rash": "skin_rash",
    "red spots": "red_spots_over_body",
    "pimples": "pus_filled_pimples",
    "blackheads": "blackheads",
    "peeling skin": "skin_peeling",
    "blister": "blister",
    "red sore": "red_sore_around_nose",
    
    # Respiratory / Cold / Flu
    "sneeze": "continuous_sneezing",
    "sneezing": "continuous_sneezing",
    "shiver": "shivering",
    "shivering": "shivering",
    "chills": "chills",
    "cold": "chills",
    "cough": "cough",
    "coughing": "cough",
    "fever": "high_fever",
    "high fever": "high_fever",
    "mild fever": "mild_fever",
    "temperature": "high_fever",
    "breathless": "breathlessness",
    "breathlessness": "breathlessness",
    "shortness of breath": "breathlessness",
    "cant breathe": "breathlessness",
    "phlegm": "phlegm",
    "runny nose": "runny_nose",
    "congestion": "congestion",
    "stuffy nose": "congestion",
    "throat pain": "throat_irritation",
    "sore throat": "throat_irritation",
    
    # Pain
    "joint pain": "joint_pain",
    "muscle pain": "muscle_pain",
    "muscle ache": "muscle_pain",
    "back pain": "back_pain",
    "back ache": "back_pain",
    "neck pain": "neck_pain",
    "chest pain": "chest_pain",
    "knee pain": "knee_pain",
    "headache": "headache",
    "head pain": "headache",
    "stomach ache": "stomach_pain",
    "stomach pain": "stomach_pain",
    "belly pain": "belly_pain",
    "abdominal pain": "abdominal_pain",
    "cramps": "cramps",
    "period pain": "cramps",
    "menstrual cramps": "cramps",
    "pain": "muscle_pain", # fallback
    
    # Digestion / Stomach
    "acidity": "acidity",
    "acid reflux": "acidity",
    "vomit": "vomiting",
    "vomiting": "vomiting",
    "puke": "vomiting",
    "throw up": "vomiting",
    "nausea": "nausea",
    "feel sick": "nausea",
    "indigestion": "indigestion",
    "constipation": "constipation",
    "diarrhoea": "diarrhoea",
    "diarrhea": "diarrhoea",
    "loose motion": "diarrhoea",
    "bloody stool": "bloody_stool",
    
    # General / Other
    "fatigue": "fatigue",
    "tired": "fatigue",
    "weak": "lethargy",
    "weakness": "weakness_in_limbs",
    "weight gain": "weight_gain",
    "weight loss": "weight_loss",
    "anxiety": "anxiety",
    "anxious": "anxiety",
    "mood swings": "mood_swings",
    "restless": "restlessness",
    "lethargy": "lethargy",
    "dehydration": "dehydration",
    "dehydrated": "dehydration",
    "sweating": "sweating",
    "sweat": "sweating",
    "dizzy": "dizziness",
    "dizziness": "dizziness",
    "loss of appetite": "loss_of_appetite",
    "no appetite": "loss_of_appetite"
}

def parse_symptoms(natural_text, valid_symptoms):
    """
    Parses a natural language string and extracts standard symptoms.
    Returns a list of standardized symptom strings.
    """
    text = natural_text.lower()
    
    # Remove punctuation except spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    
    extracted = set()
    
    # Check for multi-word phrases first
    for phrase, std_symptom in SYNONYM_MAP.items():
        if " " in phrase:
            if re.search(r'\b' + re.escape(phrase) + r'\b', text):
                extracted.add(std_symptom)
                # Remove the found phrase so we don't double count its individual words
                text = re.sub(r'\b' + re.escape(phrase) + r'\b', '', text)
                
    # Check for single word synonyms
    words = text.split()
    for word in words:
        if word in SYNONYM_MAP:
            extracted.add(SYNONYM_MAP[word])
            
    # Also check against the exact valid symptom names
    for valid_sym in valid_symptoms:
        clean_sym = valid_sym.replace("_", " ")
        if clean_sym in text:
            extracted.add(valid_sym)
            text = text.replace(clean_sym, "")
            
    return list(extracted)

if __name__ == "__main__":
    valid = load_symptoms()
    test_cases = [
        "I have itching and skin rash",
        "fever with cough for 2 days",
        "stomach pain and vomiting",
        "chest pain and breathlessness"
    ]
    for case in test_cases:
        print(f"'{case}' -> {parse_symptoms(case, valid)}")
