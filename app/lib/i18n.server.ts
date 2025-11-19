import Backend from "i18next-fs-backend";
import { resolve } from "node:path";
import { RemixI18Next } from "remix-i18next/server";
import { readFile } from "node:fs/promises";

const localesPath = resolve("./public/locales");
const namespaces = ["common"];

export const i18n = new RemixI18Next({
  detection: {
    supportedLanguages: ["en", "es", "fr"],
    fallbackLanguage: "en"
  },
  i18next: {
    backend: {
      loadPath: `${localesPath}/{{lng}}/{{ns}}.json`
    },
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    ns: ["common"],
    supportedLngs: ["en", "es", "fr"]
  },
  backend: Backend
});

export async function getLocale(request: Request) {
  const locale = await i18n.getLocale(request);
  return locale ?? "en";
}

export async function getTranslations(locale: string) {
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      try {
        const file = resolve(localesPath, locale, `${ns}.json`);
        const data = await readFile(file, "utf-8");
        return [ns, JSON.parse(data)];
      } catch (error) {
        if (locale !== "en") {
          const fallback = resolve(localesPath, "en", `${ns}.json`);
          const data = await readFile(fallback, "utf-8");
          return [ns, JSON.parse(data)];
        }
        throw error;
      }
    })
  );

  return Object.fromEntries(entries);
}
