"use client";

import { useTranslations } from "next-intl";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    priceMGA: number;
    image?: string;
  };
}

export function AddToCartButton({ product }: Props) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceMGA: product.priceMGA,
      image: product.image,
    });
    setAdded(true);
    toast.success(`${product.name} ajouté au panier`, { duration: 2000 });
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      className={`inline-flex h-12 flex-1 items-center justify-center rounded-xl border-2 px-6 font-semibold transition-all gap-2 ${
        added
          ? "border-green-500 text-green-600 bg-green-50"
          : "border-amber-400 text-amber-700 hover:bg-amber-50"
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {t("add_to_cart")}
        </>
      )}
    </button>
  );
}
