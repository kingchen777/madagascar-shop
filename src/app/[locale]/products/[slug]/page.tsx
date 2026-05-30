import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getMockProduct, type MockLocale } from "@/lib/mock-data";
import { formatMGA, formatCNY } from "@/lib/pricing";
import {
  ShoppingCart,
  Package,
  Weight,
  ChevronLeft,
  ExternalLink,
  Info,
} from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getMockProduct(slug);
  if (!product) return { title: "Not found" };
  const loc = locale as MockLocale;
  const translation = product.translations[loc] ?? product.translations.fr;
  return { title: translation.name };
}

const SOURCE_LABELS: Record<string, string> = {
  TAOBAO: "淘宝 Taobao",
  TMALL: "天猫 Tmall",
  PINDUODUO: "拼多多 Pinduoduo",
  JD: "京东 JD.com",
  ALIBABA1688: "1688 / Alibaba",
  OTHER: "Chine",
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const product = getMockProduct(slug);
  if (!product) notFound();

  const loc = locale as MockLocale;
  const t = await getTranslations({ locale, namespace: "product" });
  const translation = product.translations[loc] ?? product.translations.fr;

  // Parse simple markdown-like description
  const descriptionLines = translation.description.split("\n");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("add_to_cart").includes("Ajouter")
            ? "Retour aux produits"
            : "Back to products"}
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Image ── */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={product.images[0] ?? "/placeholder.png"}
              alt={translation.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {product.type === "AGENT" && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-amber-500 text-white shadow-md">
                  {SOURCE_LABELS[product.source] ?? "Chine"}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            {product.category.name[loc]}
          </p>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
            {translation.name}
            {translation.isAuto && (
              <span className="ml-2 text-xs font-normal text-gray-400 normal-case">
                ({t("auto_translated")})
              </span>
            )}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-amber-600">
              {formatMGA(product.priceMGA)}
            </span>
            {product.basePriceCNY && (
              <span className="text-sm text-gray-400">
                ≈ {formatCNY(product.basePriceCNY)}
              </span>
            )}
          </div>

          {/* Stock / Agent notice */}
          {product.type === "SELF" ? (
            <div className="flex items-center gap-2 text-sm">
              {(product.stock ?? 0) > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ {t("stock")} ({product.stock})
                </span>
              ) : (
                <span className="text-red-500 font-medium">{t("out_of_stock")}</span>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
              <span>
                Article commandé depuis la Chine. Délai estimé :{" "}
                <strong>3–5 semaines</strong> après confirmation et paiement de l&apos;acompte.
              </span>
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
            {product.weightKg && (
              <span className="flex items-center gap-1.5">
                <Weight className="h-4 w-4" />
                {t("weight")} : {product.weightKg} kg
              </span>
            )}
            {product.type === "AGENT" && product.sourceUrl && (
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700"
              >
                <ExternalLink className="h-4 w-4" />
                {t("source")}
              </a>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {product.type === "SELF" ? (
              <>
                <AddToCartButton product={{ id: product.id, slug: product.slug, name: translation.name, priceMGA: product.priceMGA, image: product.images[0] }} />
                <Link
                  href={`/${locale}/checkout?product=${product.slug}`}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-6 text-white font-semibold hover:bg-amber-600 transition-colors gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t("buy_now")}
                </Link>
              </>
            ) : (
              <Link
                href={`/${locale}/agent?product=${product.slug}`}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-6 text-white font-semibold hover:bg-amber-600 transition-colors gap-2"
              >
                <Package className="h-4 w-4" />
                {t("agent_order")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="mt-12 border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">{t("description")}</h2>
        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-2">
          {descriptionLines.map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-semibold text-gray-800">
                  {line.slice(2, -2)}
                </p>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <p key={i} className="pl-4 before:content-['•'] before:mr-2 before:text-amber-500">
                  {line.slice(2)}
                </p>
              );
            }
            if (line.startsWith("⚠️")) {
              return (
                <p key={i} className="text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-sm">
                  {line}
                </p>
              );
            }
            if (line.trim() === "") return null;
            return <p key={i}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
