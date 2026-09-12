const fs = require('fs');
let content = fs.readFileSync('src/hooks/usePageMeta.tsx', 'utf-8');

// replace the manual checks
content = content.replace(
  `  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';\n  const isNews = path?.startsWith('/news') || hostname.startsWith('news.');\n  const isYoIkiJatim = path?.startsWith('/yoikijatim') || hostname.startsWith('yoikijatim.');\n  const isLumajangTalks = path?.startsWith('/lumajangtalks') || hostname.startsWith('lumajangtalks.');`,
  `  import { detectPortal, ALL_PORTALS } from '../lib/portals';\n\n  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';\n  const activePortal = detectPortal(hostname, path || '');`
);

content = content.replace(
  `  let defaultSuffix = ' | Gnext Creative Studio';\n  let siteName = 'Gnext Creative Studio';\n  let twitterHandle = '@gnextindonesia';\n\n  if (isYoIkiJatim) {\n    defaultSuffix = ' | Yo Iki Jatim';\n    siteName = 'Yo Iki Jatim';\n  } else if (isLumajangTalks) {\n    defaultSuffix = ' | Lumajang Talks';\n    siteName = 'Lumajang Talks';\n  } else if (isNews) {\n    defaultSuffix = ' | Gnext News';\n    siteName = 'Gnext News';\n  }`,
  `  let siteName = activePortal ? activePortal.name : 'Gnext Creative Studio';\n  let defaultSuffix = ' | ' + siteName;\n  let twitterHandle = '@gnextindonesia';`
);

content = content.replace(
  `  let favicon = "/favicon.svg";\n  \n  if (isNews) {\n    favicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dc2626" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">GN</text></svg>';\n  } else if (isYoIkiJatim) {\n    favicon = '/favicon-yj.svg';\n  } else if (isLumajangTalks) {\n    favicon = '/favicon-lt.svg';\n  }`,
  `  let favicon = "/favicon.svg";\n  if (activePortal?.id === 'gnext') {\n    favicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23dc2626" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">GN</text></svg>';\n  } else if (activePortal?.id === 'yoikijatim') {\n    favicon = '/favicon-yj.svg';\n  } else if (activePortal?.id === 'lumajangtalks') {\n    favicon = '/favicon-lt.svg';\n  } else if (activePortal?.id.startsWith('lentera')) {\n    favicon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230284c7" rx="20"/><text x="50%25" y="50%25" font-family="sans-serif" font-weight="900" font-size="45" fill="white" dominant-baseline="central" text-anchor="middle">L</text></svg>';\n  }`
);

// We need to make sure the import is at the top
content = `import { detectPortal } from '../lib/portals';\n` + content;
// Wait, my first replacement added it again. Let me just remove the inner import.
content = content.replace(`  import { detectPortal, ALL_PORTALS } from '../lib/portals';\n\n`, '');

fs.writeFileSync('src/hooks/usePageMeta.tsx', content);
