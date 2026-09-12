const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

content = content.replace(
  `  const getSubdomain = (): 'news' | 'yoikijatim' | 'lumajangtalks' | string | null => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const detected = detectPortal(host, window.location.pathname);
      if (detected) return detected.id;
    }
    return null;
  };

  const getActivePortal = (): string => {
    if (portal) return portal;
    if (detectedPortal) return detectedPortal.id;
    return 'gnext';
  };

  const activePortal = getActivePortal();
  const isLentera = activePortal.startsWith('lentera');
  const portalData = getPortalById(activePortal);
  const sub = detectedPortal && detectedPortal.id !== 'gnext' ? detectedPortal.id : null;`,
  `  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  const detectedPortal = detectPortal(hostname, pathname);

  const getActivePortal = (): string => {
    if (portal) return portal;
    if (detectedPortal) return detectedPortal.id;
    return 'gnext';
  };

  const activePortal = getActivePortal();
  const isLentera = activePortal.startsWith('lentera');
  const portalData = getPortalById(activePortal);
  const sub = detectedPortal && detectedPortal.id !== 'gnext' ? detectedPortal.id : null;`
);

fs.writeFileSync('src/components/Footer.tsx', content);
