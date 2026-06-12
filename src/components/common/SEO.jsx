import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

/**
 * SEO Component
 * Dynamically updates document head based on current language.
 * Provides JSON-LD structured data, hreflang, OG tags, and per-page overrides.
 *
 * @param {object}  props
 * @param {string}  [props.title]         Custom page title
 * @param {string}  [props.description]   Custom meta description
 * @param {string}  [props.image]         Custom OG/Twitter image (defaults to product thumbnail)
 * @param {boolean} [props.noindex]       If true, adds noindex, nofollow robots meta
 */
const SEO = ({ title: customTitle, description: customDescription, image: customImage, noindex = false }) => {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language || 'vi';
  const siteUrl = 'https://recuiter.cvfit.pro';
  const canonical = `${siteUrl}${window.location.pathname}`;

  const title = customTitle || t('common.seo.title');
  const description = customDescription || t('common.seo.description');
  const keywords = t('common.seo.keywords');
  const image = customImage || 'https://data.cvfit.pro/img/hr-lite.jpeg';

  // Alternate language URLs
  const enAlternate = currentLang === 'en' ? canonical : `${siteUrl}${window.location.pathname}?lang=en`;
  const viAlternate = currentLang === 'vi' ? canonical : `${siteUrl}${window.location.pathname}?lang=vi`;

  // ---- JSON-LD Structured Data ----
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HR Lite',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    description: t('common.seo.description'),
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'admin@cvfit.pro',
      contactType: 'customer support',
    },
  };

  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HR Lite',
    applicationCategory: 'RecruitmentSoftware',
    operatingSystem: 'Web',
    description: t('common.seo.description'),
    url: siteUrl,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND',
      description: 'Free plan available with Pro and Team upgrades',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HR Lite',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/dashboard?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (() => {
      try {
        const faqData = t('landing.faq.questions', { returnObjects: true });
        if (Array.isArray(faqData)) {
          return faqData.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.a,
            },
          }));
        }
      } catch (_) { /* translation may not be loaded yet */ }
      return [];
    })(),
  };

  const isHomePage = window.location.pathname === '/';
  const jsonLd = [
    organizationSchema,
    websiteSchema,
    ...(isHomePage ? [softwareAppSchema, faqSchema] : []),
  ];

  return (
    <Helmet key={currentLang}>
      {/* HTML Lang attribute */}
      <html lang={currentLang} />

      {/* Standard Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="HR Lite" />
      <link rel="canonical" href={canonical} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Hreflang */}
      <link rel="alternate" hrefLang="vi" href={viAlternate} />
      <link rel="alternate" hrefLang="en" href={enAlternate} />
      <link rel="alternate" hrefLang="x-default" href={viAlternate} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:locale" content={currentLang === 'en' ? 'en_US' : 'vi_VN'} />
      <meta property="og:site_name" content="HR Lite" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;