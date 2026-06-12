import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Zap, Camera, Battery, Cpu } from "lucide-react";
import { supabase } from "@/lib/db";
import { ProductsGrid } from "@/components/product/ProductsGrid";
import type { Locale, DBProduct } from "@/components/product/ProductCard";

type LocaleKey = "fr" | "en" | "zh";

const COPY: Record<LocaleKey, {
  meta: string;
  hero_title: string;
  hero_subtitle: string;
  shop_all: string;
  agent_order: string;
  products_heading: string;
  search: string;
  empty: string;
  count: (n: number) => string;
  back_phones: string;
  back_products: string;
  feat_1: string;
  feat_2: string;
  feat_3: string;
  feat_4: string;
}> = {
  fr: {
    meta: "Xiaomi Smartphones — MadaShop",
    hero_title: "Xiaomi Smartphones",
    hero_subtitle: "Innovation technologique à prix accessible — directement de Chine à Madagascar",
    shop_all: "Tous les Xiaomi",
    agent_order: "Commander depuis la Chine",
    products_heading: "Nos Xiaomi disponibles",
    search: "Rechercher un Xiaomi…",
    empty: "Aucun Xiaomi disponible pour le moment",
    count: (n) => `${n} Xiaomi disponible${n > 1 ? "s" : ""}`,
    back_phones: "Smartphones",
    back_products: "Tous les produits",
    feat_1: "Processeur Snapdragon",
    feat_2: "Caméra IA avancée",
    feat_3: "Grande batterie",
    feat_4: "Charge rapide",
  },
  en: {
    meta: "Xiaomi Smartphones — MadaShop",
    hero_title: "Xiaomi Smartphones",
    hero_subtitle: "Top-tier technology at accessible prices — direct from China to Madagascar",
    shop_all: "All Xiaomi Phones",
    agent_order: "Order from China",
    products_heading: "Available Xiaomi Phones",
    search: "Search Xiaomi phones…",
    empty: "No Xiaomi phones available yet",
    count: (n) => `${n} Xiaomi phone${n !== 1 ? "s" : ""} available`,
    back_phones: "Smartphones",
    back_products: "All Products",
    feat_1: "Snapdragon Processor",
    feat_2: "Advanced AI Camera",
    feat_3: "Large Battery",
    feat_4: "Fast Charging",
  },
  zh: {
    meta: "小米智能手机 — MadaShop",
    hero_title: "小米智能手机",
    hero_subtitle: "顶级科技，亲民价格——直接从中国到马达加斯加",
    shop_all: "全部小米手机",
    agent_order: "从中国下单",
    products_heading: "在售小米手机",
    search: "搜索小米手机…",
    empty: "暂无小米手机",
    count: (n) => `${n} 款小米手机在售`,
    back_phones: "智能手机",
    back_products: "所有产品",
    feat_1: "骁龙处理器",
    feat_2: "先进AI相机",
    feat_3: "大容量电池",
    feat_4: "快速充电",
  },
};

const SERIES = [
  { key: "all",         label: { fr: "Tous",       en: "All",        zh: "全部"     } },
  { key: "xiaomi 15",   label: { fr: "Xiaomi 15",  en: "Xiaomi 15",  zh: "小米15"   } },
  { key: "xiaomi 14",   label: { fr: "Xiaomi 14",  en: "Xiaomi 14",  zh: "小米14"   } },
  { key: "xiaomi 13",   label: { fr: "Xiaomi 13",  en: "Xiaomi 13",  zh: "小米13"   } },
  { key: "redmi note",  label: { fr: "Redmi Note", en: "Redmi Note", zh: "红米Note" } },
  { key: "redmi",       label: { fr: "Redmi",      en: "Redmi",      zh: "红米"     } },
  { key: "poco",        label: { fr: "POCO",       en: "POCO",       zh: "POCO"    } },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[(locale as LocaleKey)] ?? COPY.fr;
  return { title: copy.meta };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ series?: string }>;
}

export default async function XiaomiPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { series } = await searchParams;
  const loc = locale as Locale;
  const copy = COPY[(locale as LocaleKey)] ?? COPY.fr;

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

  const all = (productsData ?? []) as unknown as DBProduct[];

  // Filter products by Xiaomi brand keywords in any translation name
  const xiaomiKeywords = ["xiaomi", "redmi", "poco"];
  const xiaomiProducts = all.filter((p) =>
    p.translations.some((t) =>
      xiaomiKeywords.some((kw) => t.name.toLowerCase().includes(kw))
    )
  );

  // Further filter by series if provided
  const activeSeries = series && series !== "all" ? series.toLowerCase() : null;
  const displayed = activeSeries
    ? xiaomiProducts.filter((p) =>
        p.translations.some((t) => t.name.toLowerCase().includes(activeSeries))
      )
    : xiaomiProducts;

  const FEATURES = [
    { icon: Cpu,     label: copy.feat_1 },
    { icon: Camera,  label: copy.feat_2 },
    { icon: Battery, label: copy.feat_3 },
    { icon: Zap,     label: copy.feat_4 },
  ];

  return (
    <div className="flex flex-col">

      {/* ── Xiaomi Hero ──────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{ background: "linear-gradient(135deg, #B34400 0%, #FF6900 50%, #FF8C42 100%)" }}
      >
        {/* Decorative rings */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-[400px] w-[400px] rounded-full border border-white/10" />
          <div className="absolute -top-12 -right-12 h-[280px] w-[280px] rounded-full border border-white/15" />
          <div
            className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full blur-3xl opacity-20"
            style={{ background: "#fff" }}
          />
          <div
            className="absolute top-0 right-0 h-[200px] w-[200px] rounded-full blur-2xl opacity-15"
            style={{ background: "#fff" }}
          />
        </div>

        {/* Madagascar flag stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col pointer-events-none">
          <div className="flex-1" style={{ background: "#FC3D32" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "#007A5E" }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Xiaomi "Mi" logo badge */}
          <div className="mb-5 inline-flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-orange-900/20">
              <span
                className="text-2xl font-black tracking-tighter"
                style={{ color: "#FF6900", fontFamily: "system-ui, sans-serif" }}
              >
                Mi
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {copy.hero_title}
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-orange-100">
            {copy.hero_subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#xiaomi-products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-semibold bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{ color: "#FF6900" }}
            >
              {copy.shop_all}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href={`/${locale}/agent`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-8 font-semibold text-white hover:bg-white/15 transition-all backdrop-blur-sm"
            >
              {copy.agent_order}
            </Link>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 32L60 26.7C120 21.3 240 10.7 360 8C480 5.3 600 10.7 720 16C840 21.3 960 26.7 1080 26.7C1200 26.7 1320 21.3 1380 18.7L1440 16V32H0Z"
              fill="#FFFDF5"
            />
          </svg>
        </div>
      </section>

      {/* ── Feature Highlights ───────────────────────────── */}
      <section className="py-10 px-6" style={{ background: "#FFFDF5" }}>
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center bg-white border border-orange-100 shadow-sm"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: "#FFF4ED" }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#FF6900" }} />
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ─────────────────────────────────────── */}
      <section id="xiaomi-products" className="py-12 px-6 bg-white">
        <div className="mx-auto max-w-7xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6 flex-wrap">
            <Link href={`/${locale}/products`} className="hover:text-amber-600 transition-colors">
              {copy.back_products}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/${locale}/phones`} className="hover:text-amber-600 transition-colors">
              {copy.back_phones}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-700 font-medium">Xiaomi</span>
          </nav>

          {/* Series filter pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SERIES.map((s) => {
              const label = (s.label as Record<string, string>)[locale] ?? s.label.en;
              const isActive =
                (!series && s.key === "all") ||
                (series === s.key);
              const href =
                s.key === "all"
                  ? `/${locale}/phones/xiaomi`
                  : `/${locale}/phones/xiaomi?series=${encodeURIComponent(s.key)}`;
              return (
                <Link
                  key={s.key}
                  href={href}
                  className={`whitespace-nowrap shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg, #FF6900, #E05800)" }
                      : undefined
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Heading + count */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {copy.products_heading}
            </h2>
            <p className="text-gray-500 text-sm">{copy.count(displayed.length)}</p>
          </div>

          <ProductsGrid
            products={displayed}
            locale={loc}
            searchPlaceholder={copy.search}
            emptyLabel={copy.empty}
          />
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section
        className="relative py-16 px-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #B34400 0%, #FF6900 50%, #FF8C42 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-10 right-1/4 h-60 w-60 rounded-full blur-3xl opacity-20"
            style={{ background: "#fff" }}
          />
        </div>

        {/* Madagascar flag stripe */}
        <div className="absolute right-0 top-0 bottom-0 w-1.5 flex flex-col pointer-events-none">
          <div className="flex-1" style={{ background: "#FC3D32" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "#007A5E" }} />
        </div>

        <div className="relative mx-auto max-w-2xl text-center text-white">
          <p className="text-2xl sm:text-3xl font-bold mb-4">
            {locale === "fr"
              ? "Vous cherchez un modèle précis ?"
              : locale === "zh"
              ? "找不到您想要的型号？"
              : "Looking for a specific model?"}
          </p>
          <p className="mb-8 text-orange-100">
            {locale === "fr"
              ? "Commandez n'importe quel Xiaomi depuis la Chine — on s'occupe de tout."
              : locale === "zh"
              ? "从中国订购任意小米型号，我们一手包办。"
              : "Order any Xiaomi model from China — we handle everything."}
          </p>
          <Link
            href={`/${locale}/agent`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-semibold bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ color: "#FF6900" }}
          >
            {copy.agent_order}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
