import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ProductCard, type Locale, type DBProduct } from "@/components/product/ProductCard";
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

  const { data: productsData } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false });

  const allProducts = (productsData ?? []) as unknown as DBProduct[];
  const filtered = category
    ? allProducts.filter((p) => p.category?.slug === category)
    : allProducts;

  const { data: categoriesData } = await supabase
    .from("Category")
    .select("slug, translations:CategoryTranslation(locale, name)")
    .order("slug");
  const categories = (categoriesData ?? []) as { slug: string; translations: { locale: string; name: string }[] }[];

  const allLabel: Record<Locale, string> = { fr: "Tous", en: "All", zh: "全部" };
  const pageTitle: Record<Locale, string> = {
    fr: "Tous nos produits", en: "All Products", zh: "全部商品",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{pageTitle[loc]}</h1>
        <p className="text-gray-500 text-sm">{filtered.length} produits disponibles</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href={`/${locale}/products`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !category ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          {allLabel[loc]}
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
            {cat.translations.find((t) => t.locale === loc)?.name ?? cat.translations.find((t) => t.locale === "fr")?.name ?? cat.slug}
          </a>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} locale={loc} />
          ))}
        </div>
      )}
    </div>
  );
}
