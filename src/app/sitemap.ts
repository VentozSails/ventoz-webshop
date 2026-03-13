import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ventoz.com";

  const slugs = await getAllProductSlugs();
  const categories = await getCategories();

  const productUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/catalogus?categorie=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogus`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
