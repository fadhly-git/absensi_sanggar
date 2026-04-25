import { Head, usePage } from '@inertiajs/react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  structuredData?: object | object[];
}

interface SiteSettings {
  siteName: string;
  siteUrl: string;
  defaultOgImage: string;
  twitterHandle?: string;
  fbAppId?: string;
}

interface SeoPageProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'Ngesti Laras Budaya',
  siteUrl: 'https://ngelaras.my.id',
  defaultOgImage: '/img/og-default.jpg',
  twitterHandle: '@ngestilaras',
};

export default function SEOHead({
  title,
  description,
  keywords = 'sanggar tari, ngesti laras budaya, ngelaras, tari tradisional, meteseh, boja, kendal, seni budaya, tari jawa, sanggar tari kendal',
  canonical,
  ogImage,
  ogType,
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  structuredData,
}: SEOProps = {}) {
  const settings = defaultSettings;

  // Read SEO props from server (set by controller/route)
  const { seo: serverSeo } = usePage<{ seo?: SeoPageProps }>().props;

  // Merge: explicit props override server props
  const resolvedTitle = title ?? serverSeo?.title ?? settings.siteName;
  const resolvedDescription = description ?? serverSeo?.description ?? '';
  const resolvedImage = ogImage ?? serverSeo?.image ?? settings.defaultOgImage;
  const resolvedType = ogType ?? (serverSeo?.type as SEOProps['ogType']) ?? 'website';
  const url = canonical ?? serverSeo?.url ?? (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : settings.siteUrl);

  const fullTitle = resolvedTitle.includes(settings.siteName) ? resolvedTitle : `${resolvedTitle} | ${settings.siteName}`;
  const fullImageUrl = resolvedImage.startsWith('http') ? resolvedImage : settings.siteUrl + resolvedImage;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author || settings.siteName} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}
      {!noindex && <meta name="googlebot" content="index, follow" />}
      {!noindex && <meta name="bingbot" content="index, follow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={resolvedType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={settings.siteName} />
      <meta property="og:locale" content="id_ID" />
      {settings.fbAppId && <meta property="fb:app_id" content={settings.fbAppId} />}

      {/* Article specific */}
      {resolvedType === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {resolvedType === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {resolvedType === 'article' && author && <meta property="article:author" content={author} />}
      {resolvedType === 'article' && <meta property="article:section" content="Seni Budaya" />}
      {resolvedType === 'article' && <meta property="article:tag" content="Tari Tradisional" />}
      {resolvedType === 'article' && <meta property="article:tag" content="Ngesti Laras Budaya" />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      {settings.twitterHandle && <meta name="twitter:site" content={settings.twitterHandle} />}
      {settings.twitterHandle && <meta name="twitter:creator" content={settings.twitterHandle} />}

      {/* Geo Tags - Penting untuk Local SEO */}
      <meta name="geo.region" content="ID-JT" />
      <meta name="geo.placename" content="Meteseh, Boja, Kendal" />
      <meta name="geo.position" content="-7.0648838;110.4541618" />
      <meta name="ICBM" content="-7.0648838;110.4541618" />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Language */}
      <meta httpEquiv="content-language" content="id" />
      <link rel="alternate" hrefLang="id" href={url} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(structuredData) ? structuredData : [structuredData])}
        </script>
      )}
    </Head>
  );
}
