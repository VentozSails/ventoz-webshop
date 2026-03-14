"use client";

import { useVat } from "@/lib/vat";

export default function VatToggle() {
  const { exclVat, toggleVat } = useVat();

  return (
    <button
      type="button"
      onClick={toggleVat}
      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-colors cursor-pointer"
      style={{
        borderColor: exclVat ? "#1B2A4A" : "#E2E8F0",
        backgroundColor: exclVat ? "rgba(27,42,74,0.06)" : "transparent",
        color: exclVat ? "#1B2A4A" : "#64748B",
      }}
      title={exclVat ? "Toon prijzen incl. BTW" : "Toon prijzen excl. BTW"}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
      {exclVat ? "excl. BTW" : "incl. BTW"}
    </button>
  );
}
