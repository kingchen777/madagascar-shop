import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { type Locale, type DBProduct } from "@/components/product/ProductCard";
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
  searchParams: Promise<{ category?: string }>;
}

function getLocaleName(
  translations: { locale: string; name: string }[],
  locale: string
) {
  return (
    translations.find((t) => t.locale === locale)?.name ||
    translations.find((t) => t.locale === "zh")?.name ||
    translations.find((t) => t.locale === "fr")?.name ||
    ""
  );
}

export default async function FeaturedPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "featured" });
  const navT = await getTranslations({ locale, namespace: "nav" });

  // Fetch AGENT type products
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

  const allProducts = (data ?? []) as unknown as DBProduct[];
  const filtered = category
    ? allProducts.filter((p) => (p.category as { slug: string } | null)?.slug === category)
    : allProducts;

  // Collect unique categories
  const catMap = new Map<string, string>();
  for (const p of allProducts) {
    const cat = p.category as { slug: string; categoryTranslations: { locale: string; name: string }[] } | null;
    if (cat?.slug) {
      catMap.set(cat.slug, getLocaleName(cat.categoryTranslations, loc));
    }
  }
  const categories = Array.from(catMap.entries());

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top banner ─────────────────────────────────────── */}
      <div
        className="py-3 px-4 text-center text-sm font-medium text-white"
        style={{ background: "linear-gradient(90deg, #A81C1C, #6B0000, #A81C1C)" }}
      >
        <span style={{ color: "#E8A400" }}>★</span>
        {" "}{t("banner")}{" "}
        <span style={{ color: "#E8A400" }}>★</span>
      </div>

      {/* ── Page header ────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #A81C1C, #6B0000)" }}
            >
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#A81C1C" }}>
                {t("title")}
              </h1>
              <p className="text-xs text-gray-500">{t("subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">

        {/* ── Category filter bar (1688 style) ───────────────── */}
        {categories.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 mr-1">{t("filter_label")}</span>
            <Link
              href={`/${locale}/featured`}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                !category
                  ? "text-white border-transparent"
                  : "text-gray-600 border-gray-200 hover:border-red-300"
              }`}
              style={!category ? { background: "#A81C1C", borderColor: "#A81C1C" } : {}}
            >
              {t("all")}
            </Link>
            {categories.map(([slug, name]) => (
              <Link
                key={slug}
                href={`/${locale}/featured?category=${slug}`}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  category === slug
                    ? "text-white border-transparent"
                    : "text-gray-600 border-gray-200 hover:border-red-300"
                }`}
                style={category === slug ? { background: "#A81C1C", borderColor: "#A81C1C" } : {}}
              >
                {name}
              </Link>
            ))}
          </div>
        )}

        {/* ── Result count bar ───────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm text-gray-500">
            {filtered.length > 0
              ? t("grid_count", { count: filtered.length })
              : ""}
          </span>
          <Link
            href={`/${locale}/agent`}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "#A81C1C" }}
          >
            {t("custom_order")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* ── Product grid (1688 style) ───────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-20 text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">{t("empty_title")}</h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">{t("empty_desc")}</p>
            <Link
              href={`/${locale}/agent`}
              className="inline-flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-semibold text-white"
              style={{ background: "#A81C1C" }}
            >
              {navT("agent")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((product) => {
              const prod = product as DBProduct & {
                images: { url: string; sort: number }[];
                translations: { locale: string; name: string }[];
                category: { slug: string; categoryTranslations: { locale: string; name: string }[] } | null;
              };
              const name = getLocaleName(prod.translations, loc) || "—";
              const imgUrl = prod.images?.sort((a, b) => a.sort - b.sort)[0]?.url;
              const priceMGA = Number(prod.priceMGA);
              const priceCNY = prod.basePriceCNY ? Number(prod.basePriceCNY) : null;

              return (
                <Link
                  key={product.id}
                  href={`/${locale}/products/${product.slug}`}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-red-200 transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">
                        📦
                      </div>
                    )}
                    {/* Source badge */}
                    {prod.source && prod.source !== "NONE" && (
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ background: "rgba(168,28,28,0.85)" }}>
                        {prod.source === "ALIBABA1688" ? "1688" : prod.source}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed mb-2 h-8">
                      {name}
                    </p>
                    <div className="flex items-end justify-between gap-1">
                      <div>
                        <div className="text-sm font-bold" style={{ color: "#A81C1C" }}>
                          {priceMGA > 0
                            ? `${priceMGA.toLocaleString()} Ar`
                            : "—"}
                        </div>
                        {priceCNY && priceCNY > 0 && (
                          <div className="text-[10px] text-gray-400">¥{priceCNY}</div>
                        )}
                      </div>
                      <div
                        className="text-[10px] font-semibold px-2 py-1 rounded text-white shrink-0"
                        style={{ background: "#E8A400" }}
                      >
                        {t("order_btn")}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Bottom CTA ─────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div
            className="mt-8 rounded-xl p-6 text-center"
            style={{ background: "linear-gradient(135deg, #6B0000, #A81C1C)" }}
          >
            <p className="text-white font-semibold text-base mb-1">{t("cta_title")}</p>
            <p className="text-sm mb-4" style={{ color: "#FFCCC9" }}>{t("cta_desc")}</p>
            <Link
              href={`/${locale}/agent`}
              className="inline-flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #E8A400, #C8900A)" }}
            >
              {navT("agent")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
