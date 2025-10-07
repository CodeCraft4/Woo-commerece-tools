import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";

interface SignUpInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface SignInInput {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<any>;
  signIn: (input: SignInInput) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Watch for auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // ✅ After Google login or normal signup, ensure record exists in DB
      if (currentUser) {
        await upsertUser(currentUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Helper: Insert user into "Users" table if not already there
  const upsertUser = async (authUser: User) => {
    try {
      const { data: existing } = await supabase
        .from("Users")
        .select("id")
        .eq("auth_id", authUser.id)
        .single();

      if (!existing) {
        await supabase.from("Users").insert([
          {
            auth_id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "",
            email: authUser.email,
            phone: authUser.user_metadata?.phone || null,
            password: null, // optional — don’t store plain passwords!
          },
        ]);
      }
    } catch (err) {
      console.error("Error upserting user:", err);
    }
  };

  // 🔹 Email + Password Signup
  const signUp = async ({ fullName, phone, email, password }: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (error) throw error;

    const authUser = data.user;
    if (authUser) {
      await upsertUser(authUser);
    }

    return data;
  };

  // 🔹 Email + Password Signin
  const signIn = async ({ email, password }: SignInInput) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const authUser = data.user;
    if (authUser) {
      await upsertUser(authUser);
    }

    return data;
  };

  // 🔹 Google Signin
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  };

  // 🔹 Signout
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
