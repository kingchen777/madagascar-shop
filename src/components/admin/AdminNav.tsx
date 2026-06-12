"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Tag, Percent, Globe } from "lucide-react";
import { useState } from "react";
import { useAdminLang } from "./AdminLangContext";
import type { AdminLang } from "@/lib/adminI18n";

const LANG_OPTIONS: { value: AdminLang; flag: string; name: string }[] = [
  { value: "fr", flag: "🇫🇷", name: "Français" },
  { value: "en", flag: "🇬🇧", name: "English" },
  { value: "zh", flag: "🇨🇳", name: "中文" },
];

const NAV_KEYS = ["dashboard", "products", "categories", "orders", "promos", "settings"] as const;
const NAV_HREFS = [
  { href: "/admin", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", icon: Package },
  { href: "/admin/categories", icon: Tag },
  { href: "/admin/orders", icon: ShoppingBag },
  { href: "/admin/promos", icon: Percent },
  { href: "/admin/settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const { lang, t, setLang } = useAdminLang();
  const [showLangMenu, setShowLangMenu] = useState(false);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  const currentLang = LANG_OPTIONS.find((l) => l.value === lang)!;

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-700">
        <Package className="h-6 w-6 text-amber-400" />
        <div>
          <p className="text-sm font-bold text-white">MadaShop</p>
          <p className="text-xs text-gray-400">{t.nav.brand}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_HREFS.map(({ href, icon: Icon, exact }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive(href, exact)
                ? "bg-amber-500 text-white font-medium"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {t.nav[NAV_KEYS[i]]}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-700 space-y-1">
        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu((v) => !v)}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">{currentLang.flag} {currentLang.name}</span>
          </button>
          {showLangMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden shadow-lg">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setLang(opt.value); setShowLangMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    lang === opt.value
                      ? "bg-amber-500 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span>{opt.flag}</span>
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/fr"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t.viewSite}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t.logout}
        </button>
      </div>
    </aside>
  );
}
