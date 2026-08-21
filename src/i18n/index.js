import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "../locales/en/translation.json";
import arTranslation from "../locales/ar/translation.json";

export const LANGUAGES = ["en", "ar"];
export const LANGUAGE_STORAGE_KEY = "language";

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch (e) {
    /* localStorage unavailable */
  }
  return "en";
}

function applyDirection(lng) {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
}

const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    ar: { translation: arTranslation },
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

applyDirection(initialLanguage);

i18n.on("languageChanged", (lng) => {
  applyDirection(lng);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch (e) {
    /* localStorage unavailable */
  }
});

export function toggleLanguage() {
  const next = i18n.language === "ar" ? "en" : "ar";
  i18n.changeLanguage(next);
  return next;
}

export default i18n;
