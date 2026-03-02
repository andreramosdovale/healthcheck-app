import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en";
import ptBR from "./locales/pt-BR";

const resources = {
  en: { translation: en },
  "pt-BR": { translation: ptBR },
};

const deviceLanguage = Localization.getLocales()[0]?.languageTag || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
