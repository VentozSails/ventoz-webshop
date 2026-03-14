"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

type PaymentState = "loading" | "PAID" | "FAILED" | "CANCELLED" | "PENDING" | "error";

export default function PaymentPage() {
  const t = useTranslations("payment");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const urlStatus = searchParams.get("status");

  const [state, setState] = useState<PaymentState>("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  const checkStatus = useCallback(async () => {
    if (!orderId) {
      setState("error");
      return;
    }

    if (urlStatus === "cancel") {
      setState("CANCELLED");
      return;
    }
    if (urlStatus === "error" || urlStatus === "reject") {
      setState("FAILED");
      return;
    }

    try {
      const res = await fetch(`/api/payment/status/${orderId}`);
      const data = await res.json();

      if (data.orderNumber) setOrderNumber(data.orderNumber);
      if (data.email) setEmail(data.email);

      if (data.status === "PAID" || data.status === "PENDING_PROCESSING") {
        setState("PAID");
      } else if (data.status === "FAILED") {
        setState("FAILED");
      } else if (data.status === "CANCELLED") {
        setState("CANCELLED");
      } else {
        setState("PENDING");
      }
    } catch {
      setState("error");
    }
  }, [orderId, urlStatus]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (state !== "loading" && state !== "PENDING") return;

    let attempts = 0;
    const interval = setInterval(async () => {
      if (attempts >= 30) {
        clearInterval(interval);
        return;
      }
      attempts++;

      try {
        const res = await fetch(`/api/payment/status/${orderId}`);
        const data = await res.json();
        if (data.orderNumber) setOrderNumber(data.orderNumber);
        if (data.email) setEmail(data.email);

        if (data.status === "PAID") {
          setState("PAID");
          clearInterval(interval);
        } else if (data.status === "FAILED" || data.status === "CANCELLED") {
          setState(data.status);
          clearInterval(interval);
        }
      } catch {
        // continue polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [state, orderId]);

  return (
    <div className="max-w-[600px] mx-auto px-6 py-16 text-center">
      {state === "loading" && (
        <>
          <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
          <h1 className="text-xl font-bold text-navy">{t("processing")}</h1>
        </>
      )}

      {state === "PENDING" && (
        <>
          <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
          <h1 className="text-xl font-bold text-navy">{t("pending")}</h1>
          {orderNumber && <p className="text-sm text-slate-500 mt-2">{t("orderNumber")}: {orderNumber}</p>}
        </>
      )}

      {state === "PAID" && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-navy">{t("orderConfirmed")}</h1>
          {orderNumber && (
            <p className="text-sm text-slate-500 mt-2">{t("orderNumber")}: <span className="font-mono font-bold">{orderNumber}</span></p>
          )}
          {email && (
            <p className="text-sm text-slate-500 mt-1">{t("emailSent", { email })}</p>
          )}
          <Link
            href="/catalogus"
            className="inline-block mt-6 bg-gold text-navy font-bold text-sm px-7 py-3 rounded-lg hover:brightness-110 transition-all"
          >
            {t("backToShop")}
          </Link>
        </>
      )}

      {state === "FAILED" && (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-navy">{t("failed")}</h1>
          <p className="text-sm text-slate-500 mt-2">{t("tryAgain")}</p>
          <Link
            href="/cart"
            className="inline-block mt-6 bg-gold text-navy font-bold text-sm px-7 py-3 rounded-lg hover:brightness-110 transition-all"
          >
            {t("retryPayment")}
          </Link>
        </>
      )}

      {state === "CANCELLED" && (
        <>
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-navy">{t("cancelled")}</h1>
          <Link
            href="/cart"
            className="inline-block mt-6 bg-gold text-navy font-bold text-sm px-7 py-3 rounded-lg hover:brightness-110 transition-all"
          >
            {t("retryPayment")}
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <h1 className="text-xl font-bold text-navy">{t("failed")}</h1>
          <Link
            href="/catalogus"
            className="inline-block mt-6 bg-gold text-navy font-bold text-sm px-7 py-3 rounded-lg hover:brightness-110 transition-all"
          >
            {t("backToShop")}
          </Link>
        </>
      )}
    </div>
  );
}
