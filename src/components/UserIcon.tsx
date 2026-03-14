"use client";

import { useAuth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";

export default function UserIcon() {
  const { user } = useAuth();

  return (
    <Link
      href="/account"
      className="flex items-center text-slate-500 hover:text-navy transition-colors"
      aria-label="Account"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {user ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        )}
      </svg>
    </Link>
  );
}
