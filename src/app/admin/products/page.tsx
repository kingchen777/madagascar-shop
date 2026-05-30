import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

function formatMGA(n: number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(n) + " Ar";
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

const STATUS_FR: Record<string, string> = {
  ACTIVE: "Actif",
  DRAFT: "Brouillon",
  SOLD_OUT: "Épuisé",
};

const SOURCE_FR: Record<string, string> = {
  NONE: "—",
  TAOBAO: "Taobao",
  JD: "JD.com",
  PINDUODUO: "Pinduoduo",
  ALIBABA1688: "1688",
  TMALL: "Tmall",
};

export default function AdminProductsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Produits ({MOCK_PRODUCTS.length})
        </h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {["Tous", "Direct (SELF)", "Agent", "Actif", "Brouillon"].map((f) => (
          <button
            key={f}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Produit", "Catégorie", "Type", "Source", "Prix (MGA)", "Stock", "Statut", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_PRODUCTS.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {p.translations.fr.name}
                    </p>
                    <p className="text-xs text-gray-400">{p.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.category.name.fr}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[p.type]}`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {SOURCE_FR[p.source] ?? p.source}
                  {p.sourceUrl && (
                    <a
                      href={p.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-400 hover:text-blue-600"
                    >
                      <ExternalLink className="inline h-3 w-3" />
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-amber-700">
                  {formatMGA(p.priceMGA)}
                  {p.basePriceCNY && (
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (¥{p.basePriceCNY})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {p.stock !== undefined ? (
                    <span className={p.stock < 5 ? "text-red-500 font-semibold" : ""}>
                      {p.stock}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}>
                    {STATUS_FR[p.status] ?? p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/fr/products/${p.slug}`}
                      target="_blank"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="Voir"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-gray-400 hover:text-amber-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
