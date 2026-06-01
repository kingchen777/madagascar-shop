import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Package, MessageCircle, Mail, Phone } from "lucide-react";
import { supabase } from "@/lib/db";

interface FooterProps {
  locale: string;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const tf = await getTranslations({ locale, namespace: "footer" });
  const base = `/${locale}`;

  const { data: rows } = await supabase
    .from("Setting")
    .select("key, value")
    .in("key", ["contact_whatsapp", "contact_phone", "contact_email"]);

  const settings: Record<string, string> = {};
  for (const row of rows ?? []) settings[row.key] = row.value;

  const whatsapp = settings.contact_whatsapp || "261000000000";
  const phone = settings.contact_phone || "+261 XX XXX XXXX";
  const email = settings.contact_email || "contact@madashop.mg";
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

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
              {tf("tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              {tf("nav_heading")}
            </h3>
            <ul className="space-y-2">
              {[
                { href: base, label: t("home") },
                { href: `${base}/products`, label: t("products") },
                { href: `${base}/agent`, label: t("agent") },
                { href: `${base}/orders`, label: t("orders") },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              {tf("services_heading")}
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
              {tf("contact_heading")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={whatsappHref}
                  className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-400 shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-sm hover:text-amber-400 transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MadaShop. {tf("rights")}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href={`${base}/legal`} className="hover:text-gray-300 transition-colors">
              {tf("legal")}
            </Link>
            <Link href={`${base}/privacy`} className="hover:text-gray-300 transition-colors">
              {tf("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
