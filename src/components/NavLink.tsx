"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const pathWithoutLocale = "/" + segments.slice(1).join("/");

  const isActive =
    href === "/"
      ? pathWithoutLocale === "/" || pathWithoutLocale === ""
      : pathWithoutLocale.startsWith(href);

  return (
    <Link
      href={href}
      className={`px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? "font-bold text-navy"
          : "font-medium text-slate-500 hover:text-navy"
      }`}
    >
      {children}
    </Link>
  );
}
