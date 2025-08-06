import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'ru',

    // Add this line to explicitly define supported languages
    supportedLngs: ['en', 'ru'],
   /*  supportedLngs: ['en', 'ru', 'kz'], */

    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: {
        common: {
          header: {
            language: 'Language',
            greeting: 'Hello, World!',
          },
        },
      },
      ru: {
        common: {
          header: {
            language: 'Язык',
            greeting: 'Привет, Мир!',
          },
        },
      },
      // kz: {
      //   common: {
      //     header: {
      //       language: 'Тіл',
      //       greeting: 'Сәлем, Әлем!',
      //     },
      //   },
      // },
    },
  });

export default i18n;
