const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Fix portalSuffix
content = content.replace(
  /: lowerHost.startsWith\('news\.'\) \|\| urlPath\.startsWith\('\/news'\)\s*: lowerHost.startsWith\('lentera'\) \|\| urlPath.match\(\/\^\\\\\/lentera\/\)\s*\? ' - LENTERA'\s*: ' - GNEXT NEWS'\s*: ' \| Gnext Creative Studio';/g,
  `: lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)
              ? ' - LENTERA'
              : lowerHost.startsWith('news.') || urlPath.startsWith('/news')
              ? ' - GNEXT NEWS'
              : ' | Gnext Creative Studio';`
);

// Fix favicon block
content = content.replace(
  /\} else if \(lowerHost\.startsWith\('lentera'\) \|\| urlPath\.match\(\/\^\\\\\/lentera\/\)\) \{\s*favicon = '[^']*';\s*\} else if \(lowerHost\.startsWith\('lentera'\) \|\| urlPath\.match\(\/\^\\\\\/lentera\/\)\) \{\s*siteName = 'Lentera.id';\s*siteAlternateName = 'Jaringan Berita Daerah Nusantara';\s*siteLogo = '[^']*';\s*\} else if \(lowerHost\.startsWith\('news\.'\) \|\| urlPath\.startsWith\('\/news'\)\) \{/g,
  `} else if (lowerHost.startsWith('lentera') || urlPath.match(/^\\/lentera/)) {
              favicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230A192F" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="55" fill="%23D4881A" dominant-baseline="central" text-anchor="middle">L</text></svg>';
            } else if (lowerHost.startsWith('news.') || urlPath.startsWith('/news')) {`
);

// I will just use regex to clean up everything from line 520 to 560 safely
