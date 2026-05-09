import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

/**
 * SEO Component
 * Dynamically updates document head based on current language
 */
const SEO = ({ title: customTitle, description: customDescription }) => {
  const { t, i18n } = useTranslation();

  const title = customTitle || t('common.seo.title');
  const description = customDescription || t('common.seo.description');
  const keywords = t('common.seo.keywords');
  const siteUrl = 'https://hr.thanhnghiep.top/';
  const image = 'https://thanhnghiep.top/CVMatcher/thumb-hr-lite.jpeg';

  return (
    <Helmet key={i18n.language}>
      {/* HTML Lang attribute */}
      <html lang={i18n.language || 'vi'} />
      
      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="HR Lite" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
