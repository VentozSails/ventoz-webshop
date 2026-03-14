"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/catalogus?zoek=${encodeURIComponent(trimmed)}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-navy transition-colors cursor-pointer"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center pt-24">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-[480px] p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 text-sm text-navy outline-none py-2 placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 cursor-pointer"
              >
                ESC
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
