"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  order_nummer: string;
  status: string;
  totaal: number;
  created_at: string;
}

export default function AccountPage() {
  const t = useTranslations("account");
  const { user, profile, loading, signIn, signUp, signOut, isReseller } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  async function loadOrders() {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("id, order_nummer, status, totaal, created_at")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false })
      .limit(20);
    setOrders(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = mode === "login"
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.error) setError(result.error);
    setSubmitting(false);
  }

  const statusColors: Record<string, string> = {
    concept: "bg-slate-100 text-slate-600",
    betaling_gestart: "bg-yellow-100 text-yellow-700",
    betaald: "bg-green-100 text-green-700",
    verzonden: "bg-blue-100 text-blue-700",
    afgeleverd: "bg-emerald-100 text-emerald-700",
    geannuleerd: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-slate-400 mt-4">{t("loading")}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[400px] mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-navy mb-6 text-center">
          {mode === "login" ? t("signIn") : t("createAccount")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
          />

          {error && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-navy font-bold text-sm px-7 py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "..." : mode === "login" ? t("signIn") : t("createAccount")}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-navy font-semibold hover:underline cursor-pointer"
          >
            {mode === "login" ? t("createOne") : t("signInLink")}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-navy">{t("myAccount")}</h1>
          {profile?.voornaam || profile?.achternaam ? (
            <p className="text-sm font-medium text-slate-700 mt-1">
              {[profile.voornaam, profile.achternaam].filter(Boolean).join(" ")}
            </p>
          ) : null}
          <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {profile?.isOwner && (
              <span className="text-[10px] font-bold text-white bg-navy px-2 py-0.5 rounded uppercase">Owner</span>
            )}
            {profile?.isAdmin && !profile?.isOwner && (
              <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded uppercase">Admin</span>
            )}
            {isReseller && (
              <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded uppercase">
                {t("reseller")}
              </span>
            )}
          </div>
          {profile?.korting ? (
            <p className="text-xs text-green-600 mt-1">{t("discount", { pct: profile.korting })}</p>
          ) : null}
          {profile?.bedrijfsnaam && (
            <p className="text-xs text-slate-400 mt-0.5">{profile.bedrijfsnaam}</p>
          )}
        </div>
        <button
          onClick={signOut}
          className="text-sm text-slate-500 hover:text-navy font-medium cursor-pointer"
        >
          {t("signOut")}
        </button>
      </div>

      <h2 className="text-sm font-bold text-navy mb-3">{t("orderHistory")}</h2>

      {orders.length === 0 ? (
        <p className="text-sm text-slate-400">{t("noOrders")}</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between bg-white border border-border-default rounded-xl p-4"
            >
              <div>
                <p className="text-sm font-semibold text-navy font-mono">{order.order_nummer}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusColors[order.status] || "bg-slate-100 text-slate-600"}`}>
                  {order.status}
                </span>
                <p className="text-sm font-bold text-navy mt-1">
                  &euro; {order.totaal.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
