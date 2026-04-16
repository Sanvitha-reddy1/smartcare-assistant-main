type Severity = "mild" | "moderate" | "critical";

export interface AnalysisResult {
  disease: string;
  severity: Severity;
  remedies: { name: string; preparation: string; measurement: string }[];
  medicines: { name: string; usage: string; timing: string }[];
  doctorType: string;
  confidence: number;
  explanation: string;
}

const symptomMap: Record<string, string[]> = {
  fever: ["chills", "sweating", "body aches", "fatigue", "headache", "loss of appetite", "weakness"],
  headache: ["dizziness", "nausea", "sensitivity to light", "blurred vision", "neck stiffness", "migraine"],
  cough: ["sore throat", "runny nose", "chest congestion", "shortness of breath", "sneezing", "mucus"],
  stomach: ["nausea", "vomiting", "bloating", "loss of appetite", "diarrhea", "acid reflux", "cramps"],
  tired: ["fatigue", "weakness", "drowsiness", "difficulty concentrating", "muscle aches", "sleepy"],
  pain: ["swelling", "stiffness", "tenderness", "bruising", "limited movement", "aching", "sore"],
  cold: ["runny nose", "sneezing", "sore throat", "mild cough", "watery eyes", "chills"],
  throat: ["difficulty swallowing", "hoarseness", "dry throat", "swollen glands", "cough", "sore throat"],
  chest: ["shortness of breath", "chest tightness", "rapid heartbeat", "pain when breathing", "wheezing"],
  skin: ["rash", "itching", "redness", "swelling", "dryness", "bumps", "hives", "allergy"],
  itch: ["rash", "redness", "allergy", "dry skin", "hives", "bites", "irritation"],
  breathing: ["wheezing", "chest tightness", "shortness of breath", "rapid breathing", "gasping"],
  dizzy: ["lightheadedness", "loss of balance", "nausea", "blurred vision", "fainting"],
  joint: ["stiffness", "swelling", "redness", "warmth", "limited range of motion", "arthritis"],
  back: ["stiffness", "muscle spasm", "numbness", "tingling", "limited mobility"],
  eye: ["redness", "itching", "watery eyes", "blurred vision", "sensitivity to light"],
  period: ["heavy bleeding", "nausea", "diarrhea", "lower back pain", "bloating", "mood swings", "fatigue", "cramps"],
  menstrual: ["heavy bleeding", "nausea", "diarrhea", "lower back pain", "bloating", "mood swings", "fatigue", "cramps"],
  cramp: ["heavy bleeding", "nausea", "bloating", "lower back pain", "diarrhea", "fatigue", "stomach pain"],
  bleeding: ["heavy bleeding", "clotting", "dizziness", "fatigue", "weakness", "nausea"],
  migraine: ["nausea", "sensitivity to light", "sensitivity to sound", "blurred vision", "throbbing pain", "aura"],
  anxiety: ["rapid heartbeat", "sweating", "trembling", "shortness of breath", "insomnia", "restlessness", "panic"],
  sleep: ["insomnia", "fatigue", "drowsiness", "difficulty concentrating", "irritability", "headache"],
  allergy: ["sneezing", "itching", "rash", "watery eyes", "runny nose", "swelling", "hives"],
  ear: ["ear pain", "hearing loss", "ringing", "discharge", "dizziness", "itching"],
  dental: ["toothache", "swollen gums", "sensitivity to hot/cold", "jaw pain", "bad breath"],
  urinary: ["burning sensation", "frequent urination", "lower abdominal pain", "cloudy urine", "urgency", "pain"],
  nausea: ["vomiting", "stomach pain", "dizziness", "loss of appetite", "acid reflux"],
  rash: ["itching", "redness", "skin allergy", "hives", "bumps"]
};

// Advanced input stemmer
function stemWord(word: string): string {
  let w = word.toLowerCase().trim();
  if (w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.endsWith("es") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("ed") && w.length > 3) w = w.slice(0, -2);
  else if (w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us") && !w.endsWith("is")) w = w.slice(0, -1);
  return w;
}

function normalizeSymptoms(input: string, selectedSymptoms: string[]): string[] {
  const fillerWords = new Set([
    "i", "i'm", "have", "feel", "feeling", "a", "an", "the", "my", "is", "and", "or", "but", 
    "with", "so", "very", "much", "too", "am", "got", "get", "some", "like", "in", "on", 
    "at", "to", "for", "been", "since", "it", "this", "that", "there", "has", "had", 
    "experiencing", "suffering", "from", "getting", "bad", "really", "lot", "of"
  ]);
  const allText = input.toLowerCase() + " " + selectedSymptoms.join(" ").toLowerCase();
  const words = allText.split(/[\s,.;\-]+/).filter(w => w.length > 1 && !fillerWords.has(w));
  return Array.from(new Set(words.map(stemWord)));
}

export function getSuggestions(input: string, selectedSymptoms: string[] = []): string[] {
  const normWords = normalizeSymptoms(input, selectedSymptoms);
  const scores = new Map<string, number>();

  for (const word of normWords) {
    for (const [key, relatedList] of Object.entries(symptomMap)) {
      const stemKey = stemWord(key);
      if (stemKey === word || stemKey.includes(word) || word.includes(stemKey)) {
        relatedList.forEach(s => {
          scores.set(s, (scores.get(s) || 0) + 2);
        });
        if (stemKey !== word) {
          scores.set(key, (scores.get(key) || 0) + 3);
        }
      }
    }
  }

  // Explore deeper second level relationships
  const secondLevel = new Map<string, number>();
  for (const [sug, score] of scores.entries()) {
    const sStem = stemWord(sug);
    for (const [key, relatedList] of Object.entries(symptomMap)) {
      if (stemWord(key) === sStem) {
        relatedList.forEach(r => {
          secondLevel.set(r, (secondLevel.get(r) || 0) + 1);
        });
      }
    }
  }

  // Combine scores
  for (const [sug, score] of secondLevel.entries()) {
    scores.set(sug, (scores.get(sug) || 0) + score);
  }

  // Smart fallback if the word is recognized but has no specific map keys
  if (scores.size === 0 && normWords.length > 0) {
     ['fever', 'cough', 'headache', 'stomach pain', 'tiredness', 'skin rash', 'nausea'].forEach(s => scores.set(s, 1));
  }

  // Exclude words the user has already input or selected
  const rawInputWords = new Set([...input.toLowerCase().split(/[\s,.;\-]+/), ...selectedSymptoms.map(s => s.toLowerCase())]);
  const excludeSet = new Set([...normWords, ...Array.from(rawInputWords).map(stemWord)]);

  for (const key of Array.from(scores.keys())) {
    const kStem = stemWord(key);
    let exclude = false;
    for (const ex of excludeSet) {
      if (ex.length > 2 && (kStem === ex || kStem.includes(ex) || ex.includes(kStem))) {
        exclude = true;
        break;
      }
    }
    if (exclude) {
      scores.delete(key);
    }
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]) // Rank by highest relevance match
    .map(e => e[0])
    .slice(0, 8);
}

interface Remedy { name: string; preparation: string; measurement: string; }
interface Medicine { name: string; usage: string; timing: string; }

interface DiseaseData {
  id: string;
  name: string;
  keywords: { word: string; weight: number }[];
  clusters: string[][];
  severityModifiers: { keyword: string; severity: Severity }[];
  defaultSeverity: Severity;
  doctorType: string;
  remedies: Remedy[];
  medicines: Medicine[];
}

const diseaseDatabase: DiseaseData[] = [
  {
    id: "skin",
    name: "Skin Allergy / Dermatitis",
    keywords: [
      { word: "itch", weight: 3 },
      { word: "rash", weight: 3 },
      { word: "red", weight: 2 },
      { word: "allergi", weight: 3 }, 
      { word: "allergy", weight: 3 }, 
      { word: "skin", weight: 2 },
      { word: "bump", weight: 2 },
      { word: "swell", weight: 2 },
      { word: "hive", weight: 3 }
    ],
    clusters: [
      ["itch", "rash"],
      ["skin", "red"],
      ["itch", "swell"]
    ],
    severityModifiers: [
      { keyword: "spread", severity: "moderate" },
      { keyword: "breath", severity: "critical" },
      { keyword: "throat", severity: "critical" }
    ],
    defaultSeverity: "mild",
    doctorType: "Dermatologist",
    remedies: [
      { name: "Cold Compress", preparation: "Apply a cool, damp cloth to the affected area", measurement: "10-15 minutes" },
      { name: "Oatmeal Bath", preparation: "Add colloidal oatmeal to lukewarm bath water", measurement: "Soak for 15-20 min" },
      { name: "Aloe Vera", preparation: "Apply pure aloe vera gel directly to the rash", measurement: "2-3 times daily" }
    ],
    medicines: [
      { name: "Loratadine", usage: "Non-drowsy antihistamine for allergy relief", timing: "Once daily" },
      { name: "Hydrocortisone Cream 1%", usage: "Topical steroid for itching and redness", timing: "Apply thinly twice a day" },
      { name: "Cetirizine", usage: "Antihistamine for severe itching", timing: "Once at night" }
    ]
  },
  {
    id: "neuro",
    name: "Neurological Symptom / Migraine",
    keywords: [
      { word: "headach", weight: 3 }, 
      { word: "headache", weight: 3 }, 
      { word: "dizzi", weight: 3 },
      { word: "dizzy", weight: 3 },
      { word: "sensitiv", weight: 3 },
      { word: "migrain", weight: 4 },
      { word: "nausea", weight: 1 },
      { word: "blur", weight: 2 },
      { word: "light", weight: 2 }
    ],
    clusters: [
      ["headach", "dizzi", "sensitiv"],
      ["headach", "nausea"],
      ["headache", "dizzy"],
      ["migrain", "aura"]
    ],
    severityModifiers: [
      { keyword: "severe", severity: "critical" },
      { keyword: "faint", severity: "critical" },
      { keyword: "blind", severity: "critical" }
    ],
    defaultSeverity: "moderate",
    doctorType: "Neurologist",
    remedies: [
      { name: "Dark Quiet Room", preparation: "Rest in a dark, quiet room with eyes closed", measurement: "30 min to 1 hour" },
      { name: "Cold Compress", preparation: "Apply a cold pack wrapped in cloth to forehead", measurement: "15 min on, 15 min off" },
      { name: "Peppermint Oil", preparation: "Dilute and apply to temples, massage gently", measurement: "As needed" },
      { name: "Hydration", preparation: "Drink extra water, avoiding caffeine", measurement: "Continuous" }
    ],
    medicines: [
      { name: "Sumatriptan", usage: "For acute migraine relief", timing: "At onset of migraine, as directed" },
      { name: "Paracetamol + Caffeine", usage: "For mild to moderate migraine", timing: "After food, every 6 hours" },
      { name: "Naproxen", usage: "Anti-inflammatory pain relief", timing: "With food, twice daily" }
    ]
  },
  {
    id: "menstrual",
    name: "Dysmenorrhea (Menstrual Cramps)",
    keywords: [
      { word: "period", weight: 3 },
      { word: "menstru", weight: 3 },
      { word: "cramp", weight: 3 },
      { word: "bleed", weight: 2 },
      { word: "pms", weight: 3 },
      { word: "stomach", weight: 1 }
    ],
    clusters: [
      ["cramp", "bleed"],
      ["stomach", "cramp"],
      ["period", "pain"],
      ["lower back", "cramp"]
    ],
    severityModifiers: [
      { keyword: "heavy bleed", severity: "moderate" },
      { keyword: "clotting", severity: "moderate" },
      { keyword: "faint", severity: "critical" },
      { keyword: "unbearable", severity: "critical" }
    ],
    defaultSeverity: "mild",
    doctorType: "Gynecologist",
    remedies: [
      { name: "Warm Compress", preparation: "Place a heating pad or warm water bottle on lower abdomen", measurement: "15-20 min, repeat as needed" },
      { name: "Ginger Tea", preparation: "Boil fresh ginger slices in water for 10 min, add honey", measurement: "2-3 cups daily during periods" },
      { name: "Light Exercise", preparation: "Gentle yoga, walking, or stretching to improve blood flow", measurement: "15-30 min daily" },
      { name: "Cinnamon & Honey", preparation: "Mix 1/2 tsp cinnamon powder in warm water with honey", measurement: "Twice daily" },
    ],
    medicines: [
      { name: "Ibuprofen", usage: "Anti-inflammatory for cramp relief", timing: "After food, every 6-8 hours as needed" },
      { name: "Mefenamic Acid", usage: "For moderate to severe menstrual pain", timing: "After food, up to 3 times daily" },
      { name: "Buscopan", usage: "For abdominal spasms and cramping", timing: "As needed, up to 3 times daily" },
    ]
  },
  {
    id: "respiratory",
    name: "Respiratory Infection / Common Cold",
    keywords: [
      { word: "fever", weight: 2 },
      { word: "cough", weight: 2 },
      { word: "cold", weight: 2 },
      { word: "runny", weight: 1 },
      { word: "sore", weight: 1 },
      { word: "throat", weight: 1 },
      { word: "sneez", weight: 2 },
      { word: "congest", weight: 2 },
      { word: "breath", weight: 2 }
    ],
    clusters: [
      ["fever", "cough"],
      ["fever", "cough", "throat"],
      ["sore", "throat"],
      ["runny", "nose", "sneez"],
      ["chest", "congest"],
      ["cough", "breath"]
    ],
    severityModifiers: [
      { keyword: "high fever", severity: "moderate" },
      { keyword: "shortness of breath", severity: "critical" },
      { keyword: "coughing blood", severity: "critical" },
      { keyword: "chest tight", severity: "moderate" }
    ],
    defaultSeverity: "mild",
    doctorType: "General Physician",
    remedies: [
      { name: "Honey & Ginger Tea", preparation: "Boil water, add grated ginger, simmer for 5 min, add honey", measurement: "1 cup, 2-3 times daily" },
      { name: "Steam Inhalation", preparation: "Boil water, add eucalyptus oil, inhale steam with towel over head", measurement: "10-15 min, twice daily" },
      { name: "Turmeric Milk", preparation: "Warm milk, add 1/2 tsp turmeric and a pinch of black pepper", measurement: "1 glass before bedtime" },
      { name: "Salt Water Gargle", preparation: "Mix 1/2 tsp salt in warm water", measurement: "Gargle 3-4 times a day" }
    ],
    medicines: [
      { name: "Paracetamol", usage: "For fever and body aches", timing: "After food, every 6-8 hours" },
      { name: "Cetirizine", usage: "For runny nose and sneezing", timing: "Once daily, preferably at night" },
      { name: "Dextromethorphan", usage: "For dry cough", timing: "Every 6-8 hours as needed" }
    ]
  },
  {
    id: "gastro",
    name: "Gastrointestinal Issue / Stomach Upset",
    keywords: [
      { word: "stomach", weight: 2 },
      { word: "nausea", weight: 2 },
      { word: "vomit", weight: 3 },
      { word: "acid", weight: 1 },
      { word: "indigest", weight: 2 },
      { word: "bloat", weight: 2 },
      { word: "diarrhea", weight: 3 },
      { word: "cramp", weight: 1 },
      { word: "pain", weight: 1 }
    ],
    clusters: [
      ["nausea", "stomach"],
      ["nausea", "vomit"],
      ["diarrhea", "cramp"],
      ["acid", "reflux"]
    ],
    severityModifiers: [
      { keyword: "severe pain", severity: "critical" },
      { keyword: "blood", severity: "critical" },
      { keyword: "dehydrat", severity: "moderate" },
      { keyword: "keep food down", severity: "moderate" }
    ],
    defaultSeverity: "moderate",
    doctorType: "Gastroenterologist",
    remedies: [
      { name: "Peppermint Tea", preparation: "Steep fresh or dried peppermint leaves in hot water for 5 min", measurement: "1 cup after meals" },
      { name: "Ginger Water", preparation: "Grate fresh ginger into warm water, let sit for 10 min", measurement: "Small sips throughout the day" },
      { name: "BRAT Diet", preparation: "Eat Bananas, Rice, Applesauce, and Toast", measurement: "Small portions, 4-5 times a day" },
      { name: "Electrolyte Drink", preparation: "Mix oral rehydration salts with water", measurement: "Sip continuously" }
    ],
    medicines: [
      { name: "Omeprazole", usage: "For acid reduction", timing: "Before breakfast, once daily" },
      { name: "Ondansetron", usage: "For nausea and vomiting", timing: "As needed, up to 3 times daily" },
      { name: "Loperamide", usage: "For severe diarrhea", timing: "After each loose stool" }
    ]
  },
  {
    id: "cardio",
    name: "Possible Cardiac / Respiratory Concern",
    keywords: [
      { word: "chest", weight: 3 },
      { word: "breath", weight: 2 },
      { word: "heart", weight: 2 },
      { word: "short", weight: 2 },
      { word: "rapid", weight: 1 },
      { word: "tight", weight: 2 },
      { word: "arm", weight: 2 },
      { word: "jaw", weight: 2 }
    ],
    clusters: [
      ["chest", "pain"],
      ["chest", "tight"],
      ["short", "breath"],
      ["rapid", "heart"],
      ["chest", "arm"],
      ["chest", "heavy"]
    ],
    severityModifiers: [
      { keyword: "chest pain", severity: "critical" },
      { keyword: "faint", severity: "critical" },
      { keyword: "left arm", severity: "critical" }
    ],
    defaultSeverity: "critical",
    doctorType: "Cardiologist",
    remedies: [
      { name: "Rest & Elevation", preparation: "Sit upright and stay calm, loosen any tight clothing", measurement: "Immediate" },
      { name: "Deep Breathing", preparation: "Breathe in for 4 counts, hold for 4, exhale for 6", measurement: "Repeat 5-10 times" },
      { name: "Do NOT exert yourself", preparation: "Avoid walking or climbing stairs", measurement: "Immediate" }
    ],
    medicines: [
      { name: "Aspirin", usage: "Blood thinner for cardiac events (if previously advised)", timing: "Only as directed by emergency services" },
      { name: "Nitroglycerin", usage: "For known angina", timing: "As previously prescribed" }
    ]
  },
  {
    id: "general",
    name: "Possible Mild Condition",
    keywords: [
      { word: "fatigu", weight: 1 },
      { word: "fatigue", weight: 1 },
      { word: "weak", weight: 1 },
      { word: "tired", weight: 1 },
      { word: "pain", weight: 1 },
      { word: "unwell", weight: 1 },
      { word: "sick", weight: 1 }
    ],
    clusters: [],
    severityModifiers: [],
    defaultSeverity: "mild",
    doctorType: "General Physician",
    remedies: [
      { name: "Adequate Rest", preparation: "Ensure 7-9 hours of sleep in a dark, quiet room", measurement: "Daily" },
      { name: "Hydration", preparation: "Drink warm water with lemon", measurement: "8-10 glasses daily" },
      { name: "Balanced Diet", preparation: "Include fruits, vegetables, lean protein", measurement: "3 meals + 2 snacks" },
    ],
    medicines: [
      { name: "Multivitamin", usage: "For general wellness and immune support", timing: "Once daily after breakfast" },
      { name: "Paracetamol", usage: "For mild generalized body aches", timing: "As needed" },
    ]
  }
];

export function analyzeSymptoms(symptoms: string[]): AnalysisResult {
  const normWords = normalizeSymptoms(symptoms.join(" "), []);
  const joinedStr = symptoms.join(" ").toLowerCase();
  
  const scores = diseaseDatabase.map(disease => {
    let score = 0;
    
    disease.keywords.forEach(kw => {
      if (kw.word.includes(" ")) {
        if (joinedStr.includes(kw.word)) {
          score += kw.weight;
        }
      } else {
        // Match against normalized robust stem words OR raw string inclusions
        if (normWords.some(nw => nw === kw.word || (nw.length > 3 && (nw.includes(kw.word) || kw.word.includes(nw)))) || joinedStr.includes(kw.word)) {
          score += kw.weight;
        }
      }
    });

    // Award bonus score for symptom clusters (e.g. vomit + stomach)
    disease.clusters.forEach(cluster => {
      const allMatched = cluster.every(cWord => joinedStr.includes(cWord) || normWords.some(nw => nw.includes(cWord) || cWord.includes(nw)));
      if (allMatched) {
        score += 3;
      }
    });
    
    // Default fallback so possible mild condition ranks if absolutely nothing else matches
    if (disease.id === "general" && score === 0) {
      score = 0.5;
    }
    
    return { disease, score };
  });

  // Rank by highest score
  scores.sort((a, b) => b.score - a.score);

  const topMatches = scores.filter(s => s.score > 0);
  const primaryMatch = topMatches[0];
  const primaryDisease = primaryMatch?.disease || diseaseDatabase[diseaseDatabase.length - 1];

  const combinedRemedies = [...primaryDisease.remedies];
  const combinedMedicines = [...primaryDisease.medicines];

  // If a secondary condition is heavily implied, intelligently blend its remedies to treat the overlapping conditions
  if (topMatches.length > 1 && topMatches[1].score >= primaryMatch.score * 0.6 && topMatches[1].disease.id !== "general") {
    const secondaryDisease = topMatches[1].disease;
    
    secondaryDisease.remedies.forEach(r => {
      if (!combinedRemedies.some(cr => cr.name === r.name)) {
        combinedRemedies.push(r);
      }
    });
    
    secondaryDisease.medicines.forEach(m => {
      if (!combinedMedicines.some(cm => cm.name === m.name)) {
        combinedMedicines.push(m);
      }
    });
  }

  let finalSeverity = primaryDisease.defaultSeverity;
  const severityLevels = { mild: 0, moderate: 1, critical: 2 };
  
  for (const mod of primaryDisease.severityModifiers) {
    if (joinedStr.includes(mod.keyword) || normWords.includes(stemWord(mod.keyword))) {
      if (severityLevels[mod.severity] > severityLevels[finalSeverity]) {
        finalSeverity = mod.severity;
      }
    }
  }

  // Calculate Confidence Score
  const maxPossibleScore = primaryDisease.keywords.reduce((acc, kw) => acc + kw.weight, 0) + 4; 
  let confidence = Math.round((primaryMatch.score / Math.max(8, maxPossibleScore)) * 100);
  if (primaryDisease.id === "general" && primaryMatch.score <= 1) confidence = 35; // Default low confidence fallback
  confidence = Math.min(98, Math.max(35, confidence));

  // Generate Explanation
  const symptomListStr = symptoms.map(s => s.trim()).filter(Boolean).join(", ");
  let explanation = `Based on your reported symptoms (${symptomListStr}), this analysis indicates a high probability of ${primaryDisease.name}.`;
  if (topMatches.length > 1 && topMatches[1].disease.id !== "general" && topMatches[1].score >= primaryMatch.score * 0.4) {
    explanation += ` I also noticed overlapping patterns relating to ${topMatches[1].disease.name}.`;
  }
  explanation += ` Please review the recommended home care and consult a ${primaryDisease.doctorType} if the condition persists.`;

  return {
    disease: primaryDisease.name,
    severity: finalSeverity,
    remedies: combinedRemedies.slice(0, 5), // Keep top 5 max
    medicines: combinedMedicines.slice(0, 4), // Keep top 4 max
    doctorType: primaryDisease.doctorType,
    confidence: confidence,
    explanation: explanation
  };
}