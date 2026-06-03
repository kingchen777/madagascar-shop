import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { type Locale, type DBProduct } from "@/components/product/ProductCard";
import { ProductCard } from "@/components/product/ProductCard";
import { supabase } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("featured") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function FeaturedPage({ params }: PageProps) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "featured" });
  const navT = await getTranslations({ locale, namespace: "nav" });

  const { data } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .eq("status", "ACTIVE")
    .eq("type", "AGENT")
    .order("createdAt", { ascending: false });

  const products = (data ?? []) as unknown as DBProduct[];

  return (
    <div className="flex flex-col">

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 px-6"
        style={{ background: "linear-gradient(135deg, #6B0000 0%, #A81C1C 50%, #7A0010 100%)" }}
      >
        {/* Flag stripe left */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col pointer-events-none">
          <div className="flex-1" style={{ background: "#FC3D32" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "#007A5E" }} />
        </div>

        {/* Stars */}
        <div className="pointer-events-none select-none absolute top-8 right-16 text-3xl opacity-25" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute top-16 right-32 text-lg opacity-20" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute bottom-8 left-20 text-2xl opacity-15" style={{ color: "#FFDE00" }}>★</div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-widest backdrop-blur-sm">
            <Star className="h-3 w-3" style={{ color: "#E8A400" }} />
            {t("badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-sm">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#FFCCC9" }}>
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* ── Products grid ──────────────────────────────────── */}
      <section className="py-12 px-6" style={{ background: "#FFFDF5" }}>
        <div className="mx-auto max-w-7xl">
          {products.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🛍️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">{t("empty_title")}</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">{t("empty_desc")}</p>
              <Link
                href={`/${locale}/agent`}
                className="inline-flex h-11 items-center gap-2 rounded-xl px-8 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #A81C1C, #6B0000)" }}
              >
                {navT("agent")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("grid_title")}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t("grid_count", { count: products.length })}</p>
                </div>
                <Link
                  href={`/${locale}/agent`}
                  className="hidden sm:flex items-center gap-1 text-sm font-medium transition-colors"
                  style={{ color: "#A81C1C" }}
                >
                  {t("custom_order")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} locale={loc} priority={i < 4} />
                ))}
              </div>

              {/* CTA */}
              <div
                className="mt-12 rounded-2xl p-8 text-center"
                style={{ background: "linear-gradient(135deg, #6B0000, #A81C1C)" }}
              >
                <p className="text-white font-semibold text-lg mb-2">{t("cta_title")}</p>
                <p className="mb-6 text-sm" style={{ color: "#FFCCC9" }}>{t("cta_desc")}</p>
                <Link
                  href={`/${locale}/agent`}
                  className="inline-flex h-11 items-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #E8A400, #C8900A)" }}
                >
                  {navT("agent")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
