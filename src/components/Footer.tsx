import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Ventoz Sails</h3>
            <p className="text-sm leading-relaxed">
              Hoogwaardige zeilen voor wedstrijd en recreatie. Van Optimist tot
              Laser, van Topaz tot Hobie Cat.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Navigatie
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogus"
                  className="hover:text-white transition-colors"
                >
                  Assortiment
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:info@ventoz.com"
                  className="hover:text-white transition-colors"
                >
                  info@ventoz.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Ventoz Sails. Alle rechten
          voorbehouden.
        </div>
      </div>
    </footer>
  );
}
