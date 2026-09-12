import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { detectPortal, getPortalById } from '../lib/portals';
import { supabase } from '../lib/supabase';
import { PageSetting } from '../pages/studio/types';

export interface UsePageMetaProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  url?: string;
  type?: string;
  portalId?: string;
  keywords?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  categoryName?: string;
}

const getDefaultDescription = (portalId: string, portalName: string): string => {
  const lowerId = portalId.toLowerCase();

  if (lowerId.includes('jogja')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar Yogyakarta, Kota Jogja, Sleman, Bantul, Gunungkidul, Kulon Progo dan sekitarnya.';
  }
  if (lowerId.includes('aceh')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar Aceh, Banda Aceh, Lhokseumawe, Sabang, Langsa dan sekitarnya.';
  }
  if (lowerId.includes('sumut')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar Sumatera Utara, Medan, Deli Serdang, Binjai, Toba dan sekitarnya.';
  }
  if (lowerId.includes('jabar')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar Jawa Barat, Bandung, Bogor, Bekasi, Depok, Cirebon dan sekitarnya.';
  }
  if (lowerId.includes('jateng')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar Jawa Tengah, Semarang, Solo, Magelang, Banyumas, Pekalongan dan sekitarnya.';
  }
  if (lowerId.includes('jatim') && !lowerId.includes('yoiki')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar Jawa Timur, Surabaya, Malang, Sidoarjo, Gresik, Kediri dan sekitarnya.';
  }
  if (lowerId.includes('jakarta')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar DKI Jakarta, Jakarta Pusat, Selatan, Barat, Timur, Utara dan sekitarnya.';
  }
  if (lowerId.includes('bali')) {
    return 'Portal berita, informasi terkini, dan kabar daerah berimbang seputar Bali, Denpasar, Badung, Gianyar, Buleleng, Tabanan dan sekitarnya.';
  }
  if (lowerId === 'yoikijatim') {
    return 'Portal berita & informasi terkini seputar Surabaya, Malang, Banyuwangi, Madura, ekonomi, dan budaya Jawa Timur.';
  }
  if (lowerId === 'lumajangtalks') {
    return 'Portal berita & suara warga Lumajang, informasi terkini seputar Gunung Semeru, kuliner, dan komunitas lokal Lumajang.';
  }
  if (lowerId === 'gummah') {
    return 'Portal berita Islami terpercaya, kabar dinamika ummah, ekonomi syariah, ziswaf, oase multimedia, dan gaya hidup halal.';
  }
  if (lowerId === 'finance') {
    return 'Portal berita seputar ekonomi makro, investasi, perbankan, fintech, bursa, saham, aset kripto, serta informasi bisnis dan pengembangan UMKM.';
  }
  if (lowerId === 'gnext') {
    return 'Portal berita multimedia terkini, mendalam, independen, dan terpercaya dari Gnext News Network.';
  }
  if (lowerId.startsWith('lentera')) {
    return `Portal berita resmi, informasi terkini, dan kabar daerah berimbang dari ${portalName}.`;
  }
  return `Portal berita & informasi terdepan dari ${portalName}.`;
};

const getPortalFavicon = (portalId: string, path: string = ''): string => {
  const pLower = path.toLowerCase();
  if (portalId === 'finance' || pLower.startsWith('/finance')) {
    return '/favicon-finance.svg';
  }
  if (portalId === 'gnext' || pLower.startsWith('/news')) {
    return '/favicon-gnext.png';
  }
  if (portalId === 'yoikijatim' || pLower.startsWith('/yoikijatim')) {
    return '/favicon-yoiki.png';
  }
  if (portalId === 'lumajangtalks' || pLower.startsWith('/lumajangtalks')) {
    return '/favicon-lumajang.png';
  }
  if (portalId === 'gummah' || pLower.startsWith('/gummah') || pLower.startsWith('/ummah')) {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23059669" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="white" dominant-baseline="central" text-anchor="middle">G</text></svg>';
  }
  return '/favicon-lentera.svg';
};

export function usePageMeta({
  title,
  description,
  path,
  image,
  url,
  type = 'website',
  portalId,
  keywords,
  author,
  datePublished,
  dateModified,
  categoryName,
}: UsePageMetaProps = {}) {
  const [dbSetting, setDbSetting] = useState<PageSetting | null>(null);

  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');

  useEffect(() => {
    if (currentPath) {
      loadSetting(currentPath);
    }
  }, [currentPath]);

  const loadSetting = async (targetPath: string) => {
    try {
      const { data } = await supabase
        .from('web_settings')
        .select('*')
        .eq('path', targetPath)
        .maybeSingle();

      if (data) {
        setDbSetting(data);
      }
    } catch (err) {
      console.error('Failed to load SEO settings:', err);
    }
  };

  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const detected = detectPortal(hostname, currentPath);
  const activePortal = portalId ? getPortalById(portalId) : (detected || getPortalById('gnext'));

  const siteName = activePortal.name;
  const activePortalId = activePortal.id;

  // DB setting override should only apply to main corporate site or if specifically matched
  const isCorporateMain = activePortalId === 'gnext' && (!hostname || !hostname.startsWith('news.'));
  const isValidDbSetting = dbSetting && (isCorporateMain || dbSetting.portal_id === activePortalId);

  const defaultDesc = getDefaultDescription(activePortalId, siteName);
  const finalDescription = (isValidDbSetting ? dbSetting?.description : null) || description || defaultDesc;

  let rawTitle = (isValidDbSetting ? dbSetting?.title : null) || title || `${siteName} - Portal Berita & Informasi Terdepan`;
  let finalTitle = rawTitle;
  if (title && !rawTitle.includes(siteName) && !rawTitle.includes('|') && rawTitle !== title) {
    finalTitle = `${title} | ${siteName}`;
  }

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.gnextindonesia.site';

  // Calculate cleaner canonical URL mapped to correct subdomain or clean route (removing search params)
  let canonicalUrl = url || '';
  if (!canonicalUrl && typeof window !== 'undefined') {
    const cleanPathname = window.location.pathname;
    const isProdDomain = window.location.hostname.endsWith('gnextindonesia.site') || window.location.hostname.includes('run.app');
    
    let canonicalHost = window.location.hostname;
    
    if (isProdDomain) {
      const subdomainMap: Record<string, string> = {
        'finance': 'finance.gnextindonesia.site',
        'gummah': 'ummah.gnextindonesia.site',
        'yoikijatim': 'yoikijatim.gnextindonesia.site',
        'lumajangtalks': 'lumajangtalks.gnextindonesia.site',
        'gnext': 'www.gnextindonesia.site'
      };
      
      if (subdomainMap[activePortalId]) {
        canonicalHost = subdomainMap[activePortalId];
      }
    }
    
    // Clean redundant portal prefix if mapped to the respective subdomain
    let finalPath = cleanPathname;
    if (isProdDomain && activePortalId !== 'gnext') {
      const portalPrefixes = ['/finance', '/gummah', '/yoikijatim', '/lumajangtalks'];
      for (const prefix of portalPrefixes) {
        if (finalPath.startsWith(prefix)) {
          finalPath = finalPath.substring(prefix.length);
          break;
        }
      }
    }
    
    // Ensure starts with single /
    if (!finalPath.startsWith('/')) {
      finalPath = '/' + finalPath;
    }
    
    canonicalUrl = `${window.location.protocol}//${canonicalHost}${finalPath}`;
  } else if (!canonicalUrl) {
    canonicalUrl = `https://www.gnextindonesia.site${currentPath}`;
  }

  const currentUrl = url || canonicalUrl;

  const portalFallbackImage = activePortalId === 'yoikijatim'
    ? 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&h=630&q=80'
    : activePortalId === 'lumajangtalks'
    ? 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&h=630&q=80'
    : activePortalId === 'gummah'
    ? 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&h=630&q=80'
    : activePortalId.startsWith('lentera')
    ? 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&h=630&q=80'
    : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80';

  const defaultFallbackImage = portalFallbackImage;
  const rawImage = image || defaultFallbackImage;
  const absoluteImageUrl = rawImage.startsWith('http')
    ? rawImage
    : `${siteOrigin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  const favicon = getPortalFavicon(activePortalId, currentPath);
  const metaKeywords = keywords || `${siteName}, berita ${siteName}, portal berita daerah, gnext news, kabar terkini, berita indonesia`;
  const metaAuthor = author || siteName;

  // Generate JSON-LD Structured Data
  const getStructuredData = () => {
    const publisherLogoUrl = favicon.startsWith('http') ? favicon : `${siteOrigin}${favicon}`;
    
    if (type === 'article') {
      return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": currentUrl || siteOrigin
        },
        "headline": title || finalTitle,
        "image": [
          absoluteImageUrl
        ],
        "datePublished": datePublished || new Date().toISOString(),
        "dateModified": dateModified || datePublished || new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": metaAuthor
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": siteName,
          "logo": {
            "@type": "ImageObject",
            "url": publisherLogoUrl
          }
        },
        "description": finalDescription
      };
    }

    // Default WebSite & Organization structured data for index and category pages
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${siteOrigin}/#website`,
          "url": currentUrl || siteOrigin,
          "name": siteName,
          "description": finalDescription,
          "publisher": {
            "@id": `${siteOrigin}/#organization`
          }
        },
        {
          "@type": "NewsMediaOrganization",
          "@id": `${siteOrigin}/#organization`,
          "name": siteName,
          "url": currentUrl || siteOrigin,
          "logo": {
            "@type": "ImageObject",
            "url": publisherLogoUrl
          },
          "sameAs": [
            "https://twitter.com/gnextindonesia"
          ]
        }
      ]
    };
  };

  const PageMeta = () => (
    <Helmet>
      {/* Search Engine Meta */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={metaAuthor} />
      {activePortalId === 'finance' && (
        <meta name="google-site-verification" content="GGm3xEh1hv79_Y0ngEwqj3Z6tEi2d4syBZbXF9JjXY0" />
      )}
      <link rel="canonical" href={currentUrl} />
      <link rel="icon" type={favicon.endsWith('.png') ? 'image/png' : 'image/svg+xml'} href={favicon} />
      <link rel="apple-touch-icon" href={favicon} />
      <link rel="shortcut icon" href={favicon} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@gnextindonesia" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* Structured Data (JSON-LD) for Googlebot */}
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData())}
      </script>
    </Helmet>
  );

  return {
    PageMeta,
    finalTitle,
    finalDescription,
    currentUrl,
    absoluteImageUrl,
    favicon,
    siteName,
    activePortalId,
  };
}
