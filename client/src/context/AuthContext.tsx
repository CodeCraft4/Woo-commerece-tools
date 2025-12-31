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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/`
      : "https://diypersonalisation.com/";

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) console.warn("Supabase getSession error:", error);
        setUser(session?.user ?? null);
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

  // Upsert user record in "Users" table
  const upsertUser = async (authUser: User) => {
    try {
      const { data: existing } = await supabase
        .from("Users")
        .select("id")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("Users").insert([
          {
            auth_id: authUser.id,
            full_name:
              (authUser.user_metadata as any)?.full_name ||
              (authUser.user_metadata as any)?.name ||
              "",
            email: authUser.email,
            phone: (authUser.user_metadata as any)?.phone || null,
            password: null, // why: never store provider passwords
          },
        ]);
      }
    } catch (err) {
      console.error("Error upserting user:", err);
    }
  };

 const signUp = async ({ fullName, phone, email, password }: SignUpInput) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
      // Very important for email confirmation link redirect.
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    const message = error.message?.toLowerCase() ?? "";
    if (message.includes("failed to send email")) {
      const { data: adminData, error: adminError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, phone },
        });

      if (adminError) throw adminError;
      if (adminData.user) await upsertUser(adminData.user);
      toast.success("Account created. Email confirmation skipped.");
      return adminData;
    }

    throw error;
  }

  if (data.user) await upsertUser(data.user);

  if (!data.session) {
    toast.success("Account created. Please check your email to confirm your account.");
  } else {
    toast.success("Account created & logged in!");
  }

  return data;
};


 const signIn = async ({ email, password }: SignInInput) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    toast.error(error.message); // Show exact reason (email not confirmed, etc.).
    throw error;
  }

  if (data.user) await upsertUser(data.user);
  toast.success("Logged in successfully");
  return data;
};


  const signInWithGoogle = async (): Promise<void> => {
    // why: signInWithOAuth will navigate away; only show success after we return authenticated
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      toast.error(error.message || "Google sign-in failed");
      throw error;
    }

    // If no error, browser will redirect to Google immediately.
    // After redirect back, onAuthStateChange will set the user.
    if (!data?.url) {
      // Defensive: if SDK didnâ€™t redirect (popup blockers or SSR)
      toast.error("Unable to start Google sign-in.");
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      toast.error("Sign out failed");
      return;
    }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};


