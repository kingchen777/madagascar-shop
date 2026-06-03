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
    <footer style={{ background: "linear-gradient(160deg, #4A0000 0%, #6B0000 60%, #3A0010 100%)" }}>

      {/* Top flag stripe */}
      <div className="flex h-1">
        <div className="flex-1" style={{ background: "#FC3D32" }} />
        <div className="flex-1" style={{ background: "rgba(255,255,255,0.3)" }} />
        <div className="flex-1" style={{ background: "#007A5E" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-white">Mada</span>
              <span style={{ color: "#E8A400" }}>Shop</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#FFCCC9" }}>
              {tf("tagline")}
            </p>
            {/* Stars decoration */}
            <div className="mt-4 flex gap-1" style={{ color: "#E8A400" }}>
              <span className="text-lg">★</span>
              <span className="text-xs mt-1">★</span>
              <span className="text-xs mt-1">★</span>
              <span className="text-xs mt-1">★</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: "#E8A400" }}>
              {tf("nav_heading")}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: base, label: t("home") },
                { href: `${base}/products`, label: t("products") },
                { href: `${base}/featured`, label: t("featured") },
                { href: `${base}/agent`, label: t("agent") },
                { href: `${base}/orders`, label: t("orders") },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "#FFCCC9" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h3 className="font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: "#E8A400" }}>
              {tf("services_heading")}
            </h3>
            <ul className="space-y-2.5 text-sm" style={{ color: "#FFCCC9" }}>
              <li className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#E8A400" }}>★</span>
                Taobao / Tmall
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#E8A400" }}>★</span>
                1688 / Alibaba
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#E8A400" }}>★</span>
                Pinduoduo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#E8A400" }}>★</span>
                JD.com
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: "#E8A400" }}>
              {tf("contact_heading")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href={whatsappHref}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                  style={{ color: "#FFCCC9" }}>
                  <MessageCircle className="h-4 w-4 shrink-0" style={{ color: "#4CAF50" }} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                  style={{ color: "#FFCCC9" }}>
                  <Phone className="h-4 w-4 shrink-0" style={{ color: "#E8A400" }} />
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                  style={{ color: "#FFCCC9" }}>
                  <Mail className="h-4 w-4 shrink-0" style={{ color: "#E8A400" }} />
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-xs" style={{ color: "rgba(255,204,201,0.6)" }}>
            © {new Date().getFullYear()} MadaShop. {tf("rights")}
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,204,201,0.6)" }}>
            <Link href={`${base}/legal`} className="hover:text-white transition-colors">
              {tf("legal")}
            </Link>
            <Link href={`${base}/privacy`} className="hover:text-white transition-colors">
              {tf("privacy")}
            </Link>
            <span>🇲🇬 × 🇨🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
