import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn-secondary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        fontWeight: 600,
        backgroundColor: 'var(--color-surface-hover)',
        border: '1px solid var(--color-surface-border)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <span className="material-symbols-outlined !text-[18px]">
        language
      </span>
      {i18n.language === 'en' ? 'EN' : 'VI'}
    </button>
  );
}
