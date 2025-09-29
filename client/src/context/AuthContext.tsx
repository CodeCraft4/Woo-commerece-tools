import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";

// 🔹 Types for SignUp and SignIn inputs
interface SignUpInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword?:string
}

interface SignInInput {
  email: string;
  password: string;
}

// 🔹 AuthContext type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (input: SignUpInput) => Promise<any>;
  signIn: (input: SignInInput) => Promise<any>;
  signOut: () => Promise<void>;
}

// Default value (null until initialized)
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 🔹 Signup (with extra fields)
 const signUp = async ({ fullName, phone, email, password }: SignUpInput) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
       emailRedirectTo: undefined,
    },
  });

  if (error) throw error;

  return data;
};




  // 🔹 Signin
  const signIn = async ({ email, password }: SignInInput) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
