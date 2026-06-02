"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Plus, Trash2, ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  line1: string;
  note: string | null;
  isDefault: boolean;
}

const EMPTY_FORM = { fullName: "", phone: "", region: "Antananarivo", line1: "", note: "" };

export default function AddressesPage() {
  const ta = useTranslations("account");
  const tCommon = useTranslations("common");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/${locale}/account/login`);
  }, [user, authLoading, locale, router]);

  const fetchAddresses = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json() as { addresses: Address[] };
        setAddresses(data.addresses);
      }
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user, fetchAddresses]);

  if (authLoading || !user) return null;

  function validate() {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.fullName.trim()) e.fullName = tCheckout("required_field");
    if (!form.phone.trim()) e.phone = tCheckout("required_field");
    if (!form.region.trim()) e.region = tCheckout("required_field");
    if (!form.line1.trim()) e.line1 = tCheckout("required_field");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleAdd() {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        setShowForm(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        await fetchAddresses();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    await fetchAddresses();
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/user/addresses/${id}`, { method: "PATCH" });
    await fetchAddresses();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href={`/${locale}/account`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {ta("back")}
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{ta("my_addresses")}</h1>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" /> {ta("saved")}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {fetching ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-400">
            <MapPin className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">{ta("no_addresses")}</p>
          </div>
        ) : (
          addresses.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-4 ${a.isDefault ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{a.fullName}</p>
                    {a.isDefault && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {ta("default_badge")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{a.phone}</p>
                  <p className="text-sm text-gray-600">{a.line1}</p>
                  <p className="text-sm text-gray-600">{a.region}, Madagascar</p>
                  {a.note && <p className="text-xs text-gray-400 mt-0.5">{a.note}</p>}
                </div>
                <div className="flex gap-2 items-center">
                  {!a.isDefault && (
                    <button
                      onClick={() => handleSetDefault(a.id)}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      {ta("set_default")}
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
          ))
        )}
      </div>

      {showForm ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">{ta("new_address")}</h2>
          {(
            [
              { key: "fullName" as const, label: tCheckout("field_name"), placeholder: "Jean Rakoto" },
              { key: "phone" as const, label: tCheckout("field_phone"), placeholder: "034 XX XX XX" },
              { key: "line1" as const, label: tCheckout("field_address"), placeholder: "Lot II J 123, Ankorondrano" },
              { key: "region" as const, label: tCheckout("field_city"), placeholder: "Antananarivo" },
              { key: "note" as const, label: "Note (optionnel)", placeholder: "Ex: Porte bleue" },
            ]
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
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {tCommon("save")}
            </button>
            <button
              onClick={() => { setShowForm(false); setErrors({}); }}
              className="rounded-xl border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {tCommon("cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-5 py-3 text-sm font-medium text-gray-500 hover:border-amber-400 hover:text-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {ta("add_address")}
        </button>
      )}
    </main>
  );
}
