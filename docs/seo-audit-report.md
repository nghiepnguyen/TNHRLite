# SEO Audit Report: HR Lite

**Date:** 2026-06-12
**URL:** https://hr.thanhnghiep.top
**Site Type:** SaaS (Recruitment/ATS — Applicant Tracking System)
**Platform:** React 19 + Vite + Firebase Hosting
**Languages:** Vietnamese (primary), English (secondary)

---

## Executive Summary

HR Lite is a lean recruitment management SaaS running as a single-page application (SPA) on Firebase Hosting. The site has a solid security posture (comprehensive CSP, HTTPS enforced) and some SEO fundamentals in place (sitemap, robots.txt, dynamic title/meta tags). However, the SEO profile is significantly held back by four critical gaps: **no structured data**, **no hreflang implementation** despite being bilingual, **no per-page SEO differentiation** for internal pages, and **weak E-E-A-T content signals** (no blog, case studies, or author attribution).

---

## SEO Health Index

**Overall Score: 74 / 100** · **Health Status: Fair**

The score reflects a site with meaningful SEO issues that are actively limiting organic growth potential. The single largest score drag is the absence of structured data (critical), followed by missing hreflang and per-page optimization gaps.

| Category                  | Raw Score | Weight | Weighted Contribution |
| ------------------------- | --------- | ------ | --------------------- |
| Crawlability & Indexation | 73.0      | 30     | 21.90                 |
| Technical Foundations     | 86.0      | 25     | 21.50                 |
| On-Page Optimization      | 52.5      | 20     | 10.50                 |
| Content Quality & E-E-A-T | 70.5      | 15     | 10.58                 |
| Authority & Trust Signals | 96.8      | 10     | 9.68                  |
| **Total**                 |           |        | **74.15**             |

**What limits the score from being higher:** The absence of structured data alone deducts 20 points from On-Page (4 weighted points). Missing hreflang and the thin sitemap together deduct ~6.5 weighted points. These are fixable issues with high ROI.

**Explicit Limitations:** This score reflects SEO readiness based on code analysis and configuration audit. It does not reflect live crawl data, backlink profile, or Core Web Vitals field data (requires Search Console & PageSpeed Insights access). External factors (competition, algorithm updates) are not scored. Authority score is directional only.

---

## Findings

### 1. Crawlability & Indexation

#### F-01: Sitemap XML is severely sparse and stale
- **Category:** Crawlability & Indexation
- **Evidence:** `public/sitemap.xml` contains only 6 URLs (home, login, privacy-policy, terms-of-service, cookie-policy, contact-support). `lastmod` is hardcoded to `2026-05-11` across all entries. No image/video extensions. No hreflang annotations.
- **Severity:** High
- **Confidence:** High (directly observed)
- **Why It Matters:** Search engines use sitemaps as a crawl priority signal. A 6-URL sitemap for a multi-page SaaS suggests the site has little content worth indexing, harming crawl budget allocation and indexation speed.
- **Score Impact:** −10 (Crawlability & Indexation)
- **Recommendation:** Generate sitemap dynamically at build time to include all public pages. Add `<xhtml:link rel="alternate" hreflang="...">` annotations for en/vi language variants. Automate `lastmod` from git commit timestamps. Consider adding a `/features` or `/pricing` page if those exist publicly.

#### F-02: No hreflang implementation despite bilingual site
- **Category:** Crawlability & Indexation
- **Evidence:** No `<link rel="alternate" hreflang="...">` tags found in any page or sitemap. Site uses `i18next-browser-languagedetector` with localStorage caching — language is determined client-side only. No server-side content negotiation.
- **Severity:** High
- **Confidence:** High (directly observed)
- **Why It Matters:** Without hreflang, search engines may serve the wrong language version to users or treat en/vi pages as duplicate content rather than alternates. This directly impacts organic visibility in both Vietnamese and English search results.
- **Score Impact:** −10 (Crawlability & Indexation)
- **Recommendation:** Implement hreflang via `<link rel="alternate">` in the SEO component. Add `hreflang` annotations to sitemap. Consider URL-based language routing (e.g., `/en/...` and `/vi/...` or query parameter) for crawlable alternates.

#### F-03: All internal/dashboard pages are indexable
- **Category:** Crawlability & Indexation
- **Evidence:** No `noindex` meta tag or `X-Robots-Tag` header found on any page. App routing via `src/App.jsx` maps all dashboard paths under `/dashboard/w/:workspaceId/*` without any robots exclusion. `robots.txt` blocks `/dashboard/` which helps, but robots.txt is advisory — pages can still appear in search results if linked externally.
- **Severity:** Medium
- **Confidence:** Medium (no crawl log data to confirm if Google has actually indexed these pages; `robots.txt` blocks crawling but not indexing from external links)
- **Why It Matters:** If dashboard URLs appear in search results, they create a poor user experience (login walls) and dilute crawl budget on pages that have no SEO value.
- **Score Impact:** −2.5 (Crawlability & Indexation, 50% confidence modifier applied)
- **Recommendation:** Add `<meta name="robots" content="noindex, nofollow">` to all authenticated/dashboard routes. Consider an `X-Robots-Tag: noindex` header in firebase.json for `/dashboard/**` paths as a defense-in-depth measure.

#### F-04: Conflicting HTML lang attribute between index.html and SEO component
- **Category:** Crawlability & Indexation
- **Evidence:** `index.html` line 2 has `<html lang="en">` hardcoded. `SEO.jsx` line 22 dynamically sets `<html lang={i18n.language || 'vi'} />` via react-helmet-async. The initial render (before JS hydrates) will show `lang="en"`, while post-hydration it switches to `vi` for Vietnamese users.
- **Severity:** Low
- **Confidence:** High (directly observed)
- **Why It Matters:** Search engine crawlers may capture the initial `lang="en"` before JavaScript executes, causing language signals to be incorrect for the primarily Vietnamese audience. This is especially relevant for Google's rendering pipeline which may index the pre-hydration state.
- **Score Impact:** −2 (Crawlability & Indexation)
- **Recommendation:** Set `lang="vi"` as default in `index.html` to match the primary audience, or use a server-side detection mechanism. Alternatively, remove the hardcoded `lang` from index.html and rely solely on the SEO component.

#### F-05: SPA client-side rendering dependency
- **Category:** Crawlability & Indexation
- **Evidence:** The entire app is a React SPA rendered via `src/main.jsx`. All routing is client-side via `react-router-dom`. Firebase hosting rewrites all requests to `/index.html`. No server-side rendering (SSR) or static site generation (SSG) implemented.
- **Severity:** Medium
- **Confidence:** Medium (Google renders JavaScript, but rendering queue delays and inconsistent rendering are well-documented)
- **Why It Matters:** While Google can render JavaScript SPAs, the rendering is deferred to a second wave of crawling. This delays indexation of new content and can cause incomplete rendering of dynamic sections. Content injected via i18n is particularly vulnerable.
- **Score Impact:** −2.5 (Crawlability & Indexation, 50% confidence modifier applied)
- **Recommendation:** Monitor Google Search Console coverage reports for rendering issues. For critical landing pages, consider pre-rendering or implementing SSR via a Cloud Function. As a lighter alternative, ensure all critical content is in the initial HTML payload (not dependent on API calls for first paint).

---

### 2. Technical Foundations

#### F-06: No image optimization pipeline
- **Category:** Technical Foundations
- **Evidence:** `vite.config.js` contains no image optimization plugins (no `vite-plugin-imagemin`, `vite-imagetools`, or `@vitejs/plugin-legacy`). No `<img srcset>` or `<picture>` elements found. No WebP or AVIF format usage. Landing page uses decorative div mockups instead of actual screenshots — this is positive for performance but negative for demonstrating the product via images.
- **Severity:** Medium
- **Confidence:** High (directly observed)
- **Why It Matters:** Unoptimized images are the #1 contributor to poor LCP scores. Even though the landing page is light on real images, the dashboard avatar pattern (DiceBear + Google user photos) loads from external CDNs without any size optimization.
- **Score Impact:** −5 (Technical Foundations)
- **Recommendation:** Add a Vite image optimization plugin. For avatar images, request appropriate sizes from DiceBear (`?size=80`) and use `loading="lazy"` and `decoding="async"`. For the product screenshot on the landing page (currently decorative mockup), use a properly optimized real screenshot with WebP/AVIF formats and srcset.

#### F-07: No Cache-Control strategy in Firebase Hosting
- **Category:** Technical Foundations
- **Evidence:** `firebase.json` headers section contains security headers only — no `Cache-Control` directives. Static assets (JS bundles, CSS, fonts) will use Firebase defaults which may not be optimal for cache busting and long-term caching.
- **Severity:** Medium
- **Confidence:** Medium (Firebase CDN provides some default caching; exact behavior depends on file type)
- **Why It Matters:** Without explicit Cache-Control headers, returning visitors may not benefit from optimal browser caching, increasing load times and bandwidth usage. Conversely, updated assets may be cached too aggressively, causing stale content.
- **Score Impact:** −2.5 (Technical Foundations, 50% confidence modifier applied)
- **Recommendation:** Add Cache-Control headers in firebase.json for static assets: long max-age with fingerprint for `/assets/**` (Vite output), shorter cache for `/index.html`, and appropriate policies for fonts and images.

#### F-08: No service worker or offline strategy
- **Category:** Technical Foundations
- **Evidence:** No service worker registration found (`navigator.serviceWorker`). No PWA manifest. No workbox or vite-plugin-pwa in dependencies.
- **Severity:** Low
- **Confidence:** Medium (a service worker is not strictly required for SEO, but it contributes to perceived performance and Core Web Vitals)
- **Why It Matters:** While not a direct ranking factor, a service worker can significantly improve repeat-visit load times, which feeds into Core Web Vitals signals. For a SaaS product, this also improves user experience for the dashboard.
- **Score Impact:** −1.5 (Technical Foundations, 50% confidence modifier applied)
- **Recommendation:** Evaluate adding a lightweight service worker for static asset caching only (not API responses). Use `vite-plugin-pwa` for easy integration with the existing Vite build.

#### F-09: External CDN font loading without font-display strategy
- **Category:** Technical Foundations
- **Evidence:** `index.html` loads Google Fonts (Be Vietnam Pro, Outfit, Material Symbols Outlined) via `<link>` tags without `display=swap` in the URL, though these fonts do have `display=swap` by default from Google Fonts. The `preconnect` hints are present (good). However, Material Symbols Outlined loads the entire icon font regardless of which icons are used.
- **Severity:** Low
- **Confidence:** High (directly observed)
- **Why It Matters:** Web fonts can block text rendering. While Google Fonts defaults to `display=swap`, the Material Symbols font is a large download for a limited set of used icons. This can contribute to layout shifts and delayed text rendering.
- **Score Impact:** −2 (Technical Foundations)
- **Recommendation:** Add explicit `&display=swap` to all Google Fonts URLs. Consider subsetting Material Symbols to only the icons actually used, or switch to an SVG icon library (like `lucide-react` already in the project's tech stack per guidelines).

#### F-10: External DiceBear CDN with no caching
- **Category:** Technical Foundations
- **Evidence:** Landing Page line 118: `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />`. The URL pins a specific API version (7.x) but no `cache-control` or `etag` headers are controllable. DashboardLayout also loads user avatars from external sources.
- **Severity:** Low
- **Confidence:** High (directly observed)
- **Why It Matters:** External image requests add DNS lookups, TLS negotiation, and potential latency to page load. While DiceBear serves SVGs (small), the dependency on an external service creates a point of failure for page rendering.
- **Score Impact:** −2 (Technical Foundations)
- **Recommendation:** For the landing page mockup avatar, bundle a static SVG inline. For dynamic user avatars, use Firebase Storage with a local fallback. If DiceBear must remain, add `crossorigin="anonymous"` and consider preconnecting the origin.

---

### 3. On-Page Optimization

#### F-11: NO structured data / schema.org implementation (CRITICAL)
- **Category:** On-Page Optimization
- **Evidence:** Zero instances of `application/ld+json`, `itemscope`/`itemtype`, or Schema.org markup found across the entire codebase. This is a SaaS product with no `Organization`, `SoftwareApplication`, `WebApplication`, or `FAQPage` schema.
- **Severity:** Critical
- **Confidence:** High (directly observed)
- **Why It Matters:** Structured data is the primary mechanism for achieving rich results (sitelinks, search box, product carousel, FAQ accordions). For a SaaS product, `SoftwareApplication` schema can trigger review stars, pricing displays, and application category badges in search results. The FAQ section on the landing page is ideal for `FAQPage` schema which can generate expandable Q&A in SERPs, increasing CTR and real estate.
- **Score Impact:** −20 (On-Page Optimization)
- **Recommendation:** Implement JSON-LD structured data as a high priority:
  - `Organization` schema on every page (name, URL, logo, sameAs social links)
  - `SoftwareApplication` schema on the landing page (name, description, operatingSystem, applicationCategory: "RecruitmentSoftware", offers with pricing)
  - `FAQPage` schema wrapping the FAQ section questions and answers
  - `WebSite` schema with `SearchAction` for sitelinks searchbox
  - `BreadcrumbList` schema on legal pages and any hierarchical content pages

#### F-12: No per-page unique SEO for internal/dashboard pages
- **Category:** On-Page Optimization
- **Evidence:** `SEO.jsx` uses a single global fallback (`t('common.seo.title')` and `t('common.seo.description')`) for every page that doesn't pass custom props. Dashboard pages (Jobs, Candidates, Pipeline, Reports, Settings, etc.) do NOT pass custom title or description props. Only LegalLayout and LandingPage pass custom SEO data.
- **Severity:** High
- **Confidence:** High (directly observed)
- **Why It Matters:** When Google indexes these pages (even if they're behind auth), every dashboard page will have the identical title "HR Lite | Lean Recruitment Management" and the same meta description. This creates massive duplicate meta data issues and prevents any internal page from being distinguishable in search results.
- **Score Impact:** −10 (On-Page Optimization)
- **Recommendation:** Add unique title and description to every page that might be public-facing. At minimum, add `noindex` to all dashboard pages. For pages that might be useful landing pages (e.g., a public job listing page), implement unique, keyword-aligned SEO metadata.

#### F-53: Dashboard pages inherit global SEO default
- **Category:** On-Page Optimization
- **Evidence:** In `App.jsx`, DashboardLayout routes (Jobs, Candidates, Pipeline, etc.) render within `<ProtectedRoute>` but the parent `DashboardLayout` component does not wrap them with a custom `<SEO />` override. They inherit the global `<SEO />` from `App.jsx` line 99.
- **Severity:** Medium
- **Confidence:** High (directly observed)
- **Why It Matters:** Even if these pages are eventually given unique SEO or marked noindex, currently they all broadcast the same title/description, confusing crawlers.
- **Score Impact:** −5 (On-Page Optimization)
- **Recommendation:** Add a `<SEO title="..." description="..." noindex />` wrapper in DashboardLayout that marks all dashboard sub-routes as noindex and provides a unique (but generic) title per section.

#### F-14: Minimal lazy loading of images
- **Category:** On-Page Optimization
- **Evidence:** Only ONE instance of `loading="lazy"` found: in `DashboardLayout.jsx` for the user avatar. No `loading="lazy"` on LandingPage hero image, no `decoding="async"`, no `fetchpriority` hints on critical images. The landing page uses primarily div-based mockups rather than images, which avoids the issue but also misses an opportunity to showcase the real product.
- **Severity:** Medium
- **Confidence:** High (directly observed)
- **Why It Matters:** While the landing page is light on real images, the pattern doesn't scale. Any future blog, case study, or screenshot-heavy page will have suboptimal loading behavior without a lazy loading strategy.
- **Score Impact:** −5 (On-Page Optimization)
- **Recommendation:** Add `loading="lazy"` and `decoding="async"` to all non-critical images. For the hero/first-paint image, add `fetchpriority="high"`. Create a reusable `<OptimizedImage>` component that enforces these attributes.

#### F-15: No breadcrumb navigation
- **Category:** On-Page Optimization
- **Evidence:** No breadcrumb components found. `App.jsx` routing is flat (no nested breadcrumb-aware structure). Legal pages and landing page have no breadcrumb trail.
- **Severity:** Low
- **Confidence:** High (directly observed)
- **Why It Matters:** Breadcrumbs provide both UX benefit and SEO signals (internal link structure, hierarchy clarity). They can also trigger breadcrumb rich results in SERPs when combined with `BreadcrumbList` schema.
- **Score Impact:** −3 (On-Page Optimization)
- **Recommendation:** Implement a breadcrumb component, especially for legal pages (Home > Privacy Policy) and any future content pages. Combine with `BreadcrumbList` schema.

#### F-16: Landing page mockup has no real product screenshots
- **Category:** On-Page Optimization
- **Evidence:** LandingPage.jsx uses CSS/div-based visual mockups to represent the dashboard (lines 51-135). No `<img>` element shows the actual HR Lite product. The only `<img>` on the page is the DiceBear avatar.
- **Severity:** Medium
- **Confidence:** Medium (the mockup approach has performance benefits; the issue is about missed SEO opportunity for image search and product demonstration)
- **Why It Matters:** Product screenshots with descriptive alt text can rank in Google Image Search, driving additional traffic. They also provide visual proof that builds trust and conversion. The current mockup approach trades image SEO entirely for performance.
- **Score Impact:** −2.5 (On-Page Optimization, 50% confidence modifier applied)
- **Recommendation:** Add at least one real, optimized product screenshot to the landing page with descriptive alt text (e.g., "HR Lite recruitment dashboard showing job pipeline and candidate matching"). Use `<picture>` with WebP and fallback. Keep the decorative mockup but supplement with a real image.

#### F-17: OG image from external domain without dimension hints
- **Category:** On-Page Optimization
- **Evidence:** `SEO.jsx` line 17: `const image = 'https://thanhnghiep.top/CVMatcher/thumb-hr-lite.jpeg'`. No `og:image:width`, `og:image:height`, or `og:image:type` meta tags.
- **Severity:** Low
- **Confidence:** High (directly observed)
- **Why It Matters:** Social platforms (Facebook, LinkedIn, Twitter) use `og:image:width` and `og:image:height` to instantly render preview cards. Without them, the image must be downloaded first, delaying preview generation. The image is also served from a different domain (`thanhnghiep.top` vs `hr.thanhnghiep.top`).
- **Score Impact:** −2 (On-Page Optimization)
- **Recommendation:** Add `og:image:width`, `og:image:height`, `og:image:type`, and `og:image:alt` meta tags. Host the OG image on the same domain (`hr.thanhnghiep.top`) to avoid cross-origin social crawler issues.

---

### 4. Content Quality & E-E-A-T

#### F-18: No blog, case studies, or testimonials
- **Category:** Content Quality & E-E-A-T
- **Evidence:** No `/blog` route in App.jsx. No content directory or markdown files for articles. No testimonial section on landing page. No case study pages.
- **Severity:** High
- **Confidence:** High (directly observed)
- **Why It Matters:** Content is the primary mechanism for demonstrating Expertise, Authoritativeness, and Trustworthiness (E-E-A-T). A SaaS product without any educational content, customer success stories, or thought leadership has almost zero topical authority signals. This severely limits the range of keywords the site can rank for.
- **Score Impact:** −10 (Content Quality & E-E-A-T)
- **Recommendation:** Create a blog section with recruitment/HR industry content. Add customer testimonials to the landing page. Develop 2-3 case studies showing before/after recruitment metrics. Even 5-10 high-quality articles can significantly improve topical authority.

#### F-19: No author attribution
- **Category:** Content Quality & E-E-A-T
- **Evidence:** No author bylines, no author pages, no `article:author` meta tags, no author schema. The legal pages and landing page content have no attributed authorship.
- **Severity:** Medium
- **Confidence:** High (directly observed)
- **Why It Matters:** Author attribution is a key E-E-A-T signal, especially for YMYL-adjacent topics like employment/recruitment. Google's Quality Rater Guidelines emphasize clear authorship.
- **Score Impact:** −5 (Content Quality & E-E-A-T)
- **Recommendation:** Add author attribution to blog posts and content pages. Create an author schema type. For the company itself, ensure the Organization schema includes founder/team information.

#### F-20: No "About Us" page
- **Category:** Content Quality & E-E-A-T
- **Evidence:** No `/about` route in App.jsx. No team or company information page exists.
- **Severity:** Medium
- **Confidence:** High (directly observed)
- **Why It Matters:** An About page is a baseline trust signal. It's where Google looks for information about who is behind the website. For a SaaS, this is where you demonstrate your team's expertise in the recruitment domain.
- **Score Impact:** −5 (Content Quality & E-E-A-T)
- **Recommendation:** Create an About/Team page with company mission, team bios, and recruitment domain expertise highlights. Link it from footer.

#### F-21: Legal pages only in Vietnamese
- **Category:** Content Quality & E-E-A-T
- **Evidence:** `PrivacyPolicy.jsx`, `TermsOfService.jsx`, and `CookiePolicy.jsx` contain only Vietnamese text hardcoded in the components. The SEO component is used with Vietnamese titles/descriptions. No i18n integration for legal content.
- **Severity:** Medium
- **Confidence:** Medium (if the primary audience is Vietnamese-speaking, this may be acceptable; but the site also supports English UI)
- **Why It Matters:** Users switching to English see an English UI but Vietnamese legal terms. This is a trust inconsistency. For global organic visibility, English legal pages would support ranking in English-language searches.
- **Score Impact:** −2.5 (Content Quality & E-E-A-T, 50% confidence modifier applied)
- **Recommendation:** Extract legal content into i18n translation files (landing.json or a new legal.json) and render based on current language. Or, if the business only operates in Vietnam, remove the English language option to avoid confusion.

#### F-22: No company registration or physical address
- **Category:** Content Quality & E-E-A-T
- **Evidence:** Privacy Policy mentions contact email `admin@thanhnghiep.top` and website `hr-lite.com` but no physical address, registration number, or tax ID. Footer shows "© 2024 HR Lite. Bảo lưu mọi quyền." without company entity name.
- **Severity:** Medium
- **Confidence:** High (directly observed)
- **Why It Matters:** Transparent business information is a trust signal for both users and search engines. Missing company details can affect E-E-A-T evaluation, especially for a product handling sensitive recruitment data.
- **Score Impact:** −5 (Content Quality & E-E-A-T)
- **Recommendation:** Add company legal name, registration number, and physical address to the Privacy Policy and footer. Consider a dedicated "Legal Notice" or "Impressum" section if operating in jurisdictions where required.

#### F-23: Contact email uses non-product domain
- **Category:** Content Quality & E-E-A-T
- **Evidence:** `PrivacyPolicy.jsx` line 60: `admin@thanhnghiep.top` — uses a personal/portfolio domain rather than the product domain (`hr-lite.com` or `hr.thanhnghiep.top`).
- **Severity:** Low
- **Confidence:** High (directly observed)
- **Why It Matters:** Inconsistent domains between the product URL and contact email create a slight trust deficit. Users and search evaluators may question whether this is a legitimate business entity.
- **Score Impact:** −2 (Content Quality & E-E-A-T)
- **Recommendation:** Set up email on the product domain (e.g., `contact@hr-lite.com` or `support@hr.thanhnghiep.top`) and update all legal pages.

---

### 5. Authority & Trust Signals

#### F-24: Subdomain rather than dedicated product domain
- **Category:** Authority & Trust Signals
- **Evidence:** The product lives at `hr.thanhnghiep.top` while Privacy Policy references `hr-lite.com`. The `hr-lite.com` domain does not appear to be the primary hosting target according to firebase.json configuration.
- **Severity:** Medium
- **Confidence:** Medium (subdomains share some authority with the root domain; but a dedicated domain is stronger for branding and link equity consolidation)
- **Why It Matters:** A dedicated domain (`hr-lite.com`) is easier to build independent domain authority for. Subdomains are sometimes treated as separate entities by Google, meaning link building to the subdomain may not fully benefit the root domain and vice versa.
- **Score Impact:** −2.5 (Authority & Trust Signals, 50% confidence modifier applied)
- **Recommendation:** If `hr-lite.com` is owned, migrate the primary hosting to that domain and set up 301 redirects from `hr.thanhnghiep.top`. If staying on the subdomain, remove references to `hr-lite.com` to avoid confusion.

#### F-25: Backlink profile unknown
- **Category:** Authority & Trust Signals
- **Evidence:** No external backlink tools were run. This audit is based on code analysis only. No Search Console or third-party backlink data available.
- **Severity:** Low
- **Confidence:** Low (no data available — attribution is directional only)
- **Why It Matters:** Domain authority is a major ranking factor. Without backlink data, we cannot assess whether the site has sufficient authority to compete for recruitment-related keywords.
- **Score Impact:** −0.75 (Authority & Trust Signals, 25% confidence modifier applied)
- **Recommendation:** Connect Google Search Console and review the Links report. Run a backlink audit using Ahrefs, Semrush, or similar. Identify link-building opportunities in the HR/recruitment tech space.

---

## Prioritized Action Plan

### Critical Blockers (Address Immediately)

| # | Finding | Score Recovery |
|---|---------|---------------|
| F-11 | No structured data / Schema.org | Up to +4 weighted points |
| F-02 | No hreflang implementation | Up to +3 weighted points |

1. **Implement JSON-LD structured data** — `Organization`, `SoftwareApplication`, `FAQPage`, and `WebSite` schemas. This is the highest-impact single change. Expected to add ~4 points to the weighted score and enable rich results.
2. **Add hreflang annotations** — Update the SEO component to emit `<link rel="alternate" hreflang="vi">` and `hreflang="en"` tags. Update the sitemap with `xhtml:link` annotations. Expected recovery: ~3 weighted points.

### High-Impact Improvements

| # | Finding | Score Recovery |
|---|---------|---------------|
| F-01 | Sitemap sparse/stale | Up to +3 weighted points |
| F-12 | No per-page unique SEO | Up to +2 weighted points |
| F-18 | No blog/case studies | Up to +1.5 weighted points |

3. **Auto-generate sitemap** with all public pages, hreflang, and dynamic `lastmod`.
4. **Add unique titles/descriptions** to all pages that are intentionally public (or add `noindex` to those that aren't).
5. **Launch a blog** with 5-10 recruitment industry articles. Add testimonials section to landing page.

### Quick Wins (Easy, Measurable Impact)

| # | Finding | Score Recovery |
|---|---------|---------------|
| F-04 | Conflicting lang attribute | ~0.6 weighted points |
| F-17 | OG image dimension hints | ~0.4 weighted points |
| F-23 | Contact email domain | ~0.3 weighted points |
| F-03 | Dashboard pages indexable | ~0.75 weighted points |
| F-10 | DiceBear CDN caching | ~0.5 weighted points |

6. Fix `lang` attribute in `index.html` to `vi`.
7. Add `og:image:width`, `og:image:height`, `og:image:type` to SEO component.
8. Set up product-domain email (e.g., `support@hr-lite.com`).
9. Add `noindex` meta to all authenticated routes.
10. Cache DiceBear responses or bundle avatars locally.

### Longer-Term Opportunities

| # | Finding |
|---|---------|
| F-05 | SPA rendering — evaluate SSR/prerendering |
| F-06 | Image optimization pipeline (WebP, srcset) |
| F-07 | Cache-Control headers in hosting config |
| F-19 | Author attribution for content |
| F-20 | About Us page |
| F-24 | Migrate to dedicated product domain |
| F-25 | Build backlink profile |

---

## Appendix: Tool-Independent Verification

All findings above are based on direct source code inspection. The following external tools/processes are recommended for validation and ongoing monitoring:

1. **Google Search Console** — Verify sitemap submission status, index coverage, Core Web Vitals field data, and any manual actions.
2. **PageSpeed Insights** — Run for both mobile and desktop on key pages (Landing, Login) to establish LCP/INP/CLS baselines.
3. **Schema.org Validator** — Test structured data implementation after deployment.
4. **Ahrefs/Semrush** — Backlink audit and keyword gap analysis against recruitment SaaS competitors.
5. **Google Rich Results Test** — Verify FAQ schema and SoftwareApplication schema trigger rich results eligibility.

---

*Report generated on 2026-06-12 via codebase analysis. No live crawl or external tool data was used. Re-audit recommended after implementing Critical Blockers.*