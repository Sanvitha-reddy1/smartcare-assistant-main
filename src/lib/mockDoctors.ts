export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  availability: string;
  rating: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  distance: string;
  open: boolean;
}

export function getDoctors(specialization: string): Doctor[] {
  const doctors: Doctor[] = [
    { id: "1", name: "Dr. Sarah Johnson", specialization: "General Physician", location: "City Medical Center, 2.1 km", availability: "Mon–Fri, 9AM–5PM", rating: 4.8 },
    { id: "2", name: "Dr. Raj Patel", specialization: "General Physician", location: "HealthPlus Clinic, 3.4 km", availability: "Mon–Sat, 10AM–6PM", rating: 4.6 },
    { id: "3", name: "Dr. Emily Chen", specialization: "Cardiologist", location: "Heart Care Hospital, 5.2 km", availability: "Tue–Sat, 8AM–4PM", rating: 4.9 },
    { id: "4", name: "Dr. Michael Brown", specialization: "Gastroenterologist", location: "Digestive Health Center, 4.0 km", availability: "Mon–Fri, 9AM–3PM", rating: 4.7 },
    { id: "5", name: "Dr. Anita Sharma", specialization: "Pulmonologist", location: "Breathing Well Clinic, 3.8 km", availability: "Wed–Sun, 10AM–5PM", rating: 4.5 },
  ];
  const lower = specialization.toLowerCase();
  const matched = doctors.filter((d) => d.specialization.toLowerCase().includes(lower));
  return matched.length > 0 ? matched : doctors.slice(0, 3);
}

export function getPharmacies(): Pharmacy[] {
  return [
    { id: "1", name: "MedPlus Pharmacy", location: "12 Main Street", distance: "0.8 km", open: true },
    { id: "2", name: "Apollo Pharmacy", location: "45 Health Avenue", distance: "1.2 km", open: true },
    { id: "3", name: "Care & Cure Pharmacy", location: "78 Park Road", distance: "2.5 km", open: false },
    { id: "4", name: "LifeLine Pharmacy", location: "23 Market Lane", distance: "3.1 km", open: true },
  ];
}
