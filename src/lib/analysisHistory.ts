export interface HistoryEntry {
  id: string;
  symptoms: string[];
  disease: string;
  severity: "mild" | "moderate" | "critical";
  doctorType: string;
  date: string;
}

export interface AppointmentHistory {
  id: string;
  doctorName: string;
  specialization: string;
  selectedTime: string;
  symptoms: string[];
  date: string;
}

export interface OrderHistory {
  id: string;
  pharmacyName: string;
  medicines: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  deliveryAddress: string;
  date: string;
}

const STORAGE_KEY = "smartcare_history";
const APPT_KEY = "smartcare_appointments";
const ORDER_KEY = "smartcare_orders";

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, "id" | "date">): void {
  const history = getHistory();
  history.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function getAppointments(): AppointmentHistory[] {
  try {
    return JSON.parse(localStorage.getItem(APPT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAppointment(entry: Omit<AppointmentHistory, "id" | "date">): void {
  const appointments = getAppointments();
  appointments.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  localStorage.setItem(APPT_KEY, JSON.stringify(appointments.slice(0, 50)));
}

export function getOrders(): OrderHistory[] {
  try {
    return JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrder(entry: Omit<OrderHistory, "id" | "date">): void {
  const orders = getOrders();
  orders.unshift({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders.slice(0, 50)));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(APPT_KEY);
  localStorage.removeItem(ORDER_KEY);
}
