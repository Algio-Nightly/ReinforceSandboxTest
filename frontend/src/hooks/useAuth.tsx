import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import { api } from "../services/api";
import { signInWithGooglePopup } from "../services/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem("token", userData.access_token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login(email, pass);
    handleAuthSuccess(res);
  };

  const register = async (email: string, pass: string, name?: string) => {
    const res = await api.auth.register(email, pass, name);
    handleAuthSuccess(res);
  };

  const loginWithGoogle = async () => {
    const idToken = await signInWithGooglePopup();
    const res = await api.auth.google(idToken);
    handleAuthSuccess(res);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
