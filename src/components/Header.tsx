import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ventoz"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/catalogus"
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors"
            >
              Assortiment
            </Link>
            <Link
              href="/catalogus"
              className="inline-flex items-center gap-2 bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Zoeken
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
