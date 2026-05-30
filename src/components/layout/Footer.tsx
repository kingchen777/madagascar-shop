"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Package, MessageCircle, Mail, Phone } from "lucide-react";

export function Footer() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const base = `/${locale}`;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Package className="h-5 w-5 text-amber-400" />
              MadaShop
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre partenaire de confiance pour les achats depuis la Chine à Madagascar.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: `${base}`, label: t("home") },
                { href: `${base}/products`, label: t("products") },
                { href: `${base}/agent`, label: t("agent") },
                { href: `${base}/orders`, label: t("orders") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* How it works */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Taobao / Tmall</li>
              <li>1688 / Alibaba</li>
              <li>Pinduoduo</li>
              <li>JD.com</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/261000000000"
                  className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-400 shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="tel:+261000000000"
                  className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  +261 XX XXX XXXX
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@madashop.mg"
                  className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  contact@madashop.mg
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MadaShop. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href={`${base}/legal`} className="hover:text-gray-300 transition-colors">
              Mentions légales
            </Link>
            <Link href={`${base}/privacy`} className="hover:text-gray-300 transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
