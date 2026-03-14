import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/products";
import { categorieLabel } from "@/lib/types";
import LanguageSwitcher from "./LanguageSwitcher";
import CartIcon from "./CartIcon";
import UserIcon from "./UserIcon";
import SearchButton from "./SearchButton";
import VatToggle from "./VatToggle";
import NavLink from "./NavLink";
import { Link } from "@/i18n/navigation";

export default async function Header({ locale }: { locale: string }) {
  const categories = await getCategories();
  const t = await getTranslations("nav");
  const tCat = await getTranslations("categories");

  const catLabel = (slug: string | null) => categorieLabel(slug, (k) => tCat.has(k) ? tCat(k) : "");

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
          <NavLink href="/">{t("home")}</NavLink>
          <NavLink href="/catalogus">{t("products")}</NavLink>
          <NavLink href="/about">{t("about")}</NavLink>
          <NavLink href="/reviews">{t("reviews")}</NavLink>
          <NavLink href="/about#contact">{t("contact")}</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <VatToggle />
          <LanguageSwitcher />
          <SearchButton />
          <CartIcon />
          <UserIcon />
        </div>
      </div>

      <div className="border-t border-border-default bg-white overflow-x-auto">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-1 py-1.5">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/catalogus?categorie=${encodeURIComponent(cat)}`}
              className="shrink-0 px-3 py-1 text-[11px] font-semibold text-navy uppercase tracking-wider hover:bg-navy/5 rounded transition-colors"
            >
              {catLabel(cat)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
