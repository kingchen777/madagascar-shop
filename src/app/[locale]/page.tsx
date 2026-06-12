import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import type { Locale } from "@/components/product/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("hero_title") };
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-red-50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#E8A400] to-[#C8900A] text-white font-bold text-lg shadow-md shadow-yellow-200">
        {step}
      </div>
      <h3 className="font-semibold text-base text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-100">
      <Icon className="h-4 w-4 text-[#E8A400] shrink-0" />
      {label}
    </div>
  );
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const loc = locale as Locale;
  const t = await getTranslations({ locale, namespace: "home" });
  const navT = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-6"
        style={{ background: "linear-gradient(135deg, #6B0000 0%, #A81C1C 45%, #7A0010 100%)" }}>

        {/* Madagascar flag stripe — left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col pointer-events-none">
          <div className="flex-1" style={{ background: "#FC3D32" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "#007A5E" }} />
        </div>

        {/* Chinese gold stars — decorative */}
        <div className="pointer-events-none select-none absolute top-10 right-16 text-3xl opacity-25" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute top-20 right-32 text-lg opacity-20" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute top-6 right-40 text-sm opacity-15" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute top-14 right-52 text-sm opacity-15" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute bottom-12 left-16 text-2xl opacity-15" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute bottom-20 left-32 text-sm opacity-10" style={{ color: "#FFDE00" }}>★</div>

        {/* Gold glow */}
        <div className="pointer-events-none absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{ background: "#E8A400" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-60 w-60 rounded-full blur-2xl opacity-10"
          style={{ background: "#007A5E" }} />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-widest backdrop-blur-sm">
            🇲🇬 Madagascar × 🇨🇳 Chine
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-sm">
            {t("hero_title")}
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "#FFCCC9" }}>
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col md:flex-row md:items-start gap-4 justify-center mb-12">
            <Link
              href={`/${locale}/products`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-semibold text-white transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #E8A400, #C8900A)", boxShadow: "0 4px 20px rgba(232,164,0,0.4)" }}
            >
              {t("shop_now")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/featured`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-semibold text-white transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #C42B1C, #A81C1C)", boxShadow: "0 4px 20px rgba(168,28,28,0.4)", border: "2px solid rgba(232,164,0,0.5)" }}
            >
              {navT("featured")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex flex-col items-center gap-1">
              <Link
                href={`/${locale}/agent`}
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-white/30 px-8 font-semibold text-white hover:bg-white/10 transition-all backdrop-blur-sm whitespace-nowrap"
              >
                {t("agent_order")}
              </Link>
              <span className="text-xs opacity-70 text-center" style={{ color: "#FFE8A0" }}>
                {t("agent_order_hint")}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <TrustBadge icon={ShieldCheck} label={t("trust_payment")} />
            <TrustBadge icon={Truck} label={t("trust_delivery")} />
            <TrustBadge icon={Clock} label={t("trust_tracking")} />
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 32L60 26.7C120 21.3 240 10.7 360 8C480 5.3 600 10.7 720 16C840 21.3 960 26.7 1080 26.7C1200 26.7 1320 21.3 1380 18.7L1440 16V32H0Z" fill="#FFFDF5"/>
          </svg>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="py-16 px-6" style={{ background: "#FFFDF5" }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-px w-8" style={{ background: "#E8A400" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#E8A400" }}>
                {t("how_it_works")}
              </span>
              <div className="h-px w-8" style={{ background: "#E8A400" }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("how_subtitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StepCard step={1} title={t("step1_title")} description={t("step1_desc")} />
            <StepCard step={2} title={t("step2_title")} description={t("step2_desc")} />
            <StepCard step={3} title={t("step3_title")} description={t("step3_desc")} />
            <StepCard step={4} title={t("step4_title")} description={t("step4_desc")} />
          </div>
        </div>
      </section>

      {/* ── Supported platforms ───────────────────────────────── */}
      <section className="py-12 px-6 bg-white border-y border-red-50">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-widest font-bold mb-6" style={{ color: "#E8A400" }}>
            {t("platforms_label")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {["淘宝 Taobao", "天猫 Tmall", "1688", "拼多多 Pinduoduo", "京东 JD.com"].map((platform) => (
              <span
                key={platform}
                className="rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-600 transition-all hover:-translate-y-0.5 hover:border-[#C42B1C] hover:text-[#C42B1C] cursor-default"
                style={{ borderColor: "#F0D0D0", background: "#FFF9F9" }}
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────── */}
      <Suspense fallback={null}>
        <FeaturedProducts locale={loc} />
      </Suspense>

      {/* ── CTA banner ───────────────────────────────────────── */}
      <section className="relative py-20 px-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6B0000 0%, #A81C1C 50%, #7A0010 100%)" }}>

        {/* Stars */}
        <div className="pointer-events-none select-none absolute top-8 left-12 text-4xl opacity-20" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute top-12 left-28 text-xl opacity-15" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute bottom-8 right-16 text-3xl opacity-20" style={{ color: "#FFDE00" }}>★</div>
        <div className="pointer-events-none select-none absolute bottom-14 right-32 text-lg opacity-15" style={{ color: "#FFDE00" }}>★</div>

        {/* Madagascar flag stripe — right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-1.5 flex flex-col pointer-events-none">
          <div className="flex-1" style={{ background: "#FC3D32" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ background: "#007A5E" }} />
        </div>

        <div className="relative mx-auto max-w-2xl text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t("cta_title")}</h2>
          <p className="mb-8 leading-relaxed" style={{ color: "#FFCCC9" }}>{t("cta_subtitle")}</p>
          <Link
            href={`/${locale}/agent`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-semibold transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #E8A400, #C8900A)", boxShadow: "0 4px 20px rgba(232,164,0,0.35)" }}
          >
            {navT("agent")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
