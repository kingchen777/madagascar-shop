import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/db";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { getAdminLang } from "@/lib/getAdminLang";
import { getT } from "@/lib/adminI18n";

function formatMGA(n: number | string) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}

const TYPE_BADGE: Record<string, string> = {
  SELF: "bg-blue-100 text-blue-700",
  AGENT: "bg-purple-100 text-purple-700",
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  SOLD_OUT: "bg-red-100 text-red-600",
};

const SOURCE_LABEL: Record<string, string> = {
  NONE: "—", TAOBAO: "Taobao", JD: "JD.com",
  PINDUODUO: "Pinduoduo", ALIBABA1688: "1688", TMALL: "Tmall",
};

export default async function AdminProductsPage() {
  const lang = await getAdminLang();
  const t = getT(lang);
  const tp = t.products;

  const { data: productsData } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl,
      translations:ProductTranslation(locale, name),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .order("createdAt", { ascending: false });
  const products = productsData ?? [];

  const headers = [
    tp.headers.product, tp.headers.category, tp.headers.type,
    tp.headers.source, tp.headers.price, tp.headers.stock,
    tp.headers.status, tp.headers.actions,
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{tp.title} ({products.length})</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {tp.newProduct}
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  {tp.noProducts}
                </td>
              </tr>
            ) : products.map((p) => {
              const trans = (p.translations as { locale: string; name: string }[] | null) ?? [];
              const name = trans.find((x) => x.locale === lang)?.name
                ?? trans.find((x) => x.locale === "fr")?.name
                ?? p.slug;
              const cat = p.category as unknown as { slug: string; categoryTranslations: { locale: string; name: string }[] } | null;
              const catName = cat?.categoryTranslations.find((x) => x.locale === lang)?.name
                ?? cat?.categoryTranslations.find((x) => x.locale === "fr")?.name
                ?? "—";

              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{name}</p>
                      <p className="text-xs text-gray-400">{p.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{catName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[p.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {SOURCE_LABEL[p.source] ?? p.source}
                    {p.sourceUrl && (
                      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:text-blue-600">
                        <ExternalLink className="inline h-3 w-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-amber-700">
                    {formatMGA(p.priceMGA)}
                    {p.basePriceCNY && (
                      <span className="ml-1 text-xs font-normal text-gray-400">(¥{p.basePriceCNY})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.stock != null ? (
                      <span className={p.stock < 5 ? "text-red-500 font-semibold" : ""}>{p.stock}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {tp.status[p.status as keyof typeof tp.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/fr/products/${p.slug}`} target="_blank" className="text-gray-400 hover:text-blue-500 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/products/${p.id}/edit`} className="text-gray-400 hover:text-amber-600 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton id={p.id} name={name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
