"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { MapPin, Plus, Trash2, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

const STORAGE_KEY = "madashop_addresses";

function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Address[]) : [];
  } catch {
    return [];
  }
}

function saveAddresses(list: Address[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const EMPTY_FORM = { name: "", phone: "", address: "", city: "Antananarivo" };

export default function AddressesPage() {
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace(`/${locale}/account/login`);
  }, [user, loading, locale, router]);

  useEffect(() => {
    setAddresses(loadAddresses());
  }, []);

  if (loading || !user) return null;

  function validate() {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.name.trim()) e.name = "Requis";
    if (!form.phone.trim()) e.phone = "Requis";
    if (!form.address.trim()) e.address = "Requis";
    if (!form.city.trim()) e.city = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    const next: Address = {
      id: `addr-${Date.now()}`,
      ...form,
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, next];
    setAddresses(updated);
    saveAddresses(updated);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete(id: string) {
    const updated = addresses.filter((a) => a.id !== id);
    // If we deleted the default, make first remaining the default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0] = { ...updated[0], isDefault: true };
    }
    setAddresses(updated);
    saveAddresses(updated);
  }

  function handleSetDefault(id: string) {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    saveAddresses(updated);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href={`/${locale}/account`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Mon compte
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mes adresses</h1>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" /> Enregistré
          </span>
        )}
      </div>

      {/* Address list */}
      <div className="space-y-3 mb-4">
        {addresses.length === 0 && !showForm && (
          <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-400">
            <MapPin className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">Aucune adresse enregistrée</p>
          </div>
        )}

        {addresses.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-4 ${a.isDefault ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                  {a.isDefault && (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Par défaut
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{a.phone}</p>
                <p className="text-sm text-gray-600">{a.address}</p>
                <p className="text-sm text-gray-600">{a.city}, Madagascar</p>
              </div>

              <div className="flex gap-2">
                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    className="text-xs text-amber-600 hover:underline"
                  >
                    Par défaut
                  </button>
                )}
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Nouvelle adresse</h2>
          {(
            [
              { key: "name", label: "Nom complet", placeholder: "Jean Rakoto" },
              { key: "phone", label: "Téléphone", placeholder: "034 XX XX XX" },
              { key: "address", label: "Adresse", placeholder: "Lot II J 123, Ankorondrano" },
              { key: "city", label: "Ville", placeholder: "Antananarivo" },
            ] as const
          ).map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100 ${errors[key] ? "border-red-400" : "border-gray-300"}`}
              />
              {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
            </div>
          ))}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              Enregistrer
            </button>
            <button
              onClick={() => { setShowForm(false); setErrors({}); }}
              className="rounded-xl border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-5 py-3 text-sm font-medium text-gray-500 hover:border-amber-400 hover:text-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter une adresse
        </button>
      )}
    </main>
  );
}
