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
    <div className="relative flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-lg shadow-md">
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
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Icon className="h-4 w-4 text-amber-500 shrink-0" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-white py-20 px-6">
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-orange-200/20 blur-2xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">
            🇲🇬 Madagascar × 🇨🇳 Chine
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {t("hero_title")}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="./products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 text-white font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
            >
              {t("shop_now")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="./agent"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-amber-400 px-8 text-amber-700 font-semibold hover:bg-amber-50 transition-colors"
            >
              {t("agent_order")}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <TrustBadge icon={ShieldCheck} label={t("trust_payment")} />
            <TrustBadge icon={Truck} label={t("trust_delivery")} />
            <TrustBadge icon={Clock} label={t("trust_tracking")} />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            {t("how_it_works")}
          </h2>
          <p className="text-center text-gray-500 mb-10 text-sm">
            {t("how_subtitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StepCard step={1} title={t("step1_title")} description={t("step1_desc")} />
            <StepCard step={2} title={t("step2_title")} description={t("step2_desc")} />
            <StepCard step={3} title={t("step3_title")} description={t("step3_desc")} />
            <StepCard step={4} title={t("step4_title")} description={t("step4_desc")} />
          </div>
        </div>
      </section>

      {/* ── Supported platforms ───────────────────────────────── */}
      <section className="py-12 px-6 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-semibold">
            {t("platforms_label")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500">
            {["淘宝 Taobao", "天猫 Tmall", "1688", "拼多多 Pinduoduo", "京东 JD.com"].map(
              (platform) => (
                <span
                  key={platform}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 hover:border-amber-300 hover:text-amber-700 transition-colors"
                >
                  {platform}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────── */}
      <Suspense fallback={null}>
        <FeaturedProducts locale={loc} />
      </Suspense>

      {/* ── CTA banner ───────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {t("cta_title")}
          </h2>
          <p className="text-amber-100 mb-8">
            {t("cta_subtitle")}
          </p>
          <Link
            href="./agent"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-amber-600 font-semibold hover:bg-amber-50 transition-colors shadow-lg"
          >
            {navT("agent")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
