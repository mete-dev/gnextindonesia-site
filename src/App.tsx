import ErrorBoundary from './components/ErrorBoundary';
import { StartupLoader } from './components/StartupLoader';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Work from './pages/Work';
import Platform from './pages/Platform';
import NewsPage from './pages/News';
import NewsDetail from './pages/NewsDetail';
import PrivacyPage from './pages/Privacy';
import YoikiJatimPage from './pages/YoikiJatim';
import LenteraPortalPage from './pages/LenteraPortal';
import { detectPortal, ALL_PORTALS, lenteraNetworks } from "./lib/portals";
import LumajangTalksPage from './pages/LumajangTalks';
import GUmmahPage from './pages/GUmmah';
import GnextFinancePage from './pages/GnextFinance';

import TermsPage from './pages/Terms';
import LoginStudio from './pages/LoginStudio';
import Register from './pages/Register';
import Studio from './pages/Studio';
import Sitemap from './pages/Sitemap';
import AuthorProfile from './pages/AuthorProfile';
import Katalog from './pages/Katalog';
import { SEO } from './components/SEO';

function GlobalSEO() {
  const location = useLocation();
  return <SEO path={location.pathname} />;
}

const getInitialSubdomain = (): string | null => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('studio.')) return 'studio';
    if (hostname.startsWith('news.')) return 'news';
    if (hostname.startsWith('yoikijatim.')) return 'yoikijatim';
    if (hostname.startsWith('lumajangtalks.')) return 'lumajangtalks';
    if (hostname.startsWith('gummah.') || hostname.startsWith('g-ummah.') || hostname.startsWith('ummah.')) return 'gummah';
    if (hostname.startsWith('finance.')) return 'finance';
    if (hostname.startsWith('lentera')) return 'lentera';
  }
  return null;
};

export default function App() {
  const [subdomain, setSubdomain] = useState<string | null>(getInitialSubdomain);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    const handleSubdomainCheck = () => {
      const detected = getInitialSubdomain();
      if (detected !== subdomain) {
        setSubdomain(detected);
      }
    };
    handleSubdomainCheck();

    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let faviconUrl = '/favicon.svg';
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    if (hostname.startsWith('studio.') || pathname.startsWith('/studio') || pathname.startsWith('/loginstudio')) {
      faviconUrl = '/favicon.svg';
    } else if (hostname.startsWith('news.') || pathname.startsWith('/news')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dc2626" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">GN</text></svg>';
    } else if (hostname.startsWith('yoikijatim.') || pathname.startsWith('/yoikijatim')) {
      faviconUrl = '/favicon-yj.svg';
    } else if (hostname.startsWith('lumajangtalks.') || pathname.startsWith('/lumajangtalks')) {
      faviconUrl = '/favicon-lt.svg';
    } else if (hostname.startsWith('finance.') || pathname.startsWith('/finance')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231e3a8a" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="white" dominant-baseline="central" text-anchor="middle">F</text></svg>';
    } else if (hostname.startsWith('gummah.') || hostname.startsWith('g-ummah.') || hostname.startsWith('ummah.') || pathname.startsWith('/gummah') || pathname.startsWith('/g-ummah') || pathname.startsWith('/ummah')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23059669" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="white" dominant-baseline="central" text-anchor="middle">G</text></svg>';
    } else if (hostname.startsWith('lentera') || pathname.startsWith('/lentera')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23051b34" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="%23d98218" dominant-baseline="central" text-anchor="middle">L</text></svg>';
    }

    const setFavicon = (url: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url;
      
      // Also update shortcut icon if it exists
      let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
      if (shortcutLink) {
        shortcutLink.href = url;
      }
    };
    
    setFavicon(faviconUrl);
  }, [window.location.pathname]);

  useEffect(() => {
    let canonicalUrl = 'https://www.gnextindonesia.site' + window.location.pathname;
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.startsWith('studio.')) {
      canonicalUrl = 'https://studio.gnextindonesia.site' + window.location.pathname;
    } else if (hostname.startsWith('news.')) {
      canonicalUrl = 'https://news.gnextindonesia.site' + window.location.pathname;
    } else if (hostname.startsWith('yoikijatim.')) {
      canonicalUrl = 'https://yoikijatim.gnextindonesia.site' + window.location.pathname;
    } else if (hostname.startsWith('lumajangtalks.')) {
      canonicalUrl = 'https://lumajangtalks.gnextindonesia.site' + window.location.pathname;
    } else if (hostname.startsWith('gummah.') || hostname.startsWith('g-ummah.') || hostname.startsWith('ummah.')) {
      canonicalUrl = 'https://g-ummah.gnextindonesia.site' + window.location.pathname;
    } else if (hostname.startsWith('finance.')) {
      canonicalUrl = 'https://finance.gnextindonesia.site' + window.location.pathname;
    }

    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  }, [window.location.pathname]);


  if (isInitializing) {
    return <StartupLoader subdomain={subdomain} />;
  }

  return (
    <ErrorBoundary><BrowserRouter>
      <GlobalSEO />
      {subdomain === 'studio' ? (
        /* studio.gnextindonesia.site */
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/analytics" element={<Studio />} />
          <Route path="/news" element={<Studio />} />
          <Route path="/categories" element={<Studio />} />
          <Route path="/works" element={<Studio />} />
          <Route path="/partners" element={<Studio />} />
          <Route path="/settings" element={<Studio />} />
          <Route path="/seo" element={<Studio />} />
          <Route path="/backup" element={<Studio />} />
          <Route path="/users" element={<Studio />} />
          <Route path="/audit" element={<Studio />} />
          <Route path="/" element={<Studio />} />
          <Route path="*" element={<Studio />} />
        </Routes>
      ) : subdomain === 'news' ? (
        /* news.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />
          {lenteraNetworks.map(n => (
            <Route key={n.id} path={`/${n.id}`} element={<LenteraPortalPage />} />
          ))}
          {lenteraNetworks.map(n => (
            <Route key={`${n.id}-news`} path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
          ))}
          <Route path="/news" element={<Navigate to="/" replace />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/yoikijatim/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/lumajangtalks/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/news/register" element={<Register />} />
          <Route path="/news/loginstudio" element={<LoginStudio />} />
          <Route path="/news/studio/*" element={<Studio />} />
          <Route path="/news/studio" element={<Studio />} />
          <Route path="/:username" element={<AuthorProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : subdomain === 'yoikijatim' ? (
        /* yoikijatim.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<YoikiJatimPage />} />
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={n.id} path={`/${n.id}`} element={<LenteraPortalPage />} />
          ))}
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={`${n.id}-news`} path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
          ))}
          <Route path="/news" element={<NewsPage />} />
          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />
          <Route path="/yoikijatim" element={<Navigate to="/" replace />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/yoikijatim/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/lumajangtalks/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/:username" element={<AuthorProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : subdomain === 'lumajangtalks' ? (
        /* lumajangtalks.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<LumajangTalksPage />} />
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={n.id} path={`/${n.id}`} element={<LenteraPortalPage />} />
          ))}
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={`${n.id}-news`} path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
          ))}
          <Route path="/news" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<Navigate to="/" replace />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/yoikijatim/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/lumajangtalks/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/:username" element={<AuthorProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : subdomain === 'gummah' ? (
        /* gummah.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<GUmmahPage />} />
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={n.id} path={`/${n.id}`} element={<LenteraPortalPage />} />
          ))}
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={`${n.id}-news`} path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
          ))}
          <Route path="/news" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />
          <Route path="/gummah" element={<Navigate to="/" replace />} />
          <Route path="/ummah" element={<Navigate to="/" replace />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/yoikijatim/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/lumajangtalks/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/gummah/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/ummah/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/:username" element={<AuthorProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : subdomain === 'finance' ? (
        /* finance.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<GnextFinancePage />} />
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={n.id} path={`/${n.id}`} element={<LenteraPortalPage />} />
          ))}
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={`${n.id}-news`} path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
          ))}
          <Route path="/news" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />
          <Route path="/gummah" element={<GUmmahPage />} />
          <Route path="/finance" element={<Navigate to="/" replace />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/finance/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/:username" element={<AuthorProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : subdomain === 'lentera' ? (
        /* lentera-xxx.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<LenteraPortalPage />} />
          <Route path="/lentera" element={<LenteraPortalPage />} />
          <Route path="/lenterabangsa" element={<LenteraPortalPage />} />
          <Route path="/lenteraindonesia" element={<LenteraPortalPage />} />
          <Route path="/lenteraid" element={<LenteraPortalPage />} />
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <React.Fragment key={n.id}>
              <Route path={`/${n.id}`} element={<LenteraPortalPage />} />
              <Route path={`/${n.id.replace(/^lentera/, 'lentera-')}`} element={<LenteraPortalPage />} />
            </React.Fragment>
          ))}
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <React.Fragment key={`${n.id}-news`}>
              <Route path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
              <Route path={`/${n.id.replace(/^lentera/, 'lentera-')}/:categorySlug/:slug`} element={<NewsDetail />} />
            </React.Fragment>
          ))}
          <Route path="/news" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/:username" element={<AuthorProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        /* Main domain: gnextindonesia.site */
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/work" element={<Work />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/lentera" element={<LenteraPortalPage />} />
          <Route path="/lenterabangsa" element={<LenteraPortalPage />} />
          <Route path="/lenteraindonesia" element={<LenteraPortalPage />} />
          <Route path="/lenteraid" element={<LenteraPortalPage />} />
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <React.Fragment key={n.id}>
              <Route path={`/${n.id}`} element={<LenteraPortalPage />} />
              <Route path={`/${n.id.replace(/^lentera/, 'lentera-')}`} element={<LenteraPortalPage />} />
            </React.Fragment>
          ))}
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <React.Fragment key={`${n.id}-news`}>
              <Route path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
              <Route path={`/${n.id.replace(/^lentera/, 'lentera-')}/:categorySlug/:slug`} element={<NewsDetail />} />
            </React.Fragment>
          ))}
          <Route path="/news" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/news/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />
          <Route path="/news/lumajangtalks" element={<LumajangTalksPage />} />
          <Route path="/gummah" element={<GUmmahPage />} />
          <Route path="/ummah" element={<GUmmahPage />} />
          <Route path="/finance" element={<GnextFinancePage />} />
          <Route path="/news/gummah" element={<GUmmahPage />} />
          <Route path="/news/ummah" element={<GUmmahPage />} />
          <Route path="/news/finance" element={<GnextFinancePage />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/yoikijatim/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/lumajangtalks/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/gummah/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/ummah/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/privacy" element={<PrivacyPage />} />
          <Route path="/yoikijatim/privacy" element={<PrivacyPage />} />
          <Route path="/lumajangtalks/privacy" element={<PrivacyPage />} />
          <Route path="/gummah/privacy" element={<PrivacyPage />} />
          <Route path="/ummah/privacy" element={<PrivacyPage />} />
          <Route path="/finance/privacy" element={<PrivacyPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/news/terms" element={<TermsPage />} />
          <Route path="/yoikijatim/terms" element={<TermsPage />} />
          <Route path="/lumajangtalks/terms" element={<TermsPage />} />
          <Route path="/gummah/terms" element={<TermsPage />} />
          <Route path="/ummah/terms" element={<TermsPage />} />
          <Route path="/finance/terms" element={<TermsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/news/loginstudio" element={<LoginStudio />} />
          <Route path="/news/studio/*" element={<Studio />} />
          <Route path="/news/studio" element={<Studio />} />
          <Route path="/yoikijatim/loginstudio" element={<LoginStudio />} />
          <Route path="/yoikijatim/studio/*" element={<Studio />} />
          <Route path="/yoikijatim/studio" element={<Studio />} />
          <Route path="/lumajangtalks/loginstudio" element={<LoginStudio />} />
          <Route path="/lumajangtalks/studio/*" element={<Studio />} />
          <Route path="/lumajangtalks/studio" element={<Studio />} />
          <Route path="/gummah/loginstudio" element={<LoginStudio />} />
          <Route path="/gummah/studio/*" element={<Studio />} />
          <Route path="/gummah/studio" element={<Studio />} />
          <Route path="/ummah/loginstudio" element={<LoginStudio />} />
          <Route path="/ummah/studio/*" element={<Studio />} />
          <Route path="/ummah/studio" element={<Studio />} />
          <Route path="/finance/loginstudio" element={<LoginStudio />} />
          <Route path="/finance/studio/*" element={<Studio />} />
          <Route path="/finance/studio" element={<Studio />} />
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <React.Fragment key={`${n.id}-studio`}>
              <Route path={`/${n.id}/loginstudio`} element={<LoginStudio />} />
              <Route path={`/${n.id}/studio/*`} element={<Studio />} />
              <Route path={`/${n.id}/studio`} element={<Studio />} />
            </React.Fragment>
          ))}
          <Route path="/register" element={<Register />} />
          <Route path="/loginstudio" element={<LoginStudio />} />
          <Route path="/studio/*" element={<Studio />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/:username" element={<AuthorProfile />} />
        </Routes>
      )}
    </BrowserRouter></ErrorBoundary>
  );
}
