import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getCategories } from "@/lib/products";
import { categorieLabel, displayNaam, displayAfbeelding, prijsFormatted, productSlug } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero with background image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#37474F]/65 via-[#37474F]/45 to-[#37474F]/25" />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-16 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* About card */}
            <div className="bg-white/[0.12] backdrop-blur-sm border border-white/[0.15] rounded-2xl p-8">
              <Image
                src="/logo.png"
                alt="Ventoz Sails"
                width={180}
                height={44}
                className="h-11 w-auto brightness-0 invert mb-5"
                priority
              />
              <p className="text-sm text-white leading-7">
                Ventoz Sails is een modern Europees zeilmerk, uit Nederland. 
                Wij brengen kwalitatief hoogwaardige &quot;one design&quot; zeilen 
                tegen een eerlijke prijs op de gehele Europese markt.
              </p>
              <Link
                href="/catalogus"
                className="mt-6 inline-flex items-center gap-2 bg-gold text-navy font-bold text-sm px-7 py-4 rounded-lg hover:brightness-110 transition-all shadow-[0_6px_20px_rgba(200,168,92,0.5)]"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                Bekijk assortiment
              </Link>
            </div>

            {/* Featured product slider (first product) */}
            {featured.length > 0 && (
              <div className="hidden lg:block">
                <Link href={`/product/${productSlug(featured[0])}`} className="block bg-white/[0.82] rounded-2xl p-6 shadow-[0_10px_32px_rgba(0,0,0,0.3),0_0_40px_rgba(200,168,92,0.15)]">
                  {displayAfbeelding(featured[0]) && (
                    <div className="relative h-52 mb-4">
                      <Image
                        src={displayAfbeelding(featured[0])!}
                        alt={displayNaam(featured[0])}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  {featured[0].categorie && (
                    <span className="inline-block bg-navy/85 text-white text-[10px] font-semibold px-2 py-0.5 rounded mb-2">
                      {categorieLabel(featured[0].categorie)}
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-slate-800">{displayNaam(featured[0])}</h3>
                  <p className="text-lg font-extrabold text-navy mt-1">{prijsFormatted(featured[0])}</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* USP bar */}
      <section className="bg-white border-t border-border-default">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Premium kwaliteit", sub: "Duurzame materialen, hoge afwerking" },
            { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Direct leverbaar", sub: "De meeste zeilen uit voorraad" },
            { icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064", title: "Europese verzending", sub: "Veilig ingepakt, snel bezorgd" },
          ].map((usp) => (
            <div key={usp.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={usp.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-navy">{usp.title}</h3>
                <p className="text-[11px] text-slate-500">{usp.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy">
              Uitgelichte producten
            </h2>
            <Link href="/catalogus" className="text-xs font-semibold text-slate-500 hover:text-navy transition-colors uppercase tracking-wider">
              Alles bekijken &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories grid */}
      {categories.length > 0 && (
        <section className="bg-white border-t border-border-default py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy mb-6">
              Categorieën
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/catalogus?categorie=${encodeURIComponent(cat)}`}
                  className="bg-surface border border-border-default rounded-lg px-4 py-3 text-xs font-semibold text-navy hover:border-navy hover:bg-navy/[0.06] transition-all text-center uppercase tracking-wider"
                >
                  {categorieLabel(cat)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
