import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "zh"],
  defaultLocale: "fr",
  localePrefix: "always",
});
