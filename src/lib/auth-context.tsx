"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthUser {
  name: string;
  email: string;
  role: "admin" | "member";
  status: "approved" | "pending" | "rejected";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginAs: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginAs: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("getlead_auth") || localStorage.getItem("mapscout_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.status === "approved") {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginAs = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem("getlead_auth", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("getlead_auth");
    localStorage.removeItem("mapscout_auth");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
