"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { User, ShoppingBag, MapPin, LogOut, ChevronRight } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth/useAuth";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/${locale}/account/login`);
    }
  }, [user, loading, locale, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500 text-sm">Chargement…</div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.full_name ?? user.email ?? "Utilisateur";
  const base = `/${locale}`;

  const menuItems = [
    {
      href: `${base}/orders`,
      icon: ShoppingBag,
      label: t("orders"),
      description: "Suivre vos commandes en cours",
    },
    {
      href: `${base}/account/addresses`,
      icon: MapPin,
      label: "Mes adresses",
      description: "Gérer vos adresses de livraison",
    },
  ];

  async function handleSignOut() {
    await signOut();
    router.replace(`/${locale}/account/login`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* User header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <User className="h-8 w-8" />
        </div>
        <div>
          <p className="text-xl font-semibold text-gray-900">{displayName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-amber-300 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="mt-8">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
      </div>
    </main>
  );
}
