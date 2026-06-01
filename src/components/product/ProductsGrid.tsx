"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, type Locale, type DBProduct } from "./ProductCard";

const PAGE_SIZE = 12;

interface Props {
  products: DBProduct[];
  locale: Locale;
  searchPlaceholder: string;
  emptyLabel: string;
}

export function ProductsGrid({ products, locale, searchPlaceholder, emptyLabel }: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        const name =
          p.translations?.find((t) => t.locale === locale)?.name ??
          p.translations?.find((t) => t.locale === "fr")?.name ??
          "";
        return name.toLowerCase().includes(q);
      })
    : products;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever search or source list changes
  useEffect(() => {
    setPage(1);
  }, [query, products]);

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">{emptyLabel}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {paginated.map((product, i) => (
              <ProductCard key={product.id} product={product} locale={locale} priority={i < 4} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                  const isActive = n === page;
                  const isNearCurrent = Math.abs(n - page) <= 1 || n === 1 || n === totalPages;
                  if (!isNearCurrent) {
                    return n === 2 || n === totalPages - 1 ? (
                      <span key={n} className="px-1 text-gray-400 text-sm">…</span>
                    ) : null;
                  }
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`h-9 min-w-[2.25rem] rounded-lg px-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-amber-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <p className="mt-3 text-center text-xs text-gray-400">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
          )}
        </>
      )}
    </>
  );
}
