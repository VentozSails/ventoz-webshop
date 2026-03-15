"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  getShippingRate,
  calculateVat,
  priceExclVat,
  COUNTRY_NAMES,
} from "@/lib/shipping";
import Image from "next/image";

const COUNTRIES = Object.entries(COUNTRY_NAMES).sort(([, a], [, b]) => a.localeCompare(b));

interface PaymentMethod {
  id: string;
  name: string;
  gateway: string;
  paymentOptionId?: number;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tProduct = useTranslations("product");
  const locale = useLocale();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile, signUp } = useAuth();
  const router = useRouter();

  const [country, setCountry] = useState("NL");
  const [sameAddress, setSameAddress] = useState(true);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  const [form, setForm] = useState({
    naam: "", email: "", telefoon: "",
    straat: "", huisnummer: "", postcode: "", woonplaats: "",
    factuur_straat: "", factuur_huisnummer: "", factuur_postcode: "", factuur_woonplaats: "",
    bedrijfsnaam: "", btw_nummer: "", opmerkingen: "",
  });

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: user.email ?? "" }));
    }
    if (profile?.voornaam && !form.naam) {
      const name = [profile.voornaam, profile.achternaam].filter(Boolean).join(" ");
      if (name) setForm((prev) => ({ ...prev, naam: name }));
    }
  }, [user, profile]);

  const [methodsLoading, setMethodsLoading] = useState(true);

  useEffect(() => {
    setMethodsLoading(true);
    fetch(`/api/payment-methods?country=${country}`)
      .then((r) => r.json())
      .then((data) => {
        const m = data.methods || [];
        setMethods(m);
        if (m.length > 0) {
          if (!m.find((pm: PaymentMethod) => pm.id === selectedMethod)) {
            setSelectedMethod(m[0].id);
          }
        }
      })
      .catch(() => setMethods([]))
      .finally(() => setMethodsLoading(false));
  }, [country]);

  if (items.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-navy mb-2">{tCart("empty")}</h1>
        <Link href="/catalogus" className="text-sm text-navy font-semibold hover:underline">
          {tCart("continueShopping")}
        </Link>
      </div>
    );
  }

  const shipping = getShippingRate(country);
  const hasReverseCharge = !!form.btw_nummer && country !== "NL";
  const vatInfo = calculateVat(subtotal, country, hasReverseCharge);
  const total = subtotal + vatInfo.vatAmount + shipping.cost;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.naam.trim()) errs.naam = t("required");
    if (!form.email.trim()) errs.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t("invalidEmail");
    if (!form.straat.trim()) errs.straat = t("required");
    if (!form.huisnummer.trim()) errs.huisnummer = t("required");
    if (!form.postcode.trim()) errs.postcode = t("required");
    if (!form.woonplaats.trim()) errs.woonplaats = t("required");
    if (!selectedMethod) errs.payment = t("selectPayment");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (createAccount && accountPassword.length < 6) {
      setErrors({ accountPassword: t("passwordMin") });
      return;
    }
    setSubmitting(true);

    try {
      // Optionally create account before checkout
      let userId = user?.id;
      if (!user && createAccount && accountPassword) {
        const result = await signUp(form.email, accountPassword);
        if (result.error) {
          setErrors({ submit: result.error });
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.productId,
            product_naam: i.naam,
            product_afbeelding: i.image,
            aantal: i.qty,
            stukprijs: i.prijs,
          })),
          ...form,
          user_id: userId || undefined,
          land_code: country,
          same_address: sameAddress,
          payment_method: selectedMethod,
          payment_gateway: methods.find((m) => m.id === selectedMethod)?.gateway || "pay_nl",
          payment_option_id: methods.find((m) => m.id === selectedMethod)?.paymentOptionId,
          subtotaal: subtotal,
          btw_bedrag: vatInfo.vatAmount,
          btw_percentage: vatInfo.vatRate,
          btw_verlegd: vatInfo.reverseCharged,
          verzendkosten: shipping.cost,
          totaal: total,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || `Server error (${res.status})`;
        console.error("Checkout API error:", res.status, errMsg);
        setErrors({ submit: errMsg });
        setSubmitting(false);
        return;
      }

      if (data.paymentUrl) {
        clearCart();
        window.location.href = data.paymentUrl;
      } else {
        setErrors({ submit: data.error || "No payment URL received — please try again" });
        setSubmitting(false);
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors ${
      errors[field] ? "border-red-400 bg-red-50" : "border-slate-200"
    }`;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-navy mb-6">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-6">
          {/* Delivery Address */}
          <section className="bg-white border border-border-default rounded-xl p-6">
            <h2 className="text-sm font-bold text-navy mb-4">{t("deliveryAddress")}</h2>
            <div className="space-y-3">
              <div>
                <input type="text" placeholder={t("name")} value={form.naam} onChange={(e) => updateField("naam", e.target.value)} className={inputClass("naam")} />
                {errors.naam && <p className="text-xs text-red-500 mt-1">{errors.naam}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input type="email" placeholder={t("email")} value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass("email")} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <input type="tel" placeholder={t("phone")} value={form.telefoon} onChange={(e) => updateField("telefoon", e.target.value)} className={inputClass("telefoon")} />
              </div>
              <div className="grid grid-cols-[1fr_100px] gap-3">
                <div>
                  <input type="text" placeholder={t("street")} value={form.straat} onChange={(e) => updateField("straat", e.target.value)} className={inputClass("straat")} />
                  {errors.straat && <p className="text-xs text-red-500 mt-1">{errors.straat}</p>}
                </div>
                <div>
                  <input type="text" placeholder={t("houseNumber")} value={form.huisnummer} onChange={(e) => updateField("huisnummer", e.target.value)} className={inputClass("huisnummer")} />
                  {errors.huisnummer && <p className="text-xs text-red-500 mt-1">{errors.huisnummer}</p>}
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-3">
                <div>
                  <input type="text" placeholder={t("postcode")} value={form.postcode} onChange={(e) => updateField("postcode", e.target.value)} className={inputClass("postcode")} />
                  {errors.postcode && <p className="text-xs text-red-500 mt-1">{errors.postcode}</p>}
                </div>
                <div>
                  <input type="text" placeholder={t("city")} value={form.woonplaats} onChange={(e) => updateField("woonplaats", e.target.value)} className={inputClass("woonplaats")} />
                  {errors.woonplaats && <p className="text-xs text-red-500 mt-1">{errors.woonplaats}</p>}
                </div>
              </div>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50">
                {COUNTRIES.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Invoice Address */}
          <section className="bg-white border border-border-default rounded-xl p-6">
            <h2 className="text-sm font-bold text-navy mb-4">{t("invoiceAddress")}</h2>
            <label className="flex items-center gap-2 text-sm text-slate-600 mb-3 cursor-pointer">
              <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} className="rounded" />
              {t("sameAsDelivery")}
            </label>
            {!sameAddress && (
              <div className="space-y-3 mt-3">
                <input type="text" placeholder={t("companyName")} value={form.bedrijfsnaam} onChange={(e) => updateField("bedrijfsnaam", e.target.value)} className={inputClass("bedrijfsnaam")} />
                <input type="text" placeholder={t("vatNumber")} value={form.btw_nummer} onChange={(e) => updateField("btw_nummer", e.target.value)} className={inputClass("btw_nummer")} />
                <div className="grid grid-cols-[1fr_100px] gap-3">
                  <input type="text" placeholder={t("street")} value={form.factuur_straat} onChange={(e) => updateField("factuur_straat", e.target.value)} className={inputClass("factuur_straat")} />
                  <input type="text" placeholder={t("houseNumber")} value={form.factuur_huisnummer} onChange={(e) => updateField("factuur_huisnummer", e.target.value)} className={inputClass("factuur_huisnummer")} />
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <input type="text" placeholder={t("postcode")} value={form.factuur_postcode} onChange={(e) => updateField("factuur_postcode", e.target.value)} className={inputClass("factuur_postcode")} />
                  <input type="text" placeholder={t("city")} value={form.factuur_woonplaats} onChange={(e) => updateField("factuur_woonplaats", e.target.value)} className={inputClass("factuur_woonplaats")} />
                </div>
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="bg-white border border-border-default rounded-xl p-6">
            <h2 className="text-sm font-bold text-navy mb-4">{t("notes")}</h2>
            <textarea
              placeholder={t("notesPlaceholder")}
              value={form.opmerkingen}
              onChange={(e) => updateField("opmerkingen", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
            />
          </section>

          {/* Account creation (only for guests) */}
          {!user && (
            <section className="bg-white border border-border-default rounded-xl p-6">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="rounded accent-gold"
                />
                {t("createAccountCheckout")}
              </label>
              {createAccount && (
                <div className="mt-3">
                  <input
                    type="password"
                    placeholder={t("choosePassword")}
                    value={accountPassword}
                    onChange={(e) => {
                      setAccountPassword(e.target.value);
                      if (errors.accountPassword) setErrors((prev) => ({ ...prev, accountPassword: "" }));
                    }}
                    minLength={6}
                    className={inputClass("accountPassword")}
                  />
                  {errors.accountPassword && <p className="text-xs text-red-500 mt-1">{errors.accountPassword}</p>}
                  <p className="text-[11px] text-slate-400 mt-1.5">{t("accountBenefits")}</p>
                </div>
              )}
            </section>
          )}

          {/* Logged-in reseller discount notice */}
          {user && profile?.korting && profile.korting > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-3">
              <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700">
                {t("resellerDiscount", { pct: profile.korting })}
              </p>
            </div>
          )}

          {/* Payment Method */}
          <section className="bg-white border border-border-default rounded-xl p-6">
            <h2 className="text-sm font-bold text-navy mb-4">{t("paymentMethod")}</h2>
            {methodsLoading ? (
              <div className="flex items-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">{t("loadingPaymentMethods") || "Loading payment methods..."}</span>
              </div>
            ) : methods.length === 0 ? (
              <p className="text-sm text-slate-400">{t("noPaymentMethods") || t("selectPayment")}</p>
            ) : (
              <div className="space-y-2">
                {methods.map((m) => (
                  <label
                    key={`${m.gateway}-${m.id}`}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === m.id ? "border-gold bg-gold/5" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={selectedMethod === m.id}
                      onChange={() => setSelectedMethod(m.id)}
                      className="accent-gold"
                    />
                    <span className="text-sm text-navy font-medium">{m.name}</span>
                    <span className="text-[10px] text-slate-300 ml-auto">{m.gateway === "pay_nl" ? "Pay.nl" : "Buckaroo"}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.payment && <p className="text-xs text-red-500 mt-2">{errors.payment}</p>}
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-white border border-border-default rounded-xl p-6">
            <h2 className="text-sm font-bold text-navy mb-4">{t("orderSummary")}</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  {item.image && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-card-placeholder shrink-0">
                      <Image src={item.image} alt={item.naam} fill className="object-contain p-0.5" sizes="48px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy truncate">{item.naam}</p>
                    <p className="text-xs text-slate-400">{item.qty}x</p>
                  </div>
                  <p className="text-xs font-bold text-navy">
                    &euro; {(item.prijs * item.qty).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border-default pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{tCart("subtotal")} ({tProduct("exclVat")})</span>
                <span className="font-semibold text-navy">&euro; {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{tCart("shipping")}</span>
                <span className="font-semibold text-navy">
                  {shipping.cost === 0 ? tCart("free") : `€ ${shipping.cost.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {vatInfo.reverseCharged ? tCart("vatReverse") : `${tCart("vat")} (${vatInfo.vatRate}%)`}
                </span>
                <span className="font-semibold text-navy">
                  {vatInfo.reverseCharged ? "€ 0,00" : `€ ${vatInfo.vatAmount.toFixed(2).replace(".", ",")}`}
                </span>
              </div>
              <div className="border-t border-border-default pt-2 flex justify-between text-base">
                <span className="font-bold text-navy">{tCart("total")}</span>
                <span className="font-bold text-navy">&euro; {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {errors.submit && (
              <p className="text-xs text-red-500 mt-3 bg-red-50 p-2 rounded">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 bg-gold text-navy font-bold text-sm px-7 py-3.5 rounded-lg hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(200,168,92,0.4)] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? t("processing") : t("placeOrder")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
