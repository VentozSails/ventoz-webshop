"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient, type User, type Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserProfile {
  id: string;
  email: string;
  role: string | null;
  korting: number;
  bedrijfsnaam: string | null;
  btw_nummer: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isReseller: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSession(session: Session | null) {
    if (session?.user) {
      setUser(session.user);
      await loadProfile(session.user.id, session.user.email || "");
    } else {
      setUser(null);
      setProfile(null);
    }
  }

  async function loadProfile(userId: string, email: string) {
    try {
      const { data } = await supabase
        .from("customers")
        .select("id, rol, korting_percentage, bedrijfsnaam, btw_nummer")
        .eq("user_id", userId)
        .maybeSingle();

      setProfile({
        id: userId,
        email,
        role: data?.rol || "klant",
        korting: data?.korting_percentage || 0,
        bedrijfsnaam: data?.bedrijfsnaam || null,
        btw_nummer: data?.btw_nummer || null,
      });
    } catch {
      setProfile({
        id: userId,
        email,
        role: "klant",
        korting: 0,
        bedrijfsnaam: null,
        btw_nummer: null,
      });
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const isReseller = profile?.role === "wederverkoper";

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, isReseller }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
