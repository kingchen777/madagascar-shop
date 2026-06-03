import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, SlidersHorizontal, ChevronDown } from "lucide-react";
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
  searchParams: Promise<{ category?: string; sort?: string }>;
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

const SOURCE_LABEL: Record<string, string> = {
  TAOBAO: "淘宝",
  TMALL: "天猫",
  ALIBABA1688: "1688",
  PINDUODUO: "拼多多",
  JD: "京东",
};

const SOURCE_COLOR: Record<string, string> = {
  TAOBAO: "#FF5500",
  TMALL: "#C40606",
  ALIBABA1688: "#E8420F",
  PINDUODUO: "#E02E84",
  JD: "#CC0000",
};

export default async function FeaturedPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category, sort } = await searchParams;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "featured" });
  const navT = await getTranslations({ locale, namespace: "nav" });

  // Fetch AGENT products
  let query = supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .eq("status", "ACTIVE")
    .eq("type", "AGENT");

  if (sort === "price_asc") {
    query = query.order("priceMGA", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("priceMGA", { ascending: false });
  } else {
    query = query.order("createdAt", { ascending: false });
  }

  const { data } = await query;
  const allProducts = (data ?? []) as unknown as DBProduct[];
  const filtered = category
    ? allProducts.filter((p) => (p.category as { slug: string } | null)?.slug === category)
    : allProducts;

  // Unique categories
  const catMap = new Map<string, string>();
  for (const p of allProducts) {
    const cat = p.category as { slug: string; categoryTranslations: { locale: string; name: string }[] } | null;
    if (cat?.slug) {
      catMap.set(cat.slug, getLocaleName(cat.categoryTranslations, loc));
    }
  }
  const categories = Array.from(catMap.entries());

  const sortLabel =
    sort === "price_asc" ? (loc === "zh" ? "价格↑" : loc === "fr" ? "Prix↑" : "Price↑") :
    sort === "price_desc" ? (loc === "zh" ? "价格↓" : loc === "fr" ? "Prix↓" : "Price↓") :
    (loc === "zh" ? "综合排序" : loc === "fr" ? "Pertinence" : "Best Match");

  const labels = {
    zh: {
      search_placeholder: "搜索精选商品...",
      sort_default: "综合排序",
      sort_price_asc: "价格从低到高",
      sort_price_desc: "价格从高到低",
      sort_newest: "最新上架",
      all_categories: "全部分类",
      items_count: (n: number) => `共 ${n} 件商品`,
      source_label: "来源",
      order_btn: "代购下单",
      empty_title: "暂无精选商品",
      empty_desc: "商品正在上架中，您也可以直接提交代购需求",
      submit_link: "提交代购链接",
      filter_title: "筛选",
      cta_title: "没找到想要的？",
      cta_desc: "粘贴淘宝 / 1688 / 拼多多链接，我们帮您代购到马达加斯加",
      agent_btn: "提交代购需求",
      breadcrumb_home: "首页",
      breadcrumb_featured: "代购精选",
    },
    en: {
      search_placeholder: "Search curated products...",
      sort_default: "Best Match",
      sort_price_asc: "Price: Low to High",
      sort_price_desc: "Price: High to Low",
      sort_newest: "Newest",
      all_categories: "All Categories",
      items_count: (n: number) => `${n} products`,
      source_label: "Source",
      order_btn: "Order Now",
      empty_title: "No products yet",
      empty_desc: "Products are being added. You can submit a custom request.",
      submit_link: "Submit a link",
      filter_title: "Filter",
      cta_title: "Can't find what you need?",
      cta_desc: "Paste any Taobao / 1688 / Pinduoduo link — we ship to Madagascar.",
      agent_btn: "Submit Request",
      breadcrumb_home: "Home",
      breadcrumb_featured: "Curated Picks",
    },
    fr: {
      search_placeholder: "Rechercher des produits...",
      sort_default: "Pertinence",
      sort_price_asc: "Prix croissant",
      sort_price_desc: "Prix décroissant",
      sort_newest: "Plus récents",
      all_categories: "Toutes catégories",
      items_count: (n: number) => `${n} produits`,
      source_label: "Source",
      order_btn: "Commander",
      empty_title: "Aucun produit",
      empty_desc: "Des produits arrivent bientôt. Vous pouvez soumettre une demande.",
      submit_link: "Soumettre un lien",
      filter_title: "Filtrer",
      cta_title: "Vous ne trouvez pas ?",
      cta_desc: "Collez n'importe quel lien Taobao / 1688 / Pinduoduo — on livre à Madagascar.",
      agent_btn: "Soumettre une demande",
      breadcrumb_home: "Accueil",
      breadcrumb_featured: "Sélection",
    },
  };
  const L = labels[loc] ?? labels.zh;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f5" }}>

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-2 text-xs text-gray-400 flex items-center gap-1">
        <Link href={`/${locale}`} className="hover:text-orange-500">{L.breadcrumb_home}</Link>
        <span>›</span>
        <span className="text-gray-600">{L.breadcrumb_featured}</span>
        {category && (
          <>
            <span>›</span>
            <span className="text-gray-600">{catMap.get(category) ?? category}</span>
          </>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 flex gap-4">

        {/* ── Left Sidebar ──────────────────────────────────── */}
        <aside className="hidden lg:block w-44 shrink-0">

          {/* Categories */}
          <div className="bg-white border border-gray-200 rounded-sm mb-3">
            <div className="px-3 py-2 text-xs font-bold text-white flex items-center gap-1"
              style={{ background: "#E8420F" }}>
              <SlidersHorizontal className="h-3 w-3" />
              {L.all_categories}
            </div>
            <ul className="py-1">
              <li>
                <Link
                  href={`/${locale}/featured${sort ? `?sort=${sort}` : ""}`}
                  className={`block px-3 py-1.5 text-xs transition-colors ${!category ? "font-bold" : "text-gray-600 hover:text-orange-500"}`}
                  style={!category ? { color: "#E8420F" } : {}}
                >
                  {L.all_categories}
                </Link>
              </li>
              {categories.map(([slug, name]) => (
                <li key={slug}>
                  <Link
                    href={`/${locale}/featured?category=${slug}${sort ? `&sort=${sort}` : ""}`}
                    className={`block px-3 py-1.5 text-xs transition-colors truncate ${category === slug ? "font-bold" : "text-gray-600 hover:text-orange-500"}`}
                    style={category === slug ? { color: "#E8420F" } : {}}
                    title={name}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform filter */}
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="px-3 py-2 text-xs font-bold border-b border-gray-100" style={{ color: "#333" }}>
              {L.source_label}
            </div>
            <ul className="py-1">
              {Object.entries(SOURCE_LABEL).map(([key, label]) => (
                <li key={key} className="px-3 py-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ background: SOURCE_COLOR[key] ?? "#888" }}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ── Sort / Filter Bar (1688 style) ──────────────── */}
          <div className="bg-white border border-gray-200 rounded-sm mb-3 flex items-center px-3 py-0 text-sm overflow-x-auto">
            {[
              { label: L.sort_default, value: "" },
              { label: L.sort_newest, value: "newest" },
              { label: L.sort_price_asc, value: "price_asc" },
              { label: L.sort_price_desc, value: "price_desc" },
            ].map(({ label, value }) => {
              const active = (sort ?? "") === value;
              return (
                <Link
                  key={value}
                  href={`/${locale}/featured?${category ? `category=${category}&` : ""}${value ? `sort=${value}` : ""}`}
                  className="inline-flex items-center gap-0.5 px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors"
                  style={active
                    ? { borderColor: "#E8420F", color: "#E8420F", fontWeight: 600 }
                    : { borderColor: "transparent", color: "#666" }}
                >
                  {label}
                  {(value === "price_asc" || value === "price_desc") && (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Link>
              );
            })}

            <div className="ml-auto pl-4 text-xs text-gray-400 whitespace-nowrap py-3">
              {L.items_count(filtered.length)}
            </div>
          </div>

          {/* ── Mobile category chips ───────────────────────── */}
          {categories.length > 0 && (
            <div className="lg:hidden bg-white border border-gray-200 rounded-sm mb-3 px-3 py-2 flex flex-wrap gap-2">
              <Link
                href={`/${locale}/featured${sort ? `?sort=${sort}` : ""}`}
                className="px-2.5 py-1 text-xs rounded-sm border"
                style={!category
                  ? { background: "#E8420F", color: "#fff", borderColor: "#E8420F" }
                  : { color: "#666", borderColor: "#ddd" }}
              >
                {L.all_categories}
              </Link>
              {categories.map(([slug, name]) => (
                <Link
                  key={slug}
                  href={`/${locale}/featured?category=${slug}${sort ? `&sort=${sort}` : ""}`}
                  className="px-2.5 py-1 text-xs rounded-sm border truncate max-w-[100px]"
                  style={category === slug
                    ? { background: "#E8420F", color: "#fff", borderColor: "#E8420F" }
                    : { color: "#666", borderColor: "#ddd" }}
                >
                  {name}
                </Link>
              ))}
            </div>
          )}

          {/* ── Product Grid ────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-sm py-20 text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <h2 className="text-base font-bold text-gray-700 mb-2">{L.empty_title}</h2>
              <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">{L.empty_desc}</p>
              <Link
                href={`/${locale}/agent`}
                className="inline-flex h-9 items-center gap-2 rounded-sm px-6 text-sm font-semibold text-white"
                style={{ background: "#E8420F" }}
              >
                {L.submit_link}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-gray-200">
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
                const srcKey = prod.source && prod.source !== "NONE" ? prod.source : null;

                return (
                  <Link
                    key={product.id}
                    href={`/${locale}/products/${product.slug}`}
                    className="group bg-white flex flex-col hover:shadow-md transition-shadow relative"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
                          📦
                        </div>
                      )}
                      {/* Source badge */}
                      {srcKey && (
                        <span
                          className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 text-white leading-none"
                          style={{ background: SOURCE_COLOR[srcKey] ?? "#888" }}
                        >
                          {SOURCE_LABEL[srcKey] ?? srcKey}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2 flex-1 flex flex-col">
                      {/* Title */}
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed mb-2 flex-1">
                        {name}
                      </p>

                      {/* Price row */}
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-base font-bold leading-none" style={{ color: "#E8420F" }}>
                            {priceMGA > 0 ? `${priceMGA.toLocaleString()}` : "—"}
                          </span>
                          {priceMGA > 0 && (
                            <span className="text-xs font-normal" style={{ color: "#E8420F" }}>Ar</span>
                          )}
                        </div>
                        {priceCNY && priceCNY > 0 && (
                          <div className="text-[10px] text-gray-400 mt-0.5">¥{priceCNY}</div>
                        )}
                      </div>

                      {/* Order button (1688 style) */}
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                          {prod.weightKg ? `${prod.weightKg}kg` : ""}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-3 py-1 text-white"
                          style={{ background: "#E8420F" }}
                        >
                          {L.order_btn}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Bottom CTA ──────────────────────────────────── */}
          {filtered.length > 0 && (
            <div className="mt-6 bg-white border border-gray-200 rounded-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-800 text-sm">{L.cta_title}</p>
                <p className="text-xs text-gray-500 mt-1">{L.cta_desc}</p>
              </div>
              <Link
                href={`/${locale}/agent`}
                className="inline-flex shrink-0 h-9 items-center gap-2 px-5 text-sm font-semibold text-white whitespace-nowrap"
                style={{ background: "#E8420F" }}
              >
                {L.agent_btn}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
