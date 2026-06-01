"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { ProductCard, type DBProduct, type Locale } from "@/components/product/ProductCard";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistPage() {
  const locale = useLocale() as Locale;
  const { ids } = useWishlist();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids]);

  const wishedProducts = products.filter((p) => ids.includes(p.id));

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <Link
        href={`/${locale}/products`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Continuer mes achats
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
        {ids.length > 0 && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-600">
            {ids.length}
          </span>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: Math.min(ids.length, 4) }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-5 w-24 rounded bg-gray-200 animate-pulse mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && ids.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-gray-500">Aucun favori pour l&apos;instant</p>
          <p className="text-sm text-gray-400 mt-1">Cliquez sur le cœur d&apos;un produit pour l&apos;ajouter ici</p>
          <Link
            href={`/${locale}/products`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Voir les produits
          </Link>
        </div>
      )}

      {!loading && wishedProducts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wishedProducts.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      )}
    </main>
  );
}
