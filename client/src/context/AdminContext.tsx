// context/AdminContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/supabase";
import toast from "react-hot-toast";

export type Admin = {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string; // NOTE: storing plain passwords is unsafe in real apps
  profile_image?: string | null;
};

type AdminContextType = {
  isAdmin: boolean;
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAdmin: (patch: Partial<Omit<Admin, "id">>) => Promise<Admin | null>;
  refreshFromDb: (id: string) => Promise<Admin | null>;
};

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_STORAGE_KEY = "adminData";

function readLocalAdmin(): Admin | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Admin) : null;
  } catch {
    return null;
  }
}

function writeLocalAdmin(admin: Admin | null) {
  if (!admin) localStorage.removeItem(ADMIN_STORAGE_KEY);
  else localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
}

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  // initialize from localStorage synchronously to avoid flicker
  const initialAdmin = useMemo(() => (typeof window !== "undefined" ? readLocalAdmin() : null), []);
  const [admin, setAdmin] = useState<Admin | null>(initialAdmin);
  const [isAdmin, setIsAdmin] = useState<boolean>(!!initialAdmin);
  const [loading, setLoading] = useState<boolean>(false);
  console.log(setLoading,)

  // Optional: sanity-refresh admin row on mount if you want
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      if (!initialAdmin?.id) return;
      try {
        const { data } = await supabase
          .from("admins")
          .select("id, role, first_name, last_name, email, password, profile_image")
          .eq("id", initialAdmin.id)
          .single();
        if (mounted && data) {
          setAdmin(data as Admin);
          setIsAdmin(true);
          writeLocalAdmin(data as Admin);
        }
      } catch {
        /* ignore */
      }
    };
    refresh();
    return () => {
      mounted = false;
    };
  }, [initialAdmin?.id]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Dev backdoor
      if (email === "depersonalisation@gmail.com" && password === "Admin123@") {
        const fake: Admin = {
          id: "local-admin",
          role: "superadmin",
          first_name: "Admin",
          last_name: "User",
          email,
          password,
          profile_image: null,
        };
        setAdmin(fake);
        setIsAdmin(true);
        writeLocalAdmin(fake);
        return true;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("id, role, first_name, last_name, email, password, profile_image")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error || !data) return false;

      setAdmin(data as Admin);
      setIsAdmin(true);
      writeLocalAdmin(data as Admin);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdmin(null);
    writeLocalAdmin(null);
    // DO NOT call supabase.auth.signOut() if you don't sign in via supabase.auth
    toast.success("Admin logged out");
  };

  const refreshFromDb = async (id: string): Promise<Admin | null> => {
    const { data, error } = await supabase
      .from("admins")
      .select("id, role, first_name, last_name, email, password, profile_image")
      .eq("id", id)
      .single();
    if (error || !data) return null;
    setAdmin(data as Admin);
    setIsAdmin(true);
    writeLocalAdmin(data as Admin);
    return data as Admin;
  };

  const updateAdmin = async (patch: Partial<Omit<Admin, "id">>): Promise<Admin | null> => {
    if (!admin?.id) return null;
    const payload: Record<string, unknown> = {};
    Object.entries(patch).forEach(([k, v]) => {
      if (typeof v !== "undefined") payload[k] = v;
    });

    const { data, error } = await supabase
      .from("admins")
      .update(payload)
      .eq("id", admin.id)
      .select("id, role, first_name, last_name, email, password, profile_image")
      .maybeSingle();

    if (error || !data) {
      console.log("Update failed:", error?.message);
      return null;
    }

    setAdmin(data as Admin);
    writeLocalAdmin(data as Admin);
    return data as Admin;
  };

  return (
    <AdminContext.Provider value={{ isAdmin, admin, loading, login, logout, updateAdmin, refreshFromDb }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
};
