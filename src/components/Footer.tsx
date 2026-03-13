import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/types";

export default function Footer() {
  const catEntries = Object.entries(CATEGORIES);

  return (
    <footer>
      {/* Main footer */}
      <div className="bg-[#E8EDF2]">
        <div className="max-w-[1100px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Contact</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Ventoz Sails<br/>Dorpsstraat 111<br/>7948 BN Nijeveen (NL)</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>Igor <a href="tel:+31610193845" className="text-blue-700 hover:underline">+31 6 10193845</a></span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>Bart <a href="tel:+31645055465" className="text-blue-700 hover:underline">+31 6 45055465</a></span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href="mailto:info@ventoz.com" className="text-blue-700 hover:underline">info@ventoz.com</a>
              </li>
              <li className="text-slate-500 text-[11px]">KvK: 64140814</li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Categorieën</h3>
            <ul className="space-y-1 text-xs">
              {catEntries.map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/catalogus?categorie=${encodeURIComponent(slug)}`} className="text-slate-500 hover:text-navy transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">Informatie</h3>
            <ul className="space-y-1 text-xs">
              <li><Link href="/catalogus" className="text-slate-500 hover:text-navy transition-colors">Assortiment</Link></li>
              <li><a href="mailto:info@ventoz.com" className="text-slate-500 hover:text-navy transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-navy">
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/emblem.png" alt="Ventoz" width={24} height={24} className="w-6 h-6 opacity-60" />
            <span className="text-slate-400 text-xs">&copy; {new Date().getFullYear()} Ventoz Sails</span>
          </div>
          <span className="text-slate-500 text-[10px]">Premium One Design Sails</span>
        </div>
      </div>
    </footer>
  );
}
