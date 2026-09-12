const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// replace getInitialSubdomain to use detectPortal
if (!content.includes('import { detectPortal } from "./lib/portals";')) {
  content = content.replace(
    `import YoikiJatimPage from './pages/YoikiJatim';`,
    `import YoikiJatimPage from './pages/YoikiJatim';\nimport LenteraPortalPage from './pages/LenteraPortal';\nimport { detectPortal } from "./lib/portals";`
  );
}

content = content.replace(
  `const getInitialSubdomain = () => {
  const hostname = window.location.hostname.toLowerCase();
  
  // Exclude studio paths completely
  if (window.location.pathname.startsWith('/studio') || window.location.pathname.startsWith('/loginstudio')) {
    return null;
  }

  // Only check subdomains if not running on localhost (unless it's a specific local test)
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    if (hostname.startsWith('news.')) return 'news';
    if (hostname.startsWith('yoikijatim.')) return 'yoikijatim';
    if (hostname.startsWith('lumajangtalks.')) return 'lumajangtalks';
  }
  return null;
};`,
  `const getInitialSubdomain = () => {
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  if (pathname.startsWith('/studio') || pathname.startsWith('/loginstudio')) return null;
  
  const portal = detectPortal(hostname, '');
  if (portal && portal.id !== 'gnext') {
     return portal.id.startsWith('lentera') ? 'lentera' : portal.id;
  }
  if (portal && portal.id === 'gnext' && (hostname.startsWith('news.') || pathname.startsWith('/news'))) {
     return 'news';
  }
  return null;
};`
);

// update favicon logic
content = content.replace(
  /\} else if \(hostname\.startsWith\('lumajangtalks\.'\).*?\}/s,
  `} else if (hostname.startsWith('lumajangtalks.') || pathname.startsWith('/lumajangtalks')) {
      faviconUrl = '/favicon-lt.svg';
    } else if (hostname.startsWith('lentera') || pathname.startsWith('/lentera')) {
      faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230284c7" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">L</text></svg>';
    }`
);

// update routing logic where `subdomain === 'lumajangtalks'` -> add `subdomain === 'lentera'`
const lumajangBlock = `      ) : subdomain === 'lumajangtalks' ? (
        /* lumajangtalks.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<LumajangTalksPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<Navigate to="/" replace />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/news/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/yoikijatim/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/lumajangtalks/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : subdomain === 'lentera' ? (
        /* lentera-xxx.gnextindonesia.site */
        <Routes>
          <Route path="/" element={<LenteraPortalPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/yoikijatim" element={<YoikiJatimPage />} />
          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />
          <Route path="/:categorySlug/:slug" element={<NewsDetail />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (`;

content = content.replace(
  /      \) : subdomain === 'lumajangtalks' \? \([\s\S]*?<Route path="\*" element={<Navigate to="\/" replace \/>} \/>\s*<\/Routes>\s*\) : \(/,
  lumajangBlock
);

// We need to add LenteraPortalPage to the default routing as well
content = content.replace(
  `          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />`,
  `          <Route path="/lumajangtalks" element={<LumajangTalksPage />} />\n          <Route path="/lentera-*" element={<LenteraPortalPage />} />`
);

fs.writeFileSync('src/App.tsx', content);
