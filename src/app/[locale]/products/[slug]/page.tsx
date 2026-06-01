import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMGA, formatCNY } from "@/lib/pricing";
import { supabase } from "@/lib/db";
import { ProductCard, type Locale, type DBProduct } from "@/components/product/ProductCard";
import { ReviewSection } from "@/components/product/ReviewSection";
import { Package, Weight, ChevronLeft, ExternalLink, Info } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { BuyNowButton } from "@/components/product/BuyNowButton";
import { ImageGallery } from "@/components/product/ImageGallery";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const { data: product } = await supabase
    .from("Product")
    .select(`
      translations:ProductTranslation(locale, name, description),
      images:ProductImage(url, sort)
    `)
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Not found" };

  const trans = (product.translations as { locale: string; name: string; description: string }[] | null) ?? [];
  const t = trans.find((t) => t.locale === locale) ?? trans.find((t) => t.locale === "fr");
  const name = t?.name ?? slug;
  const description = t?.description ?? undefined;

  const images = (product.images as { url: string; sort: number }[] | null) ?? [];
  const coverImage = images.sort((a, b) => a.sort - b.sort)[0]?.url;

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://madashop.mg";

  return {
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      url: `${BASE_URL}/${locale}/products/${slug}`,
      type: "website",
      ...(coverImage ? { images: [{ url: coverImage }] } : {}),
    },
    twitter: {
      card: coverImage ? "summary_large_image" : "summary",
      title: name,
      description,
      ...(coverImage ? { images: [coverImage] } : {}),
    },
  };
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
  const t = await getTranslations({ locale, namespace: "product" });
  const loc = locale as Locale;

  const { data: product } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  type Translation = { locale: string; name: string; description: string; isAuto?: boolean };
  type CategoryT = { slug: string; categoryTranslations: { locale: string; name: string }[] };
  type ImageT = { url: string; sort: number };

  const translations = (product.translations as Translation[] | null) ?? [];
  const translation = translations.find((t) => t.locale === loc) ?? translations.find((t) => t.locale === "fr") ?? { name: product.slug, description: "", isAuto: false };
  const images = [...((product.images as ImageT[] | null) ?? [])].sort((a, b) => a.sort - b.sort).map((i) => i.url);
  const category = product.category as unknown as CategoryT | null;
  const categoryName = category?.categoryTranslations.find((t) => t.locale === loc)?.name ?? category?.categoryTranslations.find((t) => t.locale === "fr")?.name ?? "";
  const descriptionLines = (translation.description ?? "").split("\n");

  // Related products — same category, exclude current
  let related: DBProduct[] = [];
  if (category?.slug) {
    const { data: relatedData } = await supabase
      .from("Product")
      .select(`
        id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
        translations:ProductTranslation(locale, name, description, isAuto),
        images:ProductImage(url, sort),
        category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
      `)
      .eq("status", "ACTIVE")
      .neq("slug", slug)
      .limit(4);
    // Filter client-side by category slug to avoid complex join filter
    related = ((relatedData ?? []) as unknown as DBProduct[])
      .filter((p) => (p.category as unknown as CategoryT | null)?.slug === category.slug)
      .slice(0, 4);
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://madashop.mg";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: translation.name,
    description: translation.description || undefined,
    image: images.length > 0 ? images : undefined,
    url: `${BASE_URL}/${locale}/products/${slug}`,
    offers: {
      "@type": "Offer",
      price: product.priceMGA,
      priceCurrency: "MGA",
      availability:
        product.type === "AGENT" || (product.stock ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("back_to_products")}
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <ImageGallery
          images={images}
          alt={translation.name}
          badge={
            product.type === "AGENT" ? (
              <Badge className="bg-amber-500 text-white shadow-md">
                {SOURCE_LABELS[product.source] ?? "Chine"}
              </Badge>
            ) : undefined
          }
        />

        {/* Info */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            {categoryName}
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
              <span>{t("agent_lead_time")}</span>
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
                <AddToCartButton product={{ id: product.id, slug: product.slug, name: translation.name, priceMGA: product.priceMGA, image: images[0] ?? undefined }} />
                <BuyNowButton product={{ id: product.id, slug: product.slug, name: translation.name, priceMGA: product.priceMGA, image: images[0] ?? undefined }} locale={locale} />
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

      {/* Description */}
      <div className="mt-12 border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">{t("description")}</h2>
        <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-2">
          {descriptionLines.map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return <p key={i} className="font-semibold text-gray-800">{line.slice(2, -2)}</p>;
            }
            if (line.startsWith("- ")) {
              return <p key={i} className="pl-4 before:content-['•'] before:mr-2 before:text-amber-500">{line.slice(2)}</p>;
            }
            if (line.startsWith("⚠️")) {
              return <p key={i} className="text-amber-700 bg-amber-50 rounded-lg px-3 py-2 text-sm">{line}</p>;
            }
            if (line.trim() === "") return null;
            return <p key={i}>{line}</p>;
          })}
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection productId={product.id} locale={locale} />

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12 border-t border-gray-100 pt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {{ fr: "Produits similaires", en: "Related products", zh: "相关商品" }[locale] ?? "Produits similaires"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={loc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
