import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../supabase/supabase';

type Admin = {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_image?: string;
};

interface AdminState {
  isAdmin: boolean;
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setAdmin: (admin: Admin | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, _) => ({
      isAdmin: false,
      admin: null,

      setAdmin: (admin) => set({ admin }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),

      // Login function (Supabase + fallback)
      login: async (email: string, password: string): Promise<boolean> => {
        try {
          // Check hardcoded admin first (optional)
          if (email === "admin123@gmail.com" && password === "Admin123@") {
            const fakeAdmin: Admin = {
              id: "local-admin",
              role: "superadmin",
              first_name: "Admin",
              last_name: "User",
              email,
              password,
            };
            set({ isAdmin: true, admin: fakeAdmin });
            return true;
          }

          // Otherwise, check Supabase
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

          set({ isAdmin: true, admin: data });
          return true;
        } catch (err) {
          console.error("Login error:", err);
          return false;
        }
      },

      // Logout function
      logout: () => {
        set({ isAdmin: false, admin: null });
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ 
        isAdmin: state.isAdmin, 
        admin: state.admin 
      }),
    }
  )
);
