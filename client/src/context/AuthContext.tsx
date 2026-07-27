import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
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

export type PlanCode = "free" | "bundle" | "pro";

export type UserProfileRow = {
  id?: string | number;
  auth_id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  profileUrl?: string | null;
  published?: boolean | null;
  isPremium?: boolean | null;
  premium_expires_at?: string | null;
  plan_code?: PlanCode | string | null;
  bundle_expires_at?: string | null;
  bundle_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  updated_at?: string | null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfileRow | null;
  loading: boolean;
  plan: PlanCode;
  premiumActive: boolean;
  bundleActive: boolean;
  premiumExpiresAt: string | null;
  bundleExpiresAt: string | null;
  signUp: (input: SignUpInput) => Promise<any>;
  signIn: (input: SignInInput) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getOAuthAvatar(user: User | null): string {
  const authUser = user as any;
  return (
    authUser?.user_metadata?.avatar_url ||
    authUser?.user_metadata?.picture ||
    authUser?.identities?.[0]?.identity_data?.avatar_url ||
    authUser?.identities?.[0]?.identity_data?.picture ||
    ""
  );
}

function computePremiumActive(profile: UserProfileRow | null): boolean {
  if (!profile?.isPremium) return false;
  const expiresAt = profile.premium_expires_at;
  if (!expiresAt) return true;
  const time = new Date(expiresAt).getTime();
  return Number.isFinite(time) ? time > Date.now() : Boolean(profile.isPremium);
}

function computeBundleActive(profile: UserProfileRow | null): boolean {
  const expiresAt = profile?.bundle_expires_at;
  if (!expiresAt) return false;
  const time = new Date(expiresAt).getTime();
  return Number.isFinite(time) ? time > Date.now() : false;
}

function computePlan(profile: UserProfileRow | null): PlanCode {
  const raw = String(profile?.plan_code ?? "").toLowerCase().trim();
  if (raw === "pro") return "pro";
  if (raw === "bundle") return "bundle";
  if (raw === "free") return "free";
  if (computePremiumActive(profile)) return "pro";
  if (computeBundleActive(profile)) return "bundle";
  return "free";
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
          "plan_code",
          "bundle_expires_at",
          "bundle_subscription_id",
          "stripe_customer_id",
          "stripe_subscription_id",
          "updated_at",
        ].join(","),
      )
      .eq("auth_id", authId)
      .maybeSingle();

    if (error) throw error;
    setProfile((data as UserProfileRow | null) ?? null);
  };

  const upsertUser = async (authUser: User) => {
    const meta = authUser.user_metadata as any;
    const avatar = getOAuthAvatar(authUser);

    const payload: Partial<UserProfileRow> = {
      auth_id: authUser.id,
      full_name: meta?.full_name || meta?.name || "",
      email: authUser.email ?? null,
      phone: meta?.phone || null,
      profileUrl: avatar || null,
      updated_at: new Date().toISOString(),
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

        const nextSession = data.session ?? null;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user?.id) {
          await upsertUser(nextSession.user);
          await fetchProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("restoreSession error:", error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void restoreSession();

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
          } catch (error) {
            console.error("onAuthStateChange error:", error);
          }
        })();
      },
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

    toast.success(
      data.session
        ? "Account created & logged in!"
        : "Account created. Please check your email to confirm your account.",
    );

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
  const bundleActive = useMemo(() => computeBundleActive(profile), [profile]);
  const plan = useMemo(() => computePlan(profile), [profile]);
  const premiumExpiresAt = profile?.premium_expires_at ?? null;
  const bundleExpiresAt = profile?.bundle_expires_at ?? null;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      loading,
      plan,
      premiumActive,
      bundleActive,
      premiumExpiresAt,
      bundleExpiresAt,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      refreshUser,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      plan,
      premiumActive,
      bundleActive,
      premiumExpiresAt,
      bundleExpiresAt,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
