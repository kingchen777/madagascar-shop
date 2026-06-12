"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type AdminLang, getT, type AdminTranslations } from "@/lib/adminI18n";

interface AdminLangCtx {
  lang: AdminLang;
  t: AdminTranslations;
  setLang: (l: AdminLang) => void;
}

const Ctx = createContext<AdminLangCtx>({
  lang: "fr",
  t: getT("fr"),
  setLang: () => {},
});

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("admin_lang") as AdminLang | null;
    if (saved === "fr" || saved === "en" || saved === "zh") setLangState(saved);
  }, []);

  function setLang(l: AdminLang) {
    setLangState(l);
    localStorage.setItem("admin_lang", l);
    document.cookie = `admin_lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return (
    <Ctx.Provider value={{ lang, t: getT(lang), setLang }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminLang() {
  return useContext(Ctx);
}
