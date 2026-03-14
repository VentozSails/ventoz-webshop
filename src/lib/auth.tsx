"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient, type User, type Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface UserProfile {
  id: string;
  email: string;
  role: string;
  korting: number;
  bedrijfsnaam: string | null;
  btw_nummer: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  voornaam: string | null;
  achternaam: string | null;
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

function effectiveKorting(row: {
  korting_permanent?: number | null;
  korting_tijdelijk?: number | null;
  korting_geldig_tot?: string | null;
}): number {
  const perm = Number(row.korting_permanent) || 0;
  const temp = Number(row.korting_tijdelijk) || 0;
  if (temp > 0 && row.korting_geldig_tot) {
    const expiry = new Date(row.korting_geldig_tot);
    if (expiry > new Date()) return Math.max(perm, temp);
  }
  return perm;
}

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
        .from("ventoz_users")
        .select(
          "user_type, is_admin, is_owner, korting_permanent, korting_tijdelijk, korting_geldig_tot, bedrijfsnaam, btw_nummer, voornaam, achternaam"
        )
        .or(`auth_user_id.eq.${userId},email.eq.${email.toLowerCase()}`)
        .maybeSingle();

      if (data) {
        setProfile({
          id: userId,
          email,
          role: data.user_type || "klant",
          korting: effectiveKorting(data),
          bedrijfsnaam: data.bedrijfsnaam || null,
          btw_nummer: data.btw_nummer || null,
          isAdmin: data.is_admin || data.is_owner || false,
          isOwner: data.is_owner || false,
          voornaam: data.voornaam || null,
          achternaam: data.achternaam || null,
        });
      } else {
        setProfile({
          id: userId,
          email,
          role: "klant",
          korting: 0,
          bedrijfsnaam: null,
          btw_nummer: null,
          isAdmin: false,
          isOwner: false,
          voornaam: null,
          achternaam: null,
        });
      }
    } catch {
      setProfile({
        id: userId,
        email,
        role: "klant",
        korting: 0,
        bedrijfsnaam: null,
        btw_nummer: null,
        isAdmin: false,
        isOwner: false,
        voornaam: null,
        achternaam: null,
      });
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      try {
        await fetch("/api/register-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: data.user.id, email }),
        });
      } catch {
        // Non-blocking: profile will be created on next login if this fails
      }
    }

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
