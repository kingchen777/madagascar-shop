import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { type Locale, type DBProduct } from "@/components/product/ProductCard";
import { ProductsGrid } from "@/components/product/ProductsGrid";
import { supabase } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("products") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "product" });

  const { data: productsData } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .eq("status", "ACTIVE")
    .eq("type", "SELF")
    .order("createdAt", { ascending: false });

  const allProducts = (productsData ?? []) as unknown as DBProduct[];
  const filtered = category
    ? allProducts.filter((p) => p.category?.slug === category)
    : allProducts;

  const { data: categoriesData } = await supabase
    .from("Category")
    .select("slug, sort, translations:CategoryTranslation(locale, name)")
    .order("sort")
    .order("slug");
  const categories = (categoriesData ?? []) as { slug: string; sort: number; translations: { locale: string; name: string }[] }[];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t("all_title")}</h1>
        <p className="text-gray-500 text-sm">{t("count_available", { count: filtered.length })}</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href={`/${locale}/products`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !category ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          {t("all_filter")}
        </a>
        {categories.map((cat) => (
          <a
            key={cat.slug}
            href={`/${locale}/products?category=${cat.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat.slug
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            {cat.translations.find((tr) => tr.locale === loc)?.name ?? cat.translations.find((tr) => tr.locale === "fr")?.name ?? cat.slug}
          </a>
        ))}
      </div>

      <ProductsGrid
        products={filtered}
        locale={loc}
        searchPlaceholder={t("search_placeholder")}
        emptyLabel={t("no_products")}
      />
    </div>
  );
}
