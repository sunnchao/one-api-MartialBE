import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh_CN from './locales/zh_CN.json';
import en_US from './locales/en_US.json';

const resources = {
  zh_CN: {
    translation: zh_CN
  },
  en_US: {
    translation: en_US
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh_CN',
    fallbackLng: 'en_US',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
