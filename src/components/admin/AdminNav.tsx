"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-700">
        <Package className="h-6 w-6 text-amber-400" />
        <div>
          <p className="text-sm font-bold text-white">MadaShop</p>
          <p className="text-xs text-gray-400">Administration</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
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
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-700 space-y-1">
        <Link
          href="/fr"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Voir le site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
