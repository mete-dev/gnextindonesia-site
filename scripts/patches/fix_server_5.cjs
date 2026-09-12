const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const target = `  } else if (lowerHost.startsWith('yoikijatim.') || urlPath.startsWith('/yoikijatim')) {
    siteName = 'YO IKI JATIM';
    siteAlternateName = 'Portal Berita & Informasi Terdepan Jawa Timur';
    siteUrl = 'https://yoikijatim.gnextindonesia.site';
    siteLogo = 'https://www.gnextindonesia.site/favicon-yj.svg';
  } else if (lowerHost.startsWith('news.') || urlPath.startsWith('/news')) {`;

const replacement = `  } else if (lowerHost.startsWith('yoikijatim.') || urlPath.startsWith('/yoikijatim')) {
    siteName = 'YO IKI JATIM';
    siteAlternateName = 'Portal Berita & Informasi Terdepan Jawa Timur';
    siteUrl = 'https://yoikijatim.gnextindonesia.site';
    siteLogo = 'https://www.gnextindonesia.site/favicon-yj.svg';
  } else if (lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)) {
    siteName = 'Lentera.id';
    siteAlternateName = 'Jaringan Berita Daerah Nusantara';
    siteUrl = 'https://www.gnextindonesia.site' + urlPath;
    siteLogo = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A192F" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="%23D4881A" dominant-baseline="central" text-anchor="middle">L</text></svg>';
  } else if (lowerHost.startsWith('news.') || urlPath.startsWith('/news')) {`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
