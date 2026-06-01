"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Package, User, Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, signOut } from "@/lib/auth/useAuth";
import { useCart } from "@/lib/cart";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();
  const { totalItems } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const pathname = usePathname();

  const base = `/${locale}`;

  async function handleSignOut() {
    await signOut();
    router.push(`/${locale}/account/login`);
  }

  const navLinks = [
    { href: `${base}/products`, label: t("products") },
    { href: `${base}/agent`, label: t("agent") },
    { href: `${base}/orders`, label: t("orders") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href={base}
          className="flex items-center gap-2 font-bold text-xl text-amber-600 hover:text-amber-700 transition-colors"
        >
          <Package className="h-6 w-6" />
          MadaShop
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${pathname.startsWith(link.href) ? "text-amber-600" : "text-gray-600 hover:text-amber-600"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Link href={`${base}/wishlist`} className="hidden sm:block">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className={`h-5 w-5 transition-colors ${wishlistIds.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                </span>
              )}
            </Button>
          </Link>

          <Link href={`${base}/cart`}>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {!loading && (
            user ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link href={`${base}/account`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
                    <User className="h-4 w-4" />
                    {user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0]}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <Link href={`${base}/account/login`} className="hidden sm:block">
                <Button variant="outline" size="sm" className="text-sm">
                  {t("login")}
                </Button>
              </Link>
            )
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith(link.href) ? "bg-amber-50 text-amber-700" : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"}`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={`${base}/cart`}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${pathname.startsWith(`${base}/cart`) ? "bg-amber-50 text-amber-700" : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"}`}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    {t("cart")}
                  </span>
                  {totalItems > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </Link>
                <Link
                  href={`${base}/wishlist`}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${pathname.startsWith(`${base}/wishlist`) ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-red-50 hover:text-red-600"}`}
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {t("wishlist")}
                  </span>
                  {wishlistIds.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                    </span>
                  )}
                </Link>
                <div className="border-t mt-3 pt-3">
                  {user ? (
                    <>
                      <Link
                        href={`${base}/account`}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        {t("account")}
                      </Link>
                      <button
                        onClick={() => { setMobileOpen(false); handleSignOut(); }}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {t("logout")}
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`${base}/account/login`}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors block"
                    >
                      {t("login")}
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
