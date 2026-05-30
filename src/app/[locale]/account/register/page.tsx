import type { Metadata } from "next";
import { Package } from "lucide-react";
import { AuthForm } from "@/components/layout/AuthForm";

export const metadata: Metadata = { title: "Créer un compte" };

interface Props { params: Promise<{ locale: string }> }

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  const loc = locale as "fr" | "en" | "zh";

  const headings = {
    fr: { title: "Créer un compte", sub: "Rejoignez MadaShop et commandez depuis la Chine" },
    en: { title: "Create an account", sub: "Join MadaShop and order from China" },
    zh: { title: "注册账号", sub: "加入 MadaShop，开始中国代购服务" },
  };
  const h = headings[loc];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white mb-4">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{h.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{h.sub}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <AuthForm mode="register" locale={loc} />
        </div>
      </div>
    </div>
  );
}
