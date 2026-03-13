import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Ventoz Sails — Premium One Design Sails",
    template: "%s | Ventoz Sails",
  },
  description:
    "Ventoz Sails: hoogwaardige one design zeilen voor Optimist, Laser/ILCA, Topaz, Hobie Cat en meer. Europees zeilmerk uit Nederland.",
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
    <html lang="nl" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="font-[family-name:var(--font-sans)] bg-surface text-slate-900 antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
