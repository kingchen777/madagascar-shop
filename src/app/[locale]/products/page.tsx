import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

interface CategoryRow {
  id: string;
  slug: string;
  sort: number;
  parentId: string | null;
  translations: { locale: string; name: string }[];
}

function getCatName(cat: CategoryRow, locale: string) {
  return (
    cat.translations.find((t) => t.locale === locale)?.name ??
    cat.translations.find((t) => t.locale === "fr")?.name ??
    cat.slug
  );
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "product" });

  // Fetch all categories with parentId
  const { data: categoriesData } = await supabase
    .from("Category")
    .select("id, slug, sort, parentId, translations:CategoryTranslation(locale, name)")
    .order("sort")
    .order("slug");

  const allCats = (categoriesData ?? []) as CategoryRow[];
  const topLevelCats = allCats.filter((c) => !c.parentId);

  // Determine selected category / parent / subcategories
  const selectedCat = category ? allCats.find((c) => c.slug === category) : null;
  const isSubcategory = selectedCat ? !!selectedCat.parentId : false;
  const parentCat = isSubcategory
    ? allCats.find((c) => c.id === selectedCat!.parentId) ?? null
    : null;
  const activeCat = isSubcategory ? parentCat : selectedCat;
  const subcategories = activeCat
    ? allCats.filter((c) => c.parentId === activeCat.id)
    : [];

  // Collect slugs to filter: if subcategory selected → that slug only
  // if parent selected → all its children slugs too
  const filterSlugs: string[] = [];
  if (category) {
    filterSlugs.push(category);
    if (!isSubcategory && subcategories.length > 0) {
      // parent selected — include all children
      subcategories.forEach((s) => filterSlugs.push(s.slug));
    }
  }

  // Fetch SELF products
  const { data: productsData } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(id, slug, parentId, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .eq("status", "ACTIVE")
    .eq("type", "SELF")
    .order("createdAt", { ascending: false });

  const allProducts = (productsData ?? []) as unknown as DBProduct[];

  const filtered = filterSlugs.length > 0
    ? allProducts.filter((p) => filterSlugs.includes((p.category as { slug: string } | null)?.slug ?? ""))
    : allProducts;

  const pageTitle = isSubcategory
    ? getCatName(selectedCat!, loc)
    : activeCat
    ? getCatName(activeCat, loc)
    : t("all_title");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-4 flex-wrap">
        <Link href={`/${locale}/products`} className="hover:text-amber-600 transition-colors">
          {t("all_title")}
        </Link>
        {parentCat && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/${locale}/products?category=${parentCat.slug}`}
              className="hover:text-amber-600 transition-colors"
            >
              {getCatName(parentCat, loc)}
            </Link>
          </>
        )}
        {selectedCat && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-700 font-medium">{getCatName(selectedCat, loc)}</span>
          </>
        )}
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{pageTitle}</h1>
        <p className="text-gray-500 text-sm">{t("count_available", { count: filtered.length })}</p>
      </div>

      {/* Top-level category filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href={`/${locale}/products`}
          className={`whitespace-nowrap shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !category ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          {t("all_filter")}
        </Link>
        {topLevelCats.map((cat) => {
          const isActive = category === cat.slug || parentCat?.slug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/${locale}/products?category=${cat.slug}`}
              className={`whitespace-nowrap shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              {getCatName(cat, loc)}
            </Link>
          );
        })}
      </div>

      {/* Subcategory navigation (only shown when a category with children is active) */}
      {subcategories.length > 0 && (
        <div className="flex gap-2 mb-6 pl-2 border-l-4 border-amber-400 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={`/${locale}/products?category=${activeCat!.slug}`}
            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              !isSubcategory
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "text-gray-500 hover:text-amber-700 hover:bg-amber-50"
            }`}
          >
            {loc === "zh" ? "全部" : loc === "fr" ? "Tout" : "All"}
          </Link>
          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/${locale}/products?category=${sub.slug}`}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                category === sub.slug
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "text-gray-500 hover:text-amber-700 hover:bg-amber-50"
              }`}
            >
              {getCatName(sub, loc)}
            </Link>
          ))}
        </div>
      )}

      <ProductsGrid
        products={filtered}
        locale={loc}
        searchPlaceholder={t("search_placeholder")}
        emptyLabel={t("no_products")}
      />
    </div>
  );
}
