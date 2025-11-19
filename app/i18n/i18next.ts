import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const i18nextClient = i18next.createInstance();

if (!i18nextClient.isInitialized) {
  void i18nextClient.use(initReactI18next).init({
    defaultNS: "common",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    ns: ["common"],
    supportedLngs: ["en", "es", "fr"]
  });
}
