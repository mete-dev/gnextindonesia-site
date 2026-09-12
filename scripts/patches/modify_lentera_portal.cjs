const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

// Replace standard exports with Lentera ones
content = content.replace(/yoikiFallbackArticles/g, 'lenteraFallbackArticles');
content = content.replace(/yoikijatim/g, 'lentera');
content = content.replace(/YO IKI JATIM/g, '{portalName.toUpperCase()}');
content = content.replace(/Yo Iki Jatim/g, '{portalName}');
content = content.replace(/yo iki jatim/g, '{portalName.toLowerCase()}');
content = content.replace(/text-orange-/g, 'text-blue-');
content = content.replace(/bg-orange-/g, 'bg-blue-');
content = content.replace(/from-orange-/g, 'from-blue-');
content = content.replace(/to-orange-/g, 'to-blue-');
content = content.replace(/border-orange-/g, 'border-blue-');
content = content.replace(/ring-orange-/g, 'ring-blue-');
content = content.replace(/hover:text-orange-/g, 'hover:text-blue-');
content = content.replace(/hover:bg-orange-/g, 'hover:bg-blue-');
content = content.replace(/focus:border-orange-/g, 'focus:border-blue-');
content = content.replace(/focus:ring-orange-/g, 'focus:ring-blue-');

// Import detectPortal
if (!content.includes('detectPortal')) {
  content = content.replace(
    `import { Article } from './studio/types';`,
    `import { Article } from './studio/types';\nimport { detectPortal } from '../lib/portals';`
  );
}

// Function signature update
content = content.replace(
  `export default function {portalName.toUpperCase()}Page() {`,
  `export default function LenteraPortalPage() {`
);

// We need to inject the portal detection inside the component
content = content.replace(
  `export default function LenteraPortalPage() {`,
  `export default function LenteraPortalPage() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const portal = detectPortal(hostname, pathname);
  const portalName = portal ? portal.name : 'Lentera.id';
  const portalId = portal ? portal.id : 'lentera';`
);

// Let's replace `{portalName}` where it's wrapped in JSX strings or properly.
// Wait, the regex replaced 'Yo Iki Jatim' in strings like 'Portal Berita & Informasi Terdepan Jawa Timur', let's leave that.
// The hardcoded fallback articles might need some fix
content = content.replace(/Jawa Timur/g, '{portalName}');
content = content.replace(/'\{portalName\}'/g, 'portalName');
content = content.replace(/'\{portalName\.toLowerCase\(\)\}'/g, 'portalName.toLowerCase()');
content = content.replace(/'\{portalName\.toUpperCase\(\)\}'/g, 'portalName.toUpperCase()');

// Replace the fallback articles entirely just in case
content = content.replace(
  /export const lenteraFallbackArticles: Article\[\] = \[[\s\S]*?\];/g,
  `export const lenteraFallbackArticles: Article[] = [];`
);

// In SEO
content = content.replace(
  /<SEO\s+title="\{portalName.toUpperCase\(\)\}Page"/,
  `<SEO title={\`\${portalName} - Jaringan Berita Daerah\`}`
);

// Fix title string issues
content = content.replace(/title=".*?\{portalName\}.*?"/, 'title={`${portalName} - Jaringan Berita Daerah | Gnext Creative Studio`}');

// Instead of the manual regex mess for JSX, let me just fix the whole file by saving it properly if it breaks.
fs.writeFileSync('src/pages/LenteraPortal.tsx', content);
