"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [form, setForm] = useState({
    naam: "", email: "", telefoon: "", onderwerp: "", bericht: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-800 mb-2">{t("successTitle")}</h3>
        <p className="text-sm text-green-700">{t("successMessage")}</p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {t("name")} *
          </label>
          <input
            type="text"
            required
            value={form.naam}
            onChange={(e) => update("naam", e.target.value)}
            placeholder={t("namePlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {t("email")} *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={t("emailPlaceholder")}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {t("phone")}
          </label>
          <input
            type="tel"
            value={form.telefoon}
            onChange={(e) => update("telefoon", e.target.value)}
            placeholder={t("phonePlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {t("subject")}
          </label>
          <select
            value={form.onderwerp}
            onChange={(e) => update("onderwerp", e.target.value)}
            className={inputClass}
          >
            <option value="">{t("subjectDefault")}</option>
            <option value="product">{t("subjectProduct")}</option>
            <option value="order">{t("subjectOrder")}</option>
            <option value="reseller">{t("subjectReseller")}</option>
            <option value="sailschool">{t("subjectSailschool")}</option>
            <option value="other">{t("subjectOther")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          {t("message")} *
        </label>
        <textarea
          required
          rows={5}
          value={form.bericht}
          onChange={(e) => update("bericht", e.target.value)}
          placeholder={t("messagePlaceholder")}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold text-navy font-bold text-sm px-8 py-3.5 rounded-xl hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(200,168,92,0.4)] disabled:opacity-50 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        {submitting ? t("sending") : t("send")}
      </button>
    </form>
  );
}
