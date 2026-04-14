import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  height?: string;
  weight?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("smartcare_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1200));
    const stored = localStorage.getItem("smartcare_users");
    const users: Record<string, any> = stored ? JSON.parse(stored) : {};
    const found = Object.values(users).find((u: any) => u.email === email);
    if (!found) return false;
    setUser(found as User);
    localStorage.setItem("smartcare_user", JSON.stringify(found));
    return true;
  };

  const signup = async (data: { fullName: string; email: string; phone: string; password: string }): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1200));
    const newUser: User = { id: crypto.randomUUID(), ...data };
    const stored = localStorage.getItem("smartcare_users");
    const users: Record<string, any> = stored ? JSON.parse(stored) : {};
    users[newUser.id] = newUser;
    localStorage.setItem("smartcare_users", JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem("smartcare_user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smartcare_user");
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("smartcare_user", JSON.stringify(updated));
    const stored = localStorage.getItem("smartcare_users");
    const users: Record<string, any> = stored ? JSON.parse(stored) : {};
    users[updated.id] = updated;
    localStorage.setItem("smartcare_users", JSON.stringify(users));
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
