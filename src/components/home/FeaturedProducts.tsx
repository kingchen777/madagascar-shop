import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { supabase } from "@/lib/db";
import { ProductCard, type DBProduct, type Locale } from "@/components/product/ProductCard";

interface Props {
  locale: Locale;
}

export async function FeaturedProducts({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "home" });

  const { data } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false })
    .limit(4);

  const products = (data ?? []) as unknown as DBProduct[];
  if (products.length === 0) return null;

  return (
    <section className="py-14 px-6 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("featured_title")}</h2>
          <Link
            href={`/${locale}/products`}
            className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            {t("featured_link")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} locale={locale} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}
