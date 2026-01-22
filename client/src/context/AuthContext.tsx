/* ========================================================================== */
/* FILE: src/context/AuthContext.tsx                                          */
/* ========================================================================== */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
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

export type UserProfileRow = {
  id?: string | number;
  auth_id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  profileUrl?: string | null;
  published?: boolean | null;

  // ✅ Premium fields (DB columns)
  isPremium?: boolean | null;
  premium_expires_at?: string | null;

  // optional (if you store)
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileRow | null;
  loading: boolean;

  // ✅ easy flags for app-wide usage
  premiumActive: boolean;
  premiumExpiresAt: string | null;

  signUp: (input: SignUpInput) => Promise<any>;
  signIn: (input: SignInInput) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getOAuthAvatar(user: User | null): string {
  const u: any = user;
  return (
    u?.user_metadata?.avatar_url ||
    u?.user_metadata?.picture ||
    u?.identities?.[0]?.identity_data?.avatar_url ||
    u?.identities?.[0]?.identity_data?.picture ||
    ""
  );
}

function computePremiumActive(profile: UserProfileRow | null): boolean {
  if (!profile?.isPremium) return false;

  const expiresAt = profile.premium_expires_at;
  if (!expiresAt) return true;

  const t = new Date(expiresAt).getTime();
  if (!Number.isFinite(t)) return Boolean(profile.isPremium);
  return t > Date.now();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/`
      : "https://diypersonalisation.com/";

  const fetchProfile = async (authId: string) => {
    const { data, error } = await supabase
      .from("Users")
      .select(
        [
          "id",
          "auth_id",
          "full_name",
          "phone",
          "email",
          "profileUrl",
          "published",
          "isPremium",
          "premium_expires_at",
          "stripe_customer_id",
          "stripe_subscription_id",
        ].join(",")
      )
      .eq("auth_id", authId)
      .maybeSingle();

    if (error) throw error;
    setProfile((data as any) ?? null);
  };

  const upsertUser = async (authUser: User) => {
    const meta: any = authUser.user_metadata ?? {};
    const avatar = getOAuthAvatar(authUser);

    const payload: UserProfileRow = {
      auth_id: authUser.id,
      full_name: meta?.full_name || meta?.name || "",
      email: authUser.email ?? null,
      phone: meta?.phone || null,
      profileUrl: avatar || null,
    };

    const { error } = await supabase
      .from("Users")
      .upsert([payload], { onConflict: "auth_id" });

    if (error) console.error("Upsert user error:", error);
  };

  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    setUser(data.user ?? null);
  };

  const refreshProfile = async () => {
    const authId = user?.id;
    if (!authId) {
      setProfile(null);
      return;
    }
    await fetchProfile(authId);
  };

  useEffect(() => {
    let alive = true;

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn("getSession error:", error);

        if (!alive) return;

        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);

        if (data.session?.user?.id) {
          await upsertUser(data.session.user);
          await fetchProfile(data.session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("restoreSession error:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void (async () => {
          try {
            setSession(nextSession ?? null);
            setUser(nextSession?.user ?? null);

            if (nextSession?.user) {
              await upsertUser(nextSession.user);
              await fetchProfile(nextSession.user.id);
            } else {
              setProfile(null);
            }
          } catch (e) {
            console.error("onAuthStateChange error:", e);
          }
        })();
      }
    );

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ fullName, phone, email, password }: SignUpInput) => {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw error;

    if (data.user) {
      await upsertUser(data.user);
      await fetchProfile(data.user.id);
    }

    if (!data.session) {
      toast.success("Account created. Please check your email to confirm your account.");
    } else {
      toast.success("Account created & logged in!");
    }

    return data;
  };

  const signIn = async ({ email, password }: SignInInput) => {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await upsertUser(data.user);
      await fetchProfile(data.user.id);
    }

    return data;
  };

  const signInWithGoogle = async () => {
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error("Unable to start Google sign-in.");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const premiumActive = useMemo(() => computePremiumActive(profile), [profile]);
  const premiumExpiresAt = profile?.premium_expires_at ?? null;

  const value: AuthContextType = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,

      premiumActive,
      premiumExpiresAt,

      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      refreshUser,
      refreshProfile,
    }),
    [user, session, profile, loading, premiumActive, premiumExpiresAt]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
