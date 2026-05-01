import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "patient" | "doctor" | "pharmacist";
  age?: number;
  gender?: string;
  height?: string;
  weight?: string;
  avatarUrl?: string;
  location?: string;
  hospitalName?: string;
  specialization?: string;
  experience?: string;
  pharmacyName?: string;
  licenseNumber?: string;
}

interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: "patient" | "doctor" | "pharmacist";
  hospitalName?: string;
  specialization?: string;
  experience?: string;
  pharmacyName?: string;
  licenseNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user") || localStorage.getItem("smartcare_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        id: parsed.id,
        fullName: parsed.name || parsed.fullName || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        role: parsed.role || "patient",
        location: parsed.location || "",
        hospitalName: parsed.hospitalName,
        specialization: parsed.specialization,
        experience: parsed.experience,
        pharmacyName: parsed.pharmacyName,
        licenseNumber: parsed.licenseNumber,
      };
    }
    return null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Login request:", email, password);
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        console.error("Login failed:", await res.json());
        return false;
      }

      const data = await res.json();
      console.log("Response:", data);

      localStorage.setItem("user", JSON.stringify(data.user));

      const loggedInUser: User = {
        id: data.user.id,
        fullName: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
        role: data.user.role,
        location: data.user.location || "",
        age: data.user.age || undefined,
        gender: data.user.gender || undefined,
        height: data.user.height || undefined,
        weight: data.user.weight || undefined,
        hospitalName: data.user.hospitalName,
        specialization: data.user.specialization,
        experience: data.user.experience,
        pharmacyName: data.user.pharmacyName,
        licenseNumber: data.user.licenseNumber,
      };

      setUser(loggedInUser);
      return true;
    } catch (error) {
      console.error("Error logging in:", error);
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const res = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          password: data.password,
          role: data.role,
          hospitalName: data.hospitalName,
          specialization: data.specialization,
          experience: data.experience,
          pharmacyName: data.pharmacyName,
          licenseNumber: data.licenseNumber,
        }),
      });

      if (!res.ok) {
        console.error("Signup failed:", await res.json());
        return false;
      }

      // After successful signup, log them in directly
      return await login(data.email, data.password);
    } catch (error) {
      console.error("Error signing up:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("smartcare_user");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    
    // Optimistic UI update
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));

    // Persist to backend
    try {
      await fetch("http://127.0.0.1:5000/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: updated.fullName,
          phone: updated.phone,
          age: updated.age,
          gender: updated.gender,
          height: updated.height,
          weight: updated.weight,
          location: updated.location
        }),
      });
    } catch (err) {
      console.error("Failed to sync profile update to backend:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
