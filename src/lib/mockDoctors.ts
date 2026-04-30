export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  availability: string;
  rating: number;
  expectedTime?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  distance: string;
  open: boolean;
  expectedTime?: string;
}

const firstNames = ["Sarah", "Raj", "Emily", "Michael", "Anita", "David", "Priya", "John", "Maria", "James", "Elena", "Daniel"];
const lastNames = ["Johnson", "Patel", "Chen", "Brown", "Sharma", "Smith", "Garcia", "Williams", "Kim", "Lee", "Ali", "Gomez"];
const clinicNames = ["City Medical Center", "HealthPlus Clinic", "Heart Care Hospital", "Digestive Health Center", "Breathing Well Clinic", "Wellness Care Center", "Prime Health Clinic", "CareFirst Hospital"];
const hyderabadAreas = ["Kukatpally, Hyderabad", "Pragati Nagar, Hyderabad", "Madhapur, Hyderabad", "Gachibowli, Hyderabad", "Banjara Hills, Hyderabad", "Jubilee Hills, Hyderabad", "Miyapur, Hyderabad", "Ameerpet, Hyderabad"];

export function getDoctors(specialization: string): Doctor[] {
  const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 doctors
  const docs: Doctor[] = [];
  
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const clinic = clinicNames[Math.floor(Math.random() * clinicNames.length)];
    const area = hyderabadAreas[Math.floor(Math.random() * hyderabadAreas.length)];
    const dist = (Math.random() * 8 + 1).toFixed(1);
    const rating = (Math.random() * 1 + 4).toFixed(1);
    const timeMins = Math.floor(Math.random() * 40) + 10;
    
    docs.push({
      id: Math.random().toString(36).substring(2, 10),
      name: `Dr. ${fn} ${ln}`,
      specialization: specialization,
      location: `${clinic}, ${area}`,
      availability: "Available Today",
      rating: parseFloat(rating),
      expectedTime: `${timeMins} mins travel`
    });
  }
  
  return docs.sort((a, b) => b.rating - a.rating);
}

const pharmacyNames = [
  "MedPlus Pharmacy", "Apollo Pharmacy", "Care & Cure Pharmacy", 
  "LifeLine Pharmacy", "GreenCross Pharmacy", "City Care Meds", 
  "QuickHeal Pharmacy", "TrustMeds Pharmacy", "Neighborhood Rx"
];

export function getPharmacies(): Pharmacy[] {
  const count = Math.floor(Math.random() * 3) + 4; // 4 to 6 pharmacies
  const pharms: Pharmacy[] = [];
  const selectedNames = [...pharmacyNames].sort(() => 0.5 - Math.random()).slice(0, count);
  
  for (let i = 0; i < count; i++) {
    const area = hyderabadAreas[Math.floor(Math.random() * hyderabadAreas.length)];
    const dist = (Math.random() * 6 + 0.5).toFixed(1);
    const isOpen = Math.random() > 0.2; // 80% chance open
    const timeMins = Math.floor(Math.random() * 50) + 15;
    
    pharms.push({
      id: Math.random().toString(36).substring(2, 10),
      name: selectedNames[i],
      location: area,
      distance: `${dist} km`,
      open: isOpen,
      expectedTime: `${timeMins} mins delivery`
    });
  }
  return pharms.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}
