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
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore admin from localStorage and Supabase session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedAdmin = localStorage.getItem("adminData");

        if (storedAdmin) {
          const parsed = JSON.parse(storedAdmin);
          setAdmin(parsed);
          setIsAdmin(true);
        }

        // Optional: Check Supabase auth session (for consistency)
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn("Supabase session error:", error);
        if (data.session) {
        }

      } catch (err) {
        console.error("Error restoring admin session:", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ✅ Login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Logging in admin:", email);

      // Hardcoded admin (optional)
      if (email === "admin123@gmail.com" && password === "Admin123@") {
        const fakeAdmin: Admin = {
          id: "local-admin",
          role: "superadmin",
          first_name: "Admin",
          last_name: "User",
          email,
          password,
        };
        setIsAdmin(true);
        setAdmin(fakeAdmin);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminData", JSON.stringify(fakeAdmin));
        console.log("✅ Local admin login successful");
        return true;
      }

      // Supabase login
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error || !data) {
        console.error("❌ Invalid credentials:", error);
        return false;
      }

      setIsAdmin(true);
      setAdmin(data);
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminData", JSON.stringify(data));
      console.log("✅ Supabase admin login successful:", data);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // ✅ Logout
  const logout = () => {
    setIsAdmin(false);
    setAdmin(null);
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminData");
    supabase.auth.signOut();
  };

  return (
    <AdminContext.Provider value={{ isAdmin, admin, loading, login, logout }}>
      {loading ? <div>Loading...</div> : children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};
