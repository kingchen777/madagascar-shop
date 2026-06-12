"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Loader2, Globe } from "lucide-react";
import { type AdminLang, getT } from "@/lib/adminI18n";

const LANG_OPTIONS: { value: AdminLang; flag: string; name: string }[] = [
  { value: "fr", flag: "🇫🇷", name: "Français" },
  { value: "en", flag: "🇬🇧", name: "English" },
  { value: "zh", flag: "🇨🇳", name: "中文" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLangState] = useState<AdminLang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("admin_lang") as AdminLang | null;
    if (saved === "fr" || saved === "en" || saved === "zh") setLangState(saved);
  }, []);

  function switchLang(l: AdminLang) {
    setLangState(l);
    localStorage.setItem("admin_lang", l);
    document.cookie = `admin_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
  }

  const t = getT(lang).login;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace(from);
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? t.button);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Package className="h-10 w-10 text-amber-400" />
          <h1 className="mt-3 text-xl font-bold text-white">{t.title}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.placeholder}
            className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t.loading : t.button}
          </button>
        </form>

        {/* Language switcher */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Globe className="h-4 w-4 text-gray-500" />
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => switchLang(opt.value)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                lang === opt.value
                  ? "text-amber-400 font-semibold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {opt.flag} {opt.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
