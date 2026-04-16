const symptomMap: Record<string, string[]> = {
  fever: ["chills", "sweating", "body aches", "fatigue", "headache", "loss of appetite"],
  headache: ["dizziness", "nausea", "sensitivity to light", "blurred vision", "neck stiffness"],
  cough: ["sore throat", "runny nose", "chest congestion", "shortness of breath", "sneezing"],
  stomach: ["nausea", "vomiting", "bloating", "loss of appetite", "diarrhea", "acid reflux"],
  tired: ["fatigue", "weakness", "drowsiness", "difficulty concentrating", "muscle aches"],
  pain: ["swelling", "stiffness", "tenderness", "bruising", "limited movement"],
  cold: ["runny nose", "sneezing", "sore throat", "mild cough", "watery eyes"],
  throat: ["difficulty swallowing", "hoarseness", "dry throat", "swollen glands", "cough"],
  chest: ["shortness of breath", "chest tightness", "rapid heartbeat", "pain when breathing"],
  skin: ["rash", "itching", "redness", "swelling", "dryness", "bumps"],
  breathing: ["wheezing", "chest tightness", "shortness of breath", "rapid breathing"],
  dizzy: ["lightheadedness", "loss of balance", "nausea", "blurred vision", "fainting"],
  joint: ["stiffness", "swelling", "redness", "warmth", "limited range of motion"],
  back: ["stiffness", "muscle spasm", "numbness", "tingling", "limited mobility"],
  eye: ["redness", "itching", "watery eyes", "blurred vision", "sensitivity to light"],
  period: ["heavy bleeding", "nausea", "diarrhea", "lower back pain", "bloating", "mood swings", "fatigue", "cramps"],
  menstrual: ["heavy bleeding", "nausea", "diarrhea", "lower back pain", "bloating", "mood swings", "fatigue", "cramps"],
  cramp: ["heavy bleeding", "nausea", "bloating", "lower back pain", "diarrhea", "fatigue"],
  bleeding: ["heavy bleeding", "clotting", "dizziness", "fatigue", "weakness", "nausea"],
  migraine: ["nausea", "sensitivity to light", "sensitivity to sound", "blurred vision", "throbbing pain", "aura"],
  anxiety: ["rapid heartbeat", "sweating", "trembling", "shortness of breath", "insomnia", "restlessness"],
  sleep: ["insomnia", "fatigue", "drowsiness", "difficulty concentrating", "irritability", "headache"],
  allergy: ["sneezing", "itching", "rash", "watery eyes", "runny nose", "swelling"],
  ear: ["ear pain", "hearing loss", "ringing", "discharge", "dizziness", "itching"],
  dental: ["toothache", "swollen gums", "sensitivity to hot/cold", "jaw pain", "bad breath"],
  urinary: ["burning sensation", "frequent urination", "lower abdominal pain", "cloudy urine", "urgency"],
};

export function getSuggestions(input: string, selectedSymptoms: string[] = []): string[] {
  const lower = input.toLowerCase();
  const words = lower.split(/[\s,]+/).filter(Boolean);
  const allContext = [...words, ...selectedSymptoms.map((s) => s.toLowerCase())];
  const suggestions = new Set<string>();

  for (const contextWord of allContext) {
    for (const [key, related] of Object.entries(symptomMap)) {
      if (key.includes(contextWord) || contextWord.includes(key)) {
        related.forEach((s) => suggestions.add(s));
      }
    }
  }

  // Also check if any suggestion itself maps to more suggestions (2nd-degree)
  const secondDegree = new Set<string>();
  for (const s of suggestions) {
    const sLower = s.toLowerCase();
    for (const [key, related] of Object.entries(symptomMap)) {
      if (key.includes(sLower) || sLower.includes(key)) {
        related.forEach((r) => secondDegree.add(r));
      }
    }
  }
  secondDegree.forEach((s) => suggestions.add(s));

  // Remove already typed or selected symptoms
  const excludeSet = new Set(allContext);
  suggestions.forEach((s) => {
    const sLower = s.toLowerCase();
    for (const ex of excludeSet) {
      if (sLower === ex || sLower.includes(ex) || ex.includes(sLower)) {
        suggestions.delete(s);
        break;
      }
    }
  });

  // Shuffle to avoid same order every time
  const arr = Array.from(suggestions);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 8);
}

// Mock analysis results
interface AnalysisResult {
  disease: string;
  severity: "mild" | "moderate" | "critical";
  remedies: { name: string; preparation: string; measurement: string }[];
  medicines: { name: string; usage: string; timing: string }[];
  doctorType: string;
}

export function analyzeSymptoms(symptoms: string[]): AnalysisResult {
  const joined = symptoms.join(" ").toLowerCase();

  // Context-aware: detect menstrual/period keywords FIRST to avoid misclassification
  const menstrualKeywords = ["period", "menstrual", "cramp", "menstruation", "dysmenorrhea", "pms", "heavy bleeding", "cycle"];
  const isMenstrual = menstrualKeywords.some((k) => joined.includes(k));

  if (isMenstrual) {
    return {
      disease: "Dysmenorrhea (Menstrual Cramps)",
      severity: joined.includes("heavy bleeding") || joined.includes("clotting") || joined.includes("severe") ? "moderate" : "mild",
      remedies: [
        { name: "Warm Compress", preparation: "Place a heating pad or warm water bottle on lower abdomen", measurement: "15-20 min, repeat as needed" },
        { name: "Ginger Tea", preparation: "Boil fresh ginger slices in water for 10 min, add honey", measurement: "2-3 cups daily during periods" },
        { name: "Light Exercise", preparation: "Gentle yoga, walking, or stretching to improve blood flow", measurement: "15-30 min daily" },
        { name: "Cinnamon & Honey", preparation: "Mix 1/2 tsp cinnamon powder in warm water with honey", measurement: "Twice daily" },
      ],
      medicines: [
        { name: "Ibuprofen (Advil)", usage: "Anti-inflammatory for cramp relief", timing: "After food, every 6-8 hours as needed" },
        { name: "Mefenamic Acid", usage: "For moderate to severe menstrual pain", timing: "After food, up to 3 times daily" },
        { name: "Buscopan", usage: "For abdominal spasms and cramping", timing: "As needed, up to 3 times daily" },
      ],
      doctorType: "Gynecologist",
    };
  }

  // Migraine detection
  if (joined.includes("migraine") || (joined.includes("headache") && (joined.includes("nausea") || joined.includes("light") || joined.includes("throbbing")))) {
    return {
      disease: "Migraine",
      severity: "moderate",
      remedies: [
        { name: "Dark Quiet Room", preparation: "Rest in a dark, quiet room with eyes closed", measurement: "30 min to 1 hour" },
        { name: "Cold Compress", preparation: "Apply a cold pack wrapped in cloth to forehead", measurement: "15 min on, 15 min off" },
        { name: "Peppermint Oil", preparation: "Dilute and apply to temples, massage gently", measurement: "As needed" },
      ],
      medicines: [
        { name: "Sumatriptan", usage: "For acute migraine relief", timing: "At onset of migraine, as directed" },
        { name: "Paracetamol + Caffeine", usage: "For mild to moderate migraine", timing: "After food, every 6 hours" },
      ],
      doctorType: "Neurologist",
    };
  }

  if (joined.includes("fever") || joined.includes("cough") || joined.includes("cold")) {
    return {
      disease: "Common Cold / Upper Respiratory Infection",
      severity: "mild",
      remedies: [
        { name: "Honey & Ginger Tea", preparation: "Boil water, add grated ginger, simmer for 5 min, add honey", measurement: "1 cup, 2-3 times daily" },
        { name: "Steam Inhalation", preparation: "Boil water, add eucalyptus oil, inhale steam with towel over head", measurement: "10-15 min, twice daily" },
        { name: "Turmeric Milk", preparation: "Warm milk, add 1/2 tsp turmeric and a pinch of black pepper", measurement: "1 glass before bedtime" },
      ],
      medicines: [
        { name: "Paracetamol", usage: "For fever and body aches", timing: "After food, every 6-8 hours" },
        { name: "Cetirizine", usage: "For runny nose and sneezing", timing: "Once daily, preferably at night" },
      ],
      doctorType: "General Physician",
    };
  }
  
  if (joined.includes("stomach") || joined.includes("nausea") || joined.includes("vomit") || joined.includes("acid") || joined.includes("indigestion")) {
    return {
      disease: "Gastritis / Stomach Upset",
      severity: "moderate",
      remedies: [
        { name: "Peppermint Tea", preparation: "Steep fresh or dried peppermint leaves in hot water for 5 min", measurement: "1 cup after meals" },
        { name: "Ginger Water", preparation: "Grate fresh ginger into warm water, let sit for 10 min", measurement: "Small sips throughout the day" },
        { name: "Banana & Rice", preparation: "Eat ripe banana and plain white rice", measurement: "Small portions, 4-5 times a day" },
      ],
      medicines: [
        { name: "Omeprazole", usage: "For acid reduction", timing: "Before breakfast, once daily" },
        { name: "Ondansetron", usage: "For nausea and vomiting", timing: "As needed, up to 3 times daily" },
      ],
      doctorType: "Gastroenterologist",
    };
  }
  
  if (joined.includes("chest") || joined.includes("breathing") || joined.includes("heart")) {
    return {
      disease: "Possible Cardiac / Respiratory Concern",
      severity: "critical",
      remedies: [
        { name: "Rest & Elevation", preparation: "Sit upright and stay calm, loosen any tight clothing", measurement: "Immediate" },
        { name: "Deep Breathing", preparation: "Breathe in for 4 counts, hold for 4, exhale for 6", measurement: "Repeat 5-10 times" },
      ],
      medicines: [
        { name: "Aspirin (if advised)", usage: "Blood thinner for cardiac events", timing: "Only as directed by a doctor" },
      ],
      doctorType: "Cardiologist / Emergency Medicine",
    };
  }

  // Anxiety / mental health
  if (joined.includes("anxiety") || joined.includes("panic") || joined.includes("restless")) {
    return {
      disease: "Anxiety / Stress Disorder",
      severity: "moderate",
      remedies: [
        { name: "Deep Breathing", preparation: "Inhale for 4 counts, hold 7, exhale 8", measurement: "5-10 cycles, twice daily" },
        { name: "Chamomile Tea", preparation: "Steep chamomile flowers in hot water for 5 min", measurement: "1-2 cups daily" },
        { name: "Mindfulness Meditation", preparation: "Sit quietly and focus on breathing for 10 min", measurement: "Daily" },
      ],
      medicines: [
        { name: "Consult a professional", usage: "Medication should be prescribed by a specialist", timing: "Schedule an appointment" },
      ],
      doctorType: "Psychiatrist / Psychologist",
    };
  }

  return {
    disease: "General Health Concern",
    severity: "mild",
    remedies: [
      { name: "Adequate Rest", preparation: "Ensure 7-9 hours of sleep in a dark, quiet room", measurement: "Daily" },
      { name: "Hydration", preparation: "Drink warm water with lemon", measurement: "8-10 glasses daily" },
      { name: "Balanced Diet", preparation: "Include fruits, vegetables, lean protein", measurement: "3 meals + 2 snacks" },
    ],
    medicines: [
      { name: "Multivitamin", usage: "For general wellness", timing: "Once daily after breakfast" },
    ],
    doctorType: "General Physician",
  };
}


// Symptom keyword mappings for dynamic suggestions
// const symptomMap: Record<string, string[]> = {
//   fever: ["chills", "sweating", "body aches", "fatigue", "headache", "loss of appetite"],
//   headache: ["dizziness", "nausea", "sensitivity to light", "blurred vision", "neck stiffness"],
//   cough: ["sore throat", "runny nose", "chest congestion", "shortness of breath", "sneezing"],
//   stomach: ["nausea", "vomiting", "bloating", "loss of appetite", "diarrhea", "acid reflux"],
//   tired: ["fatigue", "weakness", "drowsiness", "difficulty concentrating", "muscle aches"],
//   pain: ["swelling", "stiffness", "tenderness", "bruising", "limited movement"],
//   cold: ["runny nose", "sneezing", "sore throat", "mild cough", "watery eyes"],
//   throat: ["difficulty swallowing", "hoarseness", "dry throat", "swollen glands", "cough"],
//   chest: ["shortness of breath", "chest tightness", "rapid heartbeat", "pain when breathing"],
//   skin: ["rash", "itching", "redness", "swelling", "dryness", "bumps"],
//   breathing: ["wheezing", "chest tightness", "shortness of breath", "rapid breathing"],
//   dizzy: ["lightheadedness", "loss of balance", "nausea", "blurred vision", "fainting"],
//   joint: ["stiffness", "swelling", "redness", "warmth", "limited range of motion"],
//   back: ["stiffness", "muscle spasm", "numbness", "tingling", "limited mobility"],
//   eye: ["redness", "itching", "watery eyes", "blurred vision", "sensitivity to light"],
//   period: ["heavy bleeding", "nausea", "diarrhea", "lower back pain", "bloating", "mood swings", "fatigue", "cramps"],
//   menstrual: ["heavy bleeding", "nausea", "diarrhea", "lower back pain", "bloating", "mood swings", "fatigue", "cramps"],
//   cramp: ["heavy bleeding", "nausea", "bloating", "lower back pain", "diarrhea", "fatigue"],
//   bleeding: ["heavy bleeding", "clotting", "dizziness", "fatigue", "weakness", "nausea"],
//   migraine: ["nausea", "sensitivity to light", "sensitivity to sound", "blurred vision", "throbbing pain", "aura"],
//   anxiety: ["rapid heartbeat", "sweating", "trembling", "shortness of breath", "insomnia", "restlessness"],
//   sleep: ["insomnia", "fatigue", "drowsiness", "difficulty concentrating", "irritability", "headache"],
//   allergy: ["sneezing", "itching", "rash", "watery eyes", "runny nose", "swelling"],
//   ear: ["ear pain", "hearing loss", "ringing", "discharge", "dizziness", "itching"],
//   dental: ["toothache", "swollen gums", "sensitivity to hot/cold", "jaw pain", "bad breath"],
//   urinary: ["burning sensation", "frequent urination", "lower abdominal pain", "cloudy urine", "urgency"],
// };

// // export function getSuggestions(input: string, selectedSymptoms: string[] = []): string[] {
// //   const lower = input.toLowerCase();
// //   const words = lower.split(/[\s,]+/).filter(Boolean);
// //   const allContext = [...words, ...selectedSymptoms.map((s) => s.toLowerCase())];
// //   const suggestions = new Set<string>();

// //   for (const contextWord of allContext) {
// //     for (const [key, related] of Object.entries(symptomMap)) {
// //       if (key.includes(contextWord) || contextWord.includes(key)) {
// //         related.forEach((s) => suggestions.add(s));
// //       }
// //     }
// //   }

// //   // Also check if any suggestion itself maps to more suggestions (2nd-degree)
// //   const secondDegree = new Set<string>();
// //   for (const s of suggestions) {
// //     const sLower = s.toLowerCase();
// //     for (const [key, related] of Object.entries(symptomMap)) {
// //       if (key.includes(sLower) || sLower.includes(key)) {
// //         related.forEach((r) => secondDegree.add(r));
// //       }
// //     }
// //   }
// //   secondDegree.forEach((s) => suggestions.add(s));

// //   // Remove already typed or selected symptoms
// //   const excludeSet = new Set(allContext);
// //   suggestions.forEach((s) => {
// //     const sLower = s.toLowerCase();
// //     for (const ex of excludeSet) {
// //       if (sLower === ex || sLower.includes(ex) || ex.includes(sLower)) {
// //         suggestions.delete(s);
// //         break;
// //       }
// //     }
// //   });

// //   // Shuffle to avoid same order every time
// //   const arr = Array.from(suggestions);
// //   for (let i = arr.length - 1; i > 0; i--) {
// //     const j = Math.floor(Math.random() * (i + 1));
// //     [arr[i], arr[j]] = [arr[j], arr[i]];
// //   }
// //   return arr.slice(0, 8);
// // }

// // Mock analysis results
// interface AnalysisResult {
//   disease: string;
//   severity: "mild" | "moderate" | "critical";
//   remedies: { name: string; preparation: string; measurement: string }[];
//   medicines: { name: string; usage: string; timing: string }[];
//   doctorType: string;
// }

// export function analyzeSymptoms(symptoms: string[]): AnalysisResult {
//   const joined = symptoms.join(" ").toLowerCase();
  
//   if (joined.includes("fever") || joined.includes("cough") || joined.includes("cold")) {
//     return {
//       disease: "Common Cold / Upper Respiratory Infection",
//       severity: "mild",
//       remedies: [
//         { name: "Honey & Ginger Tea", preparation: "Boil water, add grated ginger, simmer for 5 min, add honey", measurement: "1 cup, 2-3 times daily" },
//         { name: "Steam Inhalation", preparation: "Boil water, add eucalyptus oil, inhale steam with towel over head", measurement: "10-15 min, twice daily" },
//         { name: "Turmeric Milk", preparation: "Warm milk, add 1/2 tsp turmeric and a pinch of black pepper", measurement: "1 glass before bedtime" },
//       ],
//       medicines: [
//         { name: "Paracetamol", usage: "For fever and body aches", timing: "After food, every 6-8 hours" },
//         { name: "Cetirizine", usage: "For runny nose and sneezing", timing: "Once daily, preferably at night" },
//       ],
//       doctorType: "General Physician",
//     };
//   }
  
//   if (joined.includes("stomach") || joined.includes("nausea") || joined.includes("vomit")) {
//     return {
//       disease: "Gastritis / Stomach Upset",
//       severity: "moderate",
//       remedies: [
//         { name: "Peppermint Tea", preparation: "Steep fresh or dried peppermint leaves in hot water for 5 min", measurement: "1 cup after meals" },
//         { name: "Ginger Water", preparation: "Grate fresh ginger into warm water, let sit for 10 min", measurement: "Small sips throughout the day" },
//         { name: "Banana & Rice", preparation: "Eat ripe banana and plain white rice", measurement: "Small portions, 4-5 times a day" },
//       ],
//       medicines: [
//         { name: "Omeprazole", usage: "For acid reduction", timing: "Before breakfast, once daily" },
//         { name: "Ondansetron", usage: "For nausea and vomiting", timing: "As needed, up to 3 times daily" },
//       ],
//       doctorType: "Gastroenterologist",
//     };
//   }
  
//   if (joined.includes("chest") || joined.includes("breathing") || joined.includes("heart")) {
//     return {
//       disease: "Possible Cardiac / Respiratory Concern",
//       severity: "critical",
//       remedies: [
//         { name: "Rest & Elevation", preparation: "Sit upright and stay calm, loosen any tight clothing", measurement: "Immediate" },
//         { name: "Deep Breathing", preparation: "Breathe in for 4 counts, hold for 4, exhale for 6", measurement: "Repeat 5-10 times" },
//       ],
//       medicines: [
//         { name: "Aspirin (if advised)", usage: "Blood thinner for cardiac events", timing: "Only as directed by a doctor" },
//       ],
//       doctorType: "Cardiologist / Emergency Medicine",
//     };
//   }

//   return {
//     disease: "General Health Concern",
//     severity: "mild",
//     remedies: [
//       { name: "Adequate Rest", preparation: "Ensure 7-9 hours of sleep in a dark, quiet room", measurement: "Daily" },
//       { name: "Hydration", preparation: "Drink warm water with lemon", measurement: "8-10 glasses daily" },
//       { name: "Balanced Diet", preparation: "Include fruits, vegetables, lean protein", measurement: "3 meals + 2 snacks" },
//     ],
//     medicines: [
//       { name: "Multivitamin", usage: "For general wellness", timing: "Once daily after breakfast" },
//     ],
//     doctorType: "General Physician",
//   };
// }