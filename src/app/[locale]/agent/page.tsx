import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AgentOrderForm } from "@/components/product/AgentOrderForm";
import { Package, ShieldCheck, Clock, Truck } from "lucide-react";
import type { Locale as MockLocale } from "@/components/product/ProductCard";
import { supabase } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("agent") };
}

const PLATFORM_LOGOS = [
  { name: "淘宝 Taobao", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { name: "天猫 Tmall", color: "bg-red-50 text-red-600 border-red-200" },
  { name: "1688", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { name: "拼多多", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "京东 JD", color: "bg-red-50 text-red-700 border-red-200" },
];

const STEPS: Record<MockLocale, { title: string; desc: string }[]> = {
  fr: [
    { title: "Soumettez le lien", desc: "Copiez le lien du produit depuis une plateforme chinoise et collez-le dans le formulaire." },
    { title: "Recevez un devis", desc: "Nous calculons le coût total (produit + livraison + service) sous 24h." },
    { title: "Payez l'acompte", desc: "Confirmez avec un acompte de 30% via Mobile Money ou virement." },
    { title: "Récupérez votre colis", desc: "3–5 semaines plus tard, votre commande arrive à Madagascar." },
  ],
  en: [
    { title: "Submit the link", desc: "Copy the product link from a Chinese platform and paste it in the form." },
    { title: "Get a quote", desc: "We calculate the total cost (product + shipping + service) within 24h." },
    { title: "Pay the deposit", desc: "Confirm with a 30% deposit via Mobile Money or bank transfer." },
    { title: "Pick up your order", desc: "3–5 weeks later, your order arrives in Madagascar." },
  ],
  zh: [
    { title: "提交商品链接", desc: "复制中国电商平台的商品链接，粘贴到表单中。" },
    { title: "获取报价", desc: "我们在24小时内计算总费用（商品费+运费+服务费）。" },
    { title: "支付押金", desc: "通过移动支付或转账支付30%押金确认订单。" },
    { title: "取货", desc: "3-5周后，您的商品到达马达加斯加。" },
  ],
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string }>;
}

export default async function AgentPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { product: productSlug } = await searchParams;
  const loc = locale as MockLocale;
  const steps = STEPS[loc];
  const ta = await getTranslations({ locale, namespace: "agent" });

  // Fetch the product's actual sourceUrl so the form pre-fills the Chinese platform link
  let prefillUrl: string | undefined;
  if (productSlug) {
    const { data: product } = await supabase
      .from("Product")
      .select("sourceUrl")
      .eq("slug", productSlug)
      .single();
    prefillUrl = product?.sourceUrl ?? undefined;
  }

  const headings: Record<MockLocale, { h1: string; sub: string }> = {
    fr: {
      h1: "Commander depuis la Chine",
      sub: "Soumettez n'importe quel lien produit depuis Taobao, 1688, Pinduoduo, JD ou Tmall — nous gérons tout.",
    },
    en: {
      h1: "Order from China",
      sub: "Submit any product link from Taobao, 1688, Pinduoduo, JD or Tmall — we handle everything.",
    },
    zh: {
      h1: "中国商品代购",
      sub: "提交淘宝、1688、拼多多、京东或天猫的商品链接——我们全程处理。",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white py-14 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{headings[loc].h1}</h1>
          <p className="text-amber-100 text-lg max-w-xl mx-auto">{headings[loc].sub}</p>

          {/* Platform chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {PLATFORM_LOGOS.map((p) => (
              <span
                key={p.name}
                className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white border border-white/30"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Form (left, wider) ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {ta("form_heading")}
            </h2>
            <AgentOrderForm prefillUrl={prefillUrl} locale={loc} />
          </div>
        </div>

        {/* ── Steps + Trust (right) ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
              {ta("how_it_works_heading")}
            </h3>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Trust */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 space-y-3">
            {[
              { icon: ShieldCheck, key: "deposit_refundable" as const },
              { icon: Clock, key: "quote_24h" as const },
              { icon: Truck, key: "tracking" as const },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-2.5 text-sm text-amber-800">
                <Icon className="h-4 w-4 text-amber-500 shrink-0" />
                {ta(key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
