const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

// Colors
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
content = content.replace(
  `import { Article } from './studio/types';`,
  `import { Article } from './studio/types';\nimport { detectPortal } from '../lib/portals';`
);

// We replace the fallback array with an empty one
const fallbackMatch = content.match(/export const yoikiFallbackArticles: Article\[\] = \[[^]+?\];/);
if (fallbackMatch) {
  content = content.replace(fallbackMatch[0], 'export const yoikiFallbackArticles: Article[] = [];');
}

// Function signature
content = content.replace(
  `export default function YoikiJatimPage() {`,
  `export default function LenteraPortalPage() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const portal = detectPortal(hostname, pathname);
  const portalName = portal && portal.id !== 'gnext' ? portal.name : 'Lentera.id';
  const portalId = portal ? portal.id : 'lentera';`
);

content = content.replace(
  `yoikiFallbackArticles`,
  `[]`
);

// Search inside component and replace string literals
// Inside the component return, we can replace 'YO IKI JATIM' with {portalName.toUpperCase()}
// and 'Yo Iki Jatim' with {portalName}
content = content.replace(/'YO IKI JATIM'/g, 'portalName.toUpperCase()');
content = content.replace(/'Yo Iki Jatim'/g, 'portalName');
content = content.replace(/'yo iki jatim'/g, 'portalName.toLowerCase()');
content = content.replace(/"YO IKI JATIM"/g, '{portalName.toUpperCase()}');
content = content.replace(/"Yo Iki Jatim"/g, '{portalName}');
content = content.replace(/"yo iki jatim"/g, '{portalName.toLowerCase()}');
content = content.replace(/>YO IKI JATIM</g, '>{portalName.toUpperCase()}<');
content = content.replace(/>Yo Iki Jatim</g, '>{portalName}<');
content = content.replace(/>yo iki jatim</g, '>{portalName.toLowerCase()}<');
content = content.replace(/Jawa Timur/g, '{portalName}');
content = content.replace(/portal === 'yoikijatim'/g, 'portal === portalId');

content = content.replace(/<SEO title="\{portalName\.toUpperCase\(\)\}Page" \/>/, `<SEO title={\`\${portalName} - Jaringan Berita Daerah\`} />`);

fs.writeFileSync('src/pages/LenteraPortal.tsx', content);
