export interface HistoryEntry {
  id: string;
  symptoms: string[];
  disease: string;
  severity: "mild" | "moderate" | "critical";
  doctorType: string;
  date: string;
}

const STORAGE_KEY = "smartcare_history";

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

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
