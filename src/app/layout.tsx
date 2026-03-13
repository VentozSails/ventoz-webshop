import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Ventoz Sails — Zeilen voor wedstrijd en recreatie",
    template: "%s | Ventoz Sails",
  },
  description:
    "Ventoz Sails: hoogwaardige zeilen voor Optimist, Laser/ILCA, Topaz, Hobie Cat en meer. Ontdek ons assortiment wedstrijd- en recreatiezeilen.",
  metadataBase: new URL("https://ventoz.com"),
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Ventoz Sails",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={inter.className}>
      <body className="bg-white text-slate-900 antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
