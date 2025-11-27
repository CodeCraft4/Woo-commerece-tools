import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";
import toast from "react-hot-toast";

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
    const restoreSession = async () => {
      try {
        // ✅ First, check if we have a Supabase session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.warn("Supabase getSession error:", error);
        }

        if (session?.user) {
          setUser(session.user);
        } else {
          // ✅ Try localStorage fallback (optional)
          const local = localStorage.getItem("supabase.auth.token");
          if (local) {
            console.log("Found local session, waiting for Supabase restore...");
          }
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
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
            full_name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              "",
            email: authUser.email,
            phone: authUser.user_metadata?.phone || null,
            password: null, 
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

  const redirectTo =
    window.location.hostname === "localhost"
      ? "http://localhost:5173/"
      : "https://diypersonalisation.com/";
  // 🔹 Google Signin
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    toast.success("User is Logged In")
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
      {children}
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
