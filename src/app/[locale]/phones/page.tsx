import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Smartphone, ShieldCheck, Tag, Zap, ChevronRight } from "lucide-react";
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
  brands_heading: string;
  products_heading: string;
  trust_1: string;
  trust_2: string;
  trust_3: string;
  search: string;
  empty: string;
  count: (n: number) => string;
  all_products: string;
  view: string;
}> = {
  fr: {
    meta: "Smartphones — MadaShop",
    hero_title: "Smartphones",
    hero_subtitle: "Les derniers smartphones de Chine, livrés directement à Madagascar",
    shop_all: "Tous les téléphones",
    agent_order: "Commander depuis la Chine",
    brands_heading: "Nos marques phares",
    products_heading: "Tous les smartphones",
    trust_1: "Produits authentiques",
    trust_2: "Garantie constructeur",
    trust_3: "Prix imbattables",
    search: "Rechercher un téléphone…",
    empty: "Aucun téléphone pour le moment",
    count: (n) => `${n} smartphone${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""}`,
    all_products: "Tous les produits",
    view: "Voir →",
  },
  en: {
    meta: "Smartphones — MadaShop",
    hero_title: "Smartphones",
    hero_subtitle: "Latest smartphones from China, delivered directly to Madagascar",
    shop_all: "Browse All Phones",
    agent_order: "Order from China",
    brands_heading: "Shop by Brand",
    products_heading: "All Smartphones",
    trust_1: "Authentic Products",
    trust_2: "Manufacturer Warranty",
    trust_3: "Unbeatable Prices",
    search: "Search phones…",
    empty: "No phones available yet",
    count: (n) => `${n} phone${n !== 1 ? "s" : ""} available`,
    all_products: "All Products",
    view: "View →",
  },
  zh: {
    meta: "智能手机 — MadaShop",
    hero_title: "智能手机",
    hero_subtitle: "来自中国的最新智能手机，直接送达马达加斯加",
    shop_all: "浏览全部手机",
    agent_order: "从中国下单",
    brands_heading: "按品牌选购",
    products_heading: "全部智能手机",
    trust_1: "正品保证",
    trust_2: "厂商保修",
    trust_3: "无与伦比的价格",
    search: "搜索手机…",
    empty: "暂无手机",
    count: (n) => `${n} 款手机在售`,
    all_products: "所有产品",
    view: "查看 →",
  },
};

const BRANDS = [
  {
    slug: "xiaomi",
    name: "Xiaomi",
    tagline: { fr: "Performance & Innovation", en: "Performance & Innovation", zh: "性能与创新" },
    color: "#FF6900",
    bg: "#FFF4ED",
    border: "#FFD6B3",
    href: "phones/xiaomi",
  },
  {
    slug: "samsung",
    name: "Samsung",
    tagline: { fr: "Galaxy Series", en: "Galaxy Series", zh: "Galaxy系列" },
    color: "#1428A0",
    bg: "#EEF0FF",
    border: "#C0C8F0",
    href: null,
  },
  {
    slug: "iphone",
    name: "Apple iPhone",
    tagline: { fr: "Think Different", en: "Think Different", zh: "与众不同" },
    color: "#1D1D1F",
    bg: "#F5F5F7",
    border: "#DDDDE3",
    href: null,
  },
  {
    slug: "tecno",
    name: "Tecno",
    tagline: { fr: "Stop At Nothing", en: "Stop At Nothing", zh: "无所不能" },
    color: "#0066CC",
    bg: "#EEF5FF",
    border: "#B3D4FF",
    href: null,
  },
  {
    slug: "infinix",
    name: "Infinix",
    tagline: { fr: "Born to Stand Out", en: "Born to Stand Out", zh: "生来与众不同" },
    color: "#D4145A",
    bg: "#FFF0F5",
    border: "#FFBDD4",
    href: null,
  },
  {
    slug: "huawei",
    name: "Huawei",
    tagline: { fr: "Build a Smarter World", en: "Build a Smarter World", zh: "构建智慧世界" },
    color: "#CF0A2C",
    bg: "#FFF5F5",
    border: "#FFB3B3",
    href: null,
  },
];

const PHONE_SLUGS = ["smartphone", "phone", "mobile", "telephone", "xiaomi", "samsung", "iphone", "tecno", "infinix", "huawei", "oppo", "realme", "vivo"];

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
}

export default async function PhonesPage({ params }: PageProps) {
  const { locale } = await params;
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

  const phones = all.filter((p) => {
    const catSlug = ((p.category as { slug?: string } | null)?.slug ?? "").toLowerCase();
    return PHONE_SLUGS.some((s) => catSlug.includes(s));
  });

  const products = phones.length > 0 ? phones : all;

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0F172A 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          <div className="absolute -top-10 right-8 text-[140px] opacity-[0.04]">📱</div>
          <div className="absolute bottom-6 right-1/3 text-[90px] opacity-[0.03]">📱</div>
          <div className="absolute top-1/2 left-6 text-[70px] opacity-[0.03]">📱</div>
          <div
            className="absolute top-0 right-1/4 h-72 w-72 rounded-full blur-3xl opacity-10"
            style={{ background: "#E8A400" }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full blur-2xl opacity-10"
            style={{ background: "#A81C1C" }}
          />
        </div>

        {/* Madagascar flag stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col pointer-events-none">
          <div className="flex-1" style={{ background: "#FC3D32" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "#007A5E" }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-widest backdrop-blur-sm">
            <Smartphone className="h-3.5 w-3.5" style={{ color: "#E8A400" }} />
            Smartphones
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
            {copy.hero_title}
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-slate-300">
            {copy.hero_subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#phones-grid"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #E8A400, #C8900A)",
                boxShadow: "0 4px 20px rgba(232,164,0,0.4)",
              }}
            >
              {copy.shop_all}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href={`/${locale}/agent`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-8 font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm"
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

      {/* ── Trust badges ─────────────────────────────────── */}
      <section className="py-8 px-6 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {([
              { icon: ShieldCheck, label: copy.trust_1, color: "#007A5E" },
              { icon: Zap, label: copy.trust_2, color: "#E8A400" },
              { icon: Tag, label: copy.trust_3, color: "#A81C1C" },
            ] as const).map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Icon className="h-5 w-5 shrink-0" style={{ color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Grid ───────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: "#FFFDF5" }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-px w-8" style={{ background: "#E8A400" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#E8A400" }}>
                Brands
              </span>
              <div className="h-px w-8" style={{ background: "#E8A400" }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{copy.brands_heading}</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BRANDS.map((brand) => {
              const tagline = (brand.tagline as Record<string, string>)[locale] ?? brand.tagline.en;
              const card = (
                <div
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: brand.bg,
                    border: `1px solid ${brand.border}`,
                  }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-black transition-transform duration-200 group-hover:scale-110"
                    style={{ background: brand.color, color: "#fff" }}
                  >
                    {brand.name.charAt(0)}
                  </div>
                  <p className="font-bold text-sm mt-1" style={{ color: brand.color }}>
                    {brand.name}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-tight">{tagline}</p>
                  {brand.href && (
                    <span
                      className="mt-1 text-xs font-semibold transition-colors"
                      style={{ color: brand.color }}
                    >
                      {copy.view}
                    </span>
                  )}
                </div>
              );

              return brand.href ? (
                <Link key={brand.slug} href={`/${locale}/${brand.href}`}>
                  {card}
                </Link>
              ) : (
                <div key={brand.slug}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Product Grid ─────────────────────────────────── */}
      <section id="phones-grid" className="py-14 px-6 bg-white">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6 flex-wrap">
            <Link href={`/${locale}/products`} className="hover:text-amber-600 transition-colors">
              {copy.all_products}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-700 font-medium">{copy.hero_title}</span>
          </nav>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {copy.products_heading}
            </h2>
            <p className="text-gray-500 text-sm">{copy.count(products.length)}</p>
          </div>

          <ProductsGrid
            products={products}
            locale={loc}
            searchPlaceholder={copy.search}
            emptyLabel={copy.empty}
          />
        </div>
      </section>
    </div>
  );
}
