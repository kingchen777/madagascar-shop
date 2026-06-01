"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { AlertTriangle } from "lucide-react";

const COPY = {
  fr: {
    title: "Une erreur s'est produite",
    desc: "Quelque chose ne s'est pas passé comme prévu. Veuillez réessayer.",
    btn: "Réessayer",
  },
  en: {
    title: "Something went wrong",
    desc: "An unexpected error occurred. Please try again.",
    btn: "Try again",
  },
  zh: {
    title: "出现错误",
    desc: "发生了意外错误，请重试。",
    btn: "重试",
  },
} as const;

type Locale = keyof typeof COPY;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const locale = useLocale() as Locale;
  const c = COPY[locale] ?? COPY.fr;

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <AlertTriangle className="h-14 w-14 text-amber-400 mb-5" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">{c.title}</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-7">{c.desc}</p>
      <button
        onClick={reset}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-500 px-8 text-sm font-semibold text-white hover:bg-amber-600 transition-colors shadow-md shadow-amber-200"
      >
        {c.btn}
      </button>
    </main>
  );
}
