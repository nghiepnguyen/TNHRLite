import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enDashboard from './locales/en/dashboard.json';
import enJobs from './locales/en/jobs.json';
import enCandidates from './locales/en/candidates.json';
import enPipeline from './locales/en/pipeline.json';
import enMembers from './locales/en/members.json';
import enReports from './locales/en/reports.json';
import enSettings from './locales/en/settings.json';

import viCommon from './locales/vi/common.json';
import viLanding from './locales/vi/landing.json';
import viDashboard from './locales/vi/dashboard.json';
import viJobs from './locales/vi/jobs.json';
import viCandidates from './locales/vi/candidates.json';
import viPipeline from './locales/vi/pipeline.json';
import viMembers from './locales/vi/members.json';
import viReports from './locales/vi/reports.json';
import viSettings from './locales/vi/settings.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          ...enCommon,
          ...enLanding,
          ...enDashboard,
          ...enJobs,
          ...enCandidates,
          ...enPipeline,
          ...enMembers,
          ...enReports,
          ...enSettings,
        },
      },
      vi: {
        translation: {
          ...viCommon,
          ...viLanding,
          ...viDashboard,
          ...viJobs,
          ...viCandidates,
          ...viPipeline,
          ...viMembers,
          ...viReports,
          ...viSettings,
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
