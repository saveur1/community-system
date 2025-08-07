import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Your manual translations
import translationEN from './locales/en.json'
import translationRW from './locales/rw.json'
import translationSW from './locales/sw.json'
import translationFR from './locales/fr.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'rw',
    resources: {
      en: { translation: translationEN },
      rw: { translation: translationRW },
      sw: { translation: translationSW },
      fr: { translation: translationFR },
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n