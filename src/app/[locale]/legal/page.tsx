import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales | MadaShop" };

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mentions légales</h1>

      <div className="prose prose-sm prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Éditeur du site</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            MadaShop est une plateforme de commerce en ligne basée à Madagascar, facilitant
            l&apos;achat de produits depuis la Chine pour les résidents malgaches.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-2">
            Contact : <a href="mailto:contact@madashop.mg" className="text-amber-600 hover:underline">contact@madashop.mg</a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Activité</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            MadaShop propose deux types de services :
          </p>
          <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Vente directe de produits stockés à Madagascar</li>
            <li>Service de commande groupée (代购) depuis les plateformes chinoises (Taobao, 1688, Tmall, Pinduoduo, JD.com)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Conditions de vente</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Toute commande est soumise à la disponibilité du produit et au paiement d&apos;un acompte.
            Les délais de livraison pour les commandes agent sont de 3 à 6 semaines à compter de la
            confirmation de la commande. MadaShop ne peut être tenu responsable de retards liés à
            la douane ou à des événements imprévisibles.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Propriété intellectuelle</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            L&apos;ensemble du contenu de ce site (textes, images, logos) est la propriété de MadaShop
            ou de ses fournisseurs et est protégé par le droit malgache de la propriété intellectuelle.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Hébergement</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ce site est hébergé par Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, USA.
          </p>
        </section>
      </div>
    </main>
  );
}
