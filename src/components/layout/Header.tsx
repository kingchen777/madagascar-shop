"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
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
    router.push("/account/login");
  }

  const navLinks = [
    { href: "/products", label: t("products") },
    { href: "/featured", label: t("featured") },
    { href: "/agent", label: t("agent") },
    { href: "/orders", label: t("orders") },
  ];

  return (
    <>
      {/* Madagascar flag top stripe */}
      <div className="flex h-1 w-full">
        <div className="flex-1" style={{ background: "#FC3D32" }} />
        <div className="flex-1 bg-white border-y border-gray-100" />
        <div className="flex-1" style={{ background: "#007A5E" }} />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/98 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link
            href={base}
            className="flex items-center gap-2 font-bold text-xl transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
              style={{ background: "linear-gradient(135deg, #A81C1C, #6B0000)" }}>
              <Package className="h-4 w-4 text-white" />
            </div>
            <span style={{ color: "#A81C1C" }}>Mada</span>
            <span style={{ color: "#E8A400" }}>Shop</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const fullHref = `${base}${link.href}`;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: isActive ? "#A81C1C" : "#4B5563",
                  }}
                >
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full"
                      style={{ background: "#E8A400" }} />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />

            <Link href={`${base}/wishlist`} className="hidden md:block">
              <Button variant="ghost" size="icon" className="relative hover:bg-red-50">
                <Heart className={`h-5 w-5 transition-colors ${wishlistIds.length > 0 ? "fill-red-600 text-red-600" : "text-gray-500"}`} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: "#A81C1C" }}>
                    {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                  </span>
                )}
              </Button>
            </Link>

            <Link href={`${base}/cart`}>
              <Button variant="ghost" size="icon" className="relative hover:bg-yellow-50">
                <ShoppingCart className="h-5 w-5 text-gray-500" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: "#E8A400" }}>
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {!loading && (
              user ? (
                <div className="hidden md:flex items-center gap-1">
                  <Link href={`${base}/account`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700">
                      <User className="h-4 w-4" />
                      {user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0]}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-sm text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <Link href={`${base}/account/login`} className="hidden md:block">
                  <Button size="sm" className="text-sm text-white rounded-lg"
                    style={{ background: "linear-gradient(135deg, #A81C1C, #6B0000)" }}>
                    {t("login")}
                  </Button>
                </Link>
              )
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-red-50 transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-1 mt-6">
                  {navLinks.map((link) => {
                    const fullHref = `${base}${link.href}`;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={fullHref}
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: isActive ? "#FFF0F0" : undefined,
                          color: isActive ? "#A81C1C" : "#374151",
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <Link
                    href={`${base}/cart`}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-yellow-50 transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      {t("cart")}
                    </span>
                    {totalItems > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "#E8A400" }}>
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={`${base}/wishlist`}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {t("wishlist")}
                    </span>
                    {wishlistIds.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "#A81C1C" }}>
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
                          className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          {t("account")}
                        </Link>
                        <button
                          onClick={() => { setMobileOpen(false); handleSignOut(); }}
                          className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          {t("logout")}
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`${base}/account/login`}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 rounded-lg text-sm font-semibold text-white text-center rounded-lg transition-colors"
                        style={{ background: "linear-gradient(135deg, #A81C1C, #6B0000)" }}
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
    </>
  );
}
