import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/products";
import { categorieLabel } from "@/lib/types";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Header() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-dark.png"
            alt="Ventoz Sails"
            width={120}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-2 py-1.5 text-sm font-medium text-slate-500 hover:text-navy transition-colors"
          >
            Home
          </Link>
          <Link
            href="/catalogus"
            className="px-2 py-1.5 text-sm font-bold text-navy transition-colors"
          >
            Assortiment
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/catalogus"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-navy transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Category bar */}
      <div className="border-t border-border-default bg-white overflow-x-auto">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-1 py-1.5">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/catalogus?categorie=${encodeURIComponent(cat)}`}
              className="shrink-0 px-3 py-1 text-[11px] font-semibold text-navy uppercase tracking-wider hover:bg-navy/5 rounded transition-colors"
            >
              {categorieLabel(cat)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
