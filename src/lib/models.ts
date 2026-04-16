export interface UserModule {
  id: string;
  symptoms: string[];
  history: any[];
  bookings: any[];
}

export interface DoctorModule {
  id: string;
  name: string;
  specialization: string;
  availableSlots: string[];
}

export interface PharmacyModule {
  id: string;
  name: string;
  medicines: string[];
  pricing: Record<string, number>;
}

export interface AdminModule {
  manageDoctors: (actions: any) => void;
  managePharmacies: (actions: any) => void;
  viewAllBookingsOrders: () => { bookings: any[]; orders: any[] };
}
