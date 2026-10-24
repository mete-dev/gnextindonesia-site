import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Work from './pages/Work';
import Platform from './pages/Platform';
import NewsPage from './pages/News';
import NewsDetail from './pages/NewsDetail';
import PrivacyPage from './pages/Privacy';
import LenteraPortalPage from './pages/LenteraPortal';
import { ALL_PORTALS, lenteraNetworks } from "./lib/portals";
import TermsPage from './pages/Terms';
import LoginStudio from './pages/LoginStudio';
import Register from './pages/Register';
import Studio from './pages/Studio';
import Sitemap from './pages/Sitemap';
import AuthorProfile from './pages/AuthorProfile';
import Katalog from './pages/Katalog';
import { SEO } from './components/SEO';
import { getBrandConfig } from './lib/brandConfig';

function GlobalSEO() {
  const location = useLocation();
  return <SEO path={location.pathname} />;
}

const getInitialSubdomain = (): string | null => {
  if (typeof window !== 'undefined') {
    const brand = getBrandConfig();
    if (brand.isDedicatedNews) return 'news';

    const hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('studio.')) return 'studio';
    if (hostname.startsWith('news.')) return 'news';
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
      setIsInitializing(false);
    };

    handleSubdomainCheck();
    window.addEventListener('popstate', handleSubdomainCheck);
    return () => window.removeEventListener('popstate', handleSubdomainCheck);
  }, []);

  useEffect(() => {
    const brand = getBrandConfig();
    let faviconUrl = brand.favicon;
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    if ((brand.id === 'thejavanesetimes' || brand.id === 'haloindonesia') && !hostname.startsWith('lentera') && !pathname.startsWith('/lentera')) {
      faviconUrl = brand.favicon;
    } else if (hostname.startsWith('studio.') || pathname.startsWith('/studio') || pathname.startsWith('/loginstudio')) {
      faviconUrl = '/favicon.svg';
    } else if (hostname.startsWith('news.') || pathname.startsWith('/news')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dc2626" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">GN</text></svg>';
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
      
      let shortcutLink = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement;
      if (shortcutLink) {
        shortcutLink.href = url;
      }
    };
    
    setFavicon(faviconUrl);
  }, [window.location.pathname]);

  useEffect(() => {
    const brand = getBrandConfig();
    let canonicalUrl = `${brand.url}${window.location.pathname}`;
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.startsWith('studio.')) {
      canonicalUrl = 'https://studio.gnextindonesia.site' + window.location.pathname;
    } else if (hostname.startsWith('news.')) {
      canonicalUrl = 'https://news.gnextindonesia.site' + window.location.pathname;
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
    return null;
  }

  return (
    <ErrorBoundary><BrowserRouter>
      <GlobalSEO />
      {subdomain === 'studio' ? (
        /* studio.gnextindonesia.site */
        <Routes>
          <Route path="/login" element={<LoginStudio />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editor/:id" element={<Studio />} />
          <Route path="/editor" element={<Studio />} />
          <Route path="/articles" element={<Studio />} />
          <Route path="/categories" element={<Studio />} />
          <Route path="/comments" element={<Studio />} />
          <Route path="/analytics" element={<Studio />} />
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
          {lenteraNetworks.map(n => (
            <Route key={n.id} path={`/${n.id}`} element={<LenteraPortalPage />} />
          ))}
          {lenteraNetworks.map(n => (
            <Route key={`${n.id}-news`} path={`/${n.id}/:categorySlug/:slug`} element={<NewsDetail />} />
          ))}
          <Route path="/news" element={<Navigate to="/" replace />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
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
      ) : subdomain === 'lentera' ? (
        /* lentera-xxx.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<LenteraPortalPage />} />
          <Route path="/lentera" element={<LenteraPortalPage />} />
          <Route path="/lenterabangsa" element={<LenteraPortalPage />} />
          <Route path="/lenteraindonesia" element={<LenteraPortalPage />} />
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
          
          {/* Redirect portal lama ke /news */}
          <Route path="/yoikijatim/*" element={<Navigate to="/news" replace />} />
          <Route path="/yoikijatim" element={<Navigate to="/news" replace />} />
          <Route path="/news/yoikijatim" element={<Navigate to="/news" replace />} />
          <Route path="/lumajangtalks/*" element={<Navigate to="/news" replace />} />
          <Route path="/lumajangtalks" element={<Navigate to="/news" replace />} />
          <Route path="/news/lumajangtalks" element={<Navigate to="/news" replace />} />
          <Route path="/gummah/*" element={<Navigate to="/news" replace />} />
          <Route path="/gummah" element={<Navigate to="/news" replace />} />
          <Route path="/ummah/*" element={<Navigate to="/news" replace />} />
          <Route path="/ummah" element={<Navigate to="/news" replace />} />
          <Route path="/finance/*" element={<Navigate to="/news" replace />} />
          <Route path="/finance" element={<Navigate to="/news" replace />} />
          <Route path="/news/gummah" element={<Navigate to="/news" replace />} />
          <Route path="/news/ummah" element={<Navigate to="/news" replace />} />
          <Route path="/news/finance" element={<Navigate to="/news" replace />} />
          
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/privacy" element={<PrivacyPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/sitemap.xml" element={<Sitemap />} />
          <Route path="/news/terms" element={<TermsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/news/loginstudio" element={<LoginStudio />} />
          <Route path="/news/studio/*" element={<Studio />} />
          <Route path="/news/studio" element={<Studio />} />
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

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h2>Something went wrong.</h2>
          <pre>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
