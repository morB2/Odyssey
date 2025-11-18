import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import he from "./locales/he.json";

i18n
  .use(LanguageDetector) // מזהה אוטומטית את השפה של המשתמש
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he }
    },
    fallbackLng: "en",    // אם השפה לא קיימת, נשתמש באנגלית
    interpolation: { escapeValue: false }
  });

export default i18n;
