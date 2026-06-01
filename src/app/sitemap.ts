import type { MetadataRoute } from "next";
import { supabase } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://madashop.mg";
const LOCALES = ["fr", "en", "zh"] as const;
const STATIC_PATHS = ["", "/products", "/agent", "/cart"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static locale pages
  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1.0 : 0.8,
    }))
  );

  // Dynamic product pages
  const { data: products } = await supabase
    .from("Product")
    .select("slug, updatedAt")
    .eq("status", "ACTIVE");

  const productEntries: MetadataRoute.Sitemap = (products ?? []).flatMap(
    (product) =>
      LOCALES.map((locale) => ({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      }))
  );

  return [...staticEntries, ...productEntries];
}
