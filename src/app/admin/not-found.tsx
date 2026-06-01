import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <PackageSearch className="h-14 w-14 text-gray-300 mb-5" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-sm font-semibold text-gray-700 mb-1">Page introuvable</p>
      <p className="text-xs text-gray-400 max-w-xs mb-6">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/admin"
        className="inline-flex h-9 items-center justify-center rounded-xl bg-amber-500 px-6 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
      >
        Tableau de bord
      </Link>
    </div>
  );
}
