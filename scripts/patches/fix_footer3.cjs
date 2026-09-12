const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

// Fix duplicate imports
content = content.replace(
  /import { detectPortal, getPortalById } from '\.\.\/lib\/portals';\nimport { LenteraLogo } from '\.\/LenteraLogo';\nimport { detectPortal, ALL_PORTALS } from '\.\.\/lib\/portals';\nimport { LenteraLogo } from '\.\/LenteraLogo';/,
  `import { detectPortal, getPortalById, ALL_PORTALS } from '../lib/portals';\nimport { LenteraLogo } from './LenteraLogo';`
);

// Fix getActivePortal and portalObj logic
content = content.replace(
  `export default function Footer({ portal }: FooterProps) {
  const getSubdomain = (): 'news' | 'yoikijatim' | 'lumajangtalks' | string | null => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      const detected = detectPortal(host, window.location.pathname);
      if (detected) return detected.id;
    }
    return null;
  };

  const getActivePortal = (): string => {
    if (portal) return portal;
    if (portalObj) return portalObj.id;
    return 'gnext';
  };

  const activePortal = getActivePortal();
  const isLentera = activePortal.startsWith('lentera');
  const portalData = getPortalById(activePortal);
  const sub = portalObj && portalObj.id !== 'gnext' ? portalObj.id : null;`,
  `export default function Footer({ portal }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  const portalObj = detectPortal(hostname, pathname);

  const getActivePortal = (): string => {
    if (portal) return portal;
    if (portalObj) return portalObj.id;
    return 'gnext';
  };

  const activePortal = getActivePortal();
  const sub = portalObj && portalObj.id !== 'gnext' ? portalObj.id : null;`
);

fs.writeFileSync('src/components/Footer.tsx', content);
