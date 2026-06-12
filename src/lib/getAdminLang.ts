import { cookies } from "next/headers";
import type { AdminLang } from "./adminI18n";

export async function getAdminLang(): Promise<AdminLang> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("admin_lang")?.value;
  if (lang === "fr" || lang === "en" || lang === "zh") return lang;
  return "fr";
}
