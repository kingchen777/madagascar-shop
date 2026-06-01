"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatMGA } from "@/lib/pricing";
import { ShoppingCart, Package, Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

export type Locale = "fr" | "en" | "zh";

export type ProductTranslation = {
  locale: string;
  name: string;
  description: string;
  isAuto?: boolean;
};

export type DBProduct = {
  id: string;
  slug: string;
  type: "SELF" | "AGENT";
  priceMGA: number;
  basePriceCNY: number | null;
  stock: number | null;
  status: string;
  source: string;
  sourceUrl: string | null;
  weightKg: number | null;
  translations: ProductTranslation[];
  images: { url: string; sort: number }[];
  category: {
    slug: string;
    categoryTranslations: { locale: string; name: string }[];
  } | null;
};

export function getProductTranslation(translations: ProductTranslation[], locale: string) {
  return translations.find((t) => t.locale === locale) ?? translations.find((t) => t.locale === "fr") ?? { name: "", description: "", isAuto: false };
}

export function getCategoryName(cat: DBProduct["category"], locale: string): string {
  if (!cat) return "";
  const t = cat.categoryTranslations.find((t) => t.locale === locale) ?? cat.categoryTranslations.find((t) => t.locale === "fr");
  return t?.name ?? cat.slug;
}

interface ProductCardProps {
  product: DBProduct;
  locale: Locale;
  priority?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  TAOBAO: "淘宝", TMALL: "天猫", PINDUODUO: "拼多多",
  JD: "京东", ALIBABA1688: "1688", OTHER: "Chine",
};

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const translation = getProductTranslation(product.translations, locale);
  const firstImage = [...(product.images ?? [])].sort((a, b) => a.sort - b.sort)[0]?.url ?? null;
  const categoryName = getCategoryName(product.category, locale);
  const { has, toggle } = useWishlist();
  const wished = has(product.id);

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Wishlist button */}
      <button
        onClick={(e) => { e.preventDefault(); toggle(product.id); }}
        className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        aria-label={wished ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart
          className={`h-4 w-4 transition-colors ${wished ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        />
      </button>

      <Link href={`/${locale}/products/${product.slug}`} className="flex flex-col flex-1">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={translation.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <Package className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.type === "AGENT" && (
              <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 shadow">
                {SOURCE_LABELS[product.source] ?? "Chine"}
              </Badge>
            )}
            {translation.isAuto && (
              <Badge variant="outline" className="bg-white/80 text-[10px]">Auto</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4 gap-2">
          <p className="text-xs text-gray-400 font-medium">{categoryName}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
            {translation.name}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-base font-bold text-amber-600">
              {formatMGA(product.priceMGA)}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              {product.type === "AGENT" ? <Package className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
