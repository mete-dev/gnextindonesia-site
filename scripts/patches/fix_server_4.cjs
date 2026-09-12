const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const target1 = `            const portalSuffix = lowerHost.startsWith('lumajangtalks.') || urlPath.startsWith('/lumajangtalks')
              ? ' - LUMAJANG TALKS'
              : lowerHost.startsWith('yoikijatim.') || urlPath.startsWith('/yoikijatim')
              ? ' - YO IKI JATIM'
              : lowerHost.startsWith('news.') || urlPath.startsWith('/news')
              : lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)
              ? ' - LENTERA'
              : ' - GNEXT NEWS'
              : ' | Gnext Creative Studio';`;

const replacement1 = `            const portalSuffix = lowerHost.startsWith('lumajangtalks.') || urlPath.startsWith('/lumajangtalks')
              ? ' - LUMAJANG TALKS'
              : lowerHost.startsWith('yoikijatim.') || urlPath.startsWith('/yoikijatim')
              ? ' - YO IKI JATIM'
              : lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)
              ? ' - LENTERA.ID'
              : lowerHost.startsWith('news.') || urlPath.startsWith('/news')
              ? ' - GNEXT NEWS'
              : ' | Gnext Creative Studio';`;

content = content.replace(target1, replacement1);

const target2 = `            if (lowerHost.startsWith('lumajangtalks.') || urlPath.startsWith('/lumajangtalks')) {
              favicon = '/favicon-lt.svg';
            } else if (lowerHost.startsWith('yoikijatim.') || urlPath.startsWith('/yoikijatim')) {
              favicon = '/favicon-yj.svg';
            } else if (lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)) {
              favicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A192F" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="%23D4881A" dominant-baseline="central" text-anchor="middle">L</text></svg>';
            } else if (lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)) {
    siteName = 'Lentera.id';
    siteAlternateName = 'Jaringan Berita Daerah Nusantara';
    siteLogo = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A192F" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="%23D4881A" dominant-baseline="central" text-anchor="middle">L</text></svg>';
  } else if (lowerHost.startsWith('news.') || urlPath.startsWith('/news')) {
              favicon = '/favicon-news.svg';
            }`;

const replacement2 = `            if (lowerHost.startsWith('lumajangtalks.') || urlPath.startsWith('/lumajangtalks')) {
              favicon = '/favicon-lt.svg';
            } else if (lowerHost.startsWith('yoikijatim.') || urlPath.startsWith('/yoikijatim')) {
              favicon = '/favicon-yj.svg';
            } else if (lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)) {
              favicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A192F" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="%23D4881A" dominant-baseline="central" text-anchor="middle">L</text></svg>';
            } else if (lowerHost.startsWith('news.') || urlPath.startsWith('/news')) {
              favicon = '/favicon-news.svg';
            }`;
content = content.replace(target2, replacement2);

fs.writeFileSync('server.ts', content);
