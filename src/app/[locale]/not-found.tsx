"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { PackageSearch } from "lucide-react";

const COPY = {
  fr: {
    title: "Page introuvable",
    desc: "La page que vous cherchez n'existe pas ou a été déplacée.",
    btn: "Retour à l'accueil",
  },
  en: {
    title: "Page not found",
    desc: "The page you're looking for doesn't exist or has been moved.",
    btn: "Back to home",
  },
  zh: {
    title: "页面未找到",
    desc: "您访问的页面不存在或已被移动。",
    btn: "返回首页",
  },
} as const;

type Locale = keyof typeof COPY;

export default function NotFound() {
  const locale = useLocale() as Locale;
  const c = COPY[locale] ?? COPY.fr;

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <PackageSearch className="h-16 w-16 text-amber-300 mb-6" />
      <h1 className="text-5xl font-bold text-gray-900 mb-3">404</h1>
      <p className="text-lg font-semibold text-gray-700 mb-2">{c.title}</p>
      <p className="text-sm text-gray-500 max-w-sm mb-8">{c.desc}</p>
      <Link
        href={`/${locale}`}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-500 px-8 text-sm font-semibold text-white hover:bg-amber-600 transition-colors shadow-md shadow-amber-200"
      >
        {c.btn}
      </Link>
    </main>
  );
}
