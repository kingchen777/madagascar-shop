import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité | MadaShop" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>

      <div className="prose prose-sm prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Données collectées</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Lors d&apos;une commande, nous collectons les informations nécessaires à son traitement :
            nom complet, numéro de téléphone, adresse e-mail et adresse de livraison. Ces données
            sont utilisées exclusivement pour le suivi et la livraison de votre commande.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Cookies et stockage local</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ce site utilise le stockage local (localStorage) de votre navigateur pour mémoriser
            le contenu de votre panier et vos adresses enregistrées. Aucun cookie publicitaire
            ou de tracking tiers n&apos;est utilisé.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Partage des données</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vos données personnelles ne sont jamais vendues ni cédées à des tiers à des fins
            commerciales. Elles peuvent être transmises à nos partenaires logistiques uniquement
            dans le cadre de la livraison de votre commande.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Sécurité</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vos données sont stockées de manière sécurisée sur l&apos;infrastructure Supabase
            (hébergée sur AWS). Les communications entre votre navigateur et nos serveurs sont
            chiffrées via HTTPS.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Vos droits</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Vous pouvez demander la consultation, la correction ou la suppression de vos données
            personnelles en nous contactant à{" "}
            <a href="mailto:contact@madashop.mg" className="text-amber-600 hover:underline">
              contact@madashop.mg
            </a>
            . Nous répondrons dans un délai de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-2">Mise à jour</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Cette politique peut être mise à jour à tout moment. La date de dernière modification
            est indiquée ci-dessous.
          </p>
          <p className="text-xs text-gray-400 mt-2">Dernière mise à jour : juin 2026</p>
        </section>
      </div>
    </main>
  );
}
