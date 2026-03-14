import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/products";
import { routing } from "@/i18n/routing";

const baseUrl = "https://ventoz.com";

function localizedUrl(path: string, locale: string): string {
  if (locale === "nl") return `${baseUrl}${path}`;
  return `${baseUrl}/${locale}${path}`;
}

function alternates(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((l) => [l, localizedUrl(path, l)])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProductSlugs();
  const categories = await getCategories();

  const pages: MetadataRoute.Sitemap = [];

  pages.push({
    url: `${baseUrl}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
    alternates: { languages: alternates("") },
  });

  pages.push({
    url: `${baseUrl}/catalogus`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
    alternates: { languages: alternates("/catalogus") },
  });

  for (const cat of categories) {
    const path = `/catalogus?categorie=${encodeURIComponent(cat)}`;
    pages.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: { languages: alternates(path) },
    });
  }

  for (const slug of slugs) {
    const path = `/product/${slug}`;
    pages.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: alternates(path) },
    });
  }

  return pages;
}
