"use client";

import { Link } from "@/i18n/navigation";

export default function ProductError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="max-w-[600px] mx-auto px-6 py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-navy mb-2">Something went wrong</h1>
      <p className="text-sm text-slate-500 mb-1">
        This product could not be loaded.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 font-mono mb-4">Error: {error.digest}</p>
      )}
      <Link
        href="/catalogus"
        className="inline-block mt-4 bg-gold text-navy font-bold text-sm px-7 py-3 rounded-lg hover:brightness-110 transition-all"
      >
        Back to products
      </Link>
    </div>
  );
}
