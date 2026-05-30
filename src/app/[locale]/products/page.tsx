import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, type MockLocale } from "@/lib/mock-data";

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
  const loc = locale as MockLocale;

  const activeProducts = MOCK_PRODUCTS.filter((p) => p.status === "ACTIVE");
  const filtered = category
    ? activeProducts.filter((p) => p.category.slug === category)
    : activeProducts;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          <ProductsTitle locale={loc} />
        </h1>
        <p className="text-gray-500 text-sm">{filtered.length} produits disponibles</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <CategoryFilter locale={loc} activeCategory={category} />
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

function ProductsTitle({ locale }: { locale: MockLocale }) {
  const labels: Record<MockLocale, string> = {
    fr: "Tous nos produits",
    en: "All Products",
    zh: "全部商品",
  };
  return <>{labels[locale]}</>;
}

function CategoryFilter({
  locale,
  activeCategory,
}: {
  locale: MockLocale;
  activeCategory?: string;
}) {
  const allLabel: Record<MockLocale, string> = {
    fr: "Tous",
    en: "All",
    zh: "全部",
  };

  return (
    <>
      <a
        href={`/${locale}/products`}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          !activeCategory
            ? "bg-amber-500 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
        }`}
      >
        {allLabel[locale]}
      </a>
      {MOCK_CATEGORIES.map((cat) => (
        <a
          key={cat.slug}
          href={`/${locale}/products?category=${cat.slug}`}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === cat.slug
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          {cat.name[locale]}
        </a>
      ))}
    </>
  );
}
