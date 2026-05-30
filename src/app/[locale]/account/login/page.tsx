import type { Metadata } from "next";
import { Package } from "lucide-react";
import { AuthForm } from "@/components/layout/AuthForm";

export const metadata: Metadata = { title: "Connexion" };

interface Props { params: Promise<{ locale: string }> }

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const loc = locale as "fr" | "en" | "zh";

  const headings = {
    fr: { title: "Bon retour !", sub: "Connectez-vous pour suivre vos commandes" },
    en: { title: "Welcome back!", sub: "Log in to track your orders" },
    zh: { title: "欢迎回来！", sub: "登录以查看您的订单" },
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
          <AuthForm mode="login" locale={loc} />
        </div>
      </div>
    </div>
  );
}
