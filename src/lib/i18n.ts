import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const locales = routing.locales;
export type Locale = (typeof routing.locales)[number];
export const defaultLocale = routing.defaultLocale;

export function isValidLocale(locale: string): locale is Locale {
  return (routing.locales as readonly string[]).includes(locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !isValidLocale(locale)) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return {
    locale: locale as Locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
