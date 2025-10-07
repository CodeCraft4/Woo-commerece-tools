"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabase";

type Admin = {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_image?: string;
};

type AdminContextType = {
  isAdmin: boolean;
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(
    typeof window !== "undefined" && localStorage.getItem("isAdmin") === "true"
  );
  const [admin, setAdmin] = useState<Admin | null>(null);

  // Restore session from localStorage (on refresh)
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminData");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  // Login function — check Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      console.error("Invalid credentials:", error);
      return false;
    }
    setIsAdmin(true);
    setAdmin(data);
    return true;
  };

  const logout = () => {
    setIsAdmin(false);
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, admin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};
