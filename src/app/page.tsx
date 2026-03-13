import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getCategories } from "@/lib/products";
import { categorieLabel } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sky-700 via-sky-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M54.627%200l.83.828-1.415%201.415L51.8%200h2.827zM5.373%200l-.83.828L5.96%202.243%208.2%200H5.374zM48.97%200l3.657%203.657-1.414%201.414L46.143%200h2.828zM11.03%200L7.372%203.657%208.787%205.07%2013.857%200H11.03zm32.284%200L49.8%206.485%2048.384%207.9l-7.9-7.9h2.83zM16.686%200L10.2%206.485%2011.616%207.9l7.9-7.9h-2.83zm20.97%200l9.315%209.314-1.414%201.414L34.828%200h2.83zM22.344%200L13.03%209.314l1.414%201.414L25.172%200h-2.83zM32%200l12.142%2012.142-1.414%201.414L30%20.828%2017.272%2013.556l-1.414-1.414L28%200h4z%22%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <Image
              src="/logo.png"
              alt="Ventoz Sails"
              width={200}
              height={66}
              className="mb-8 brightness-0 invert"
              priority
            />
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Zeilen gebouwd voor
              <span className="block text-sky-200">snelheid & plezier</span>
            </h1>
            <p className="mt-6 text-lg text-sky-100 leading-relaxed max-w-xl">
              Van Optimist tot Laser, van Topaz tot Hobie Cat — Ventoz levert
              hoogwaardige zeilen voor wedstrijd en recreatie.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogus"
                className="inline-flex items-center gap-2 bg-white text-sky-700 font-bold px-6 py-3 rounded-lg hover:bg-sky-50 transition-colors shadow-lg"
              >
                Bekijk assortiment
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Uitgelichte producten
            </h2>
            <Link
              href="/catalogus"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
            >
              Bekijk alles &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Categorieën
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/catalogus?categorie=${encodeURIComponent(cat)}`}
                  className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all text-center shadow-sm"
                >
                  {categorieLabel(cat)}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* USPs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "M5 13l4 4L19 7",
              title: "Topkwaliteit",
              text: "Zeilen van duurzaam materiaal, gebouwd voor jarenlang gebruik op het water.",
            },
            {
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
              title: "Snel geleverd",
              text: "De meeste zeilen direct uit voorraad leverbaar. Snel op het water.",
            },
            {
              icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
              title: "Persoonlijk advies",
              text: "Hulp nodig bij het kiezen? Ons team helpt je graag met deskundig advies.",
            },
          ].map((usp) => (
            <div
              key={usp.title}
              className="text-center px-4"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={usp.icon}
                  />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900">{usp.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {usp.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
