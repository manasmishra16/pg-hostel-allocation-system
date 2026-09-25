"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  demoLogin: (role: "TENANT" | "PROPERTY_OWNER" | "WARDEN" | "STAFF" | "SUPER_ADMIN") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("staynest_token");
    if (savedToken) {
      setToken(savedToken);
      api.auth
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("staynest_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password = "password123") => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem("staynest_token", res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: "TENANT" | "PROPERTY_OWNER" | "WARDEN" | "STAFF" | "SUPER_ADMIN") => {
    const emailMap: Record<string, string> = {
      TENANT: "manas@staynest.com",
      PROPERTY_OWNER: "owner@staynest.com",
      WARDEN: "warden@staynest.com",
      STAFF: "staff@staynest.com",
      SUPER_ADMIN: "admin@staynest.com",
    };
    const email = emailMap[role] || "manas@staynest.com";
    await login(email, "password123");
  };

  const logout = () => {
    localStorage.removeItem("staynest_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
