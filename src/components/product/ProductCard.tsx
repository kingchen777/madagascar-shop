import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatMGA } from "@/lib/pricing";
import { ShoppingCart, Package } from "lucide-react";

export type Locale = "fr" | "en" | "zh";

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
  images: string[] | null;
  translations: Record<string, { name: string; description: string; isAuto?: boolean }> | null;
  category: { slug: string; name: Record<string, string> } | null;
};

interface ProductCardProps {
  product: DBProduct;
  locale: Locale;
}

const SOURCE_LABELS: Record<string, string> = {
  TAOBAO: "淘宝", TMALL: "天猫", PINDUODUO: "拼多多",
  JD: "京东", ALIBABA1688: "1688", OTHER: "Chine",
};

const ADD_LABELS: Record<Locale, string> = {
  fr: "Ajouter", en: "Add", zh: "加购",
};

export function ProductCard({ product, locale }: ProductCardProps) {
  const trans = product.translations ?? {};
  const translation = trans[locale] ?? trans["fr"] ?? { name: product.slug, description: "" };
  const images = product.images ?? [];
  const categoryName = product.category?.name?.[locale] ?? product.category?.name?.["fr"] ?? "";

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={images[0] ?? "/placeholder.png"}
          alt={translation.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.type === "AGENT" && (
            <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 shadow">
              {SOURCE_LABELS[product.source] ?? "Chine"}
            </Badge>
          )}
          {translation.isAuto && (
            <Badge variant="outline" className="bg-white/80 text-[10px]">
              Auto
            </Badge>
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
            {product.type === "AGENT" ? (
              <Package className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Keep backward-compat export for AgentOrderForm
export type { ADD_LABELS };
