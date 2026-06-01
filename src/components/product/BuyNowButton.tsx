"use client";

import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useTranslations } from "next-intl";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    priceMGA: number;
    image?: string;
  };
  locale: string;
}

export function BuyNowButton({ product, locale }: Props) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const router = useRouter();

  function handleBuyNow() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceMGA: product.priceMGA,
      image: product.image,
    });
    router.push(`/${locale}/checkout`);
  }

  return (
    <button
      onClick={handleBuyNow}
      className="inline-flex h-12 items-center justify-center rounded-xl bg-amber-500 px-6 text-white font-semibold hover:bg-amber-600 transition-colors gap-2"
    >
      <ShoppingCart className="h-4 w-4" />
      {t("buy_now")}
    </button>
  );
}
