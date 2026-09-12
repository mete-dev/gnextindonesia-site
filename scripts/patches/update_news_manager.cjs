const fs = require('fs');
let content = fs.readFileSync('src/pages/studio/NewsManager.tsx', 'utf-8');

// replace the manual yoikijatim options with mapping through ALL_PORTALS
content = content.replace(
  `                  <option value="gnext">GNEXT NEWS (Nasional)</option>\n                  <option value="yoikijatim">YO IKI JATIM (Jawa Timur)</option>\n                  <option value="lumajangtalks">LUMAJANG TALKS (Lumajang)</option>`,
  `                  {ALL_PORTALS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}`
);

// We need to import ALL_PORTALS and getPortalById in NewsManager.tsx
if (!content.includes('ALL_PORTALS')) {
  content = content.replace(
    `import { PageSetting } from './types';`,
    `import { PageSetting } from './types';\nimport { ALL_PORTALS, getPortalById } from '../../lib/portals';`
  );
}

// update the badge logic in table
// we can make a helper for the badge styles
const badgeHelper = `const getPortalStyle = (portalId: string) => {
    if (portalId === 'yoikijatim') return 'bg-orange-50 text-orange-600 border-orange-200';
    if (portalId === 'lumajangtalks') return 'bg-lumajang-50 text-lumajang-400 border-lumajang-200';
    if (portalId?.startsWith('lentera')) return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-red-50 text-red-600 border-red-200';
  };\n`;

if (!content.includes('getPortalStyle')) {
  content = content.replace(
    `export default function NewsManager({ currentUser }: { currentUser: any }) {`,
    `export default function NewsManager({ currentUser }: { currentUser: any }) {\n  ${badgeHelper}`
  );
}

content = content.replace(
  /article\.portal === 'yoikijatim' \?\s*'\/yoikijatim' : article\.portal === 'lumajangtalks' \?\s*'\/lumajangtalks' : '\/news'/g,
  `(article.portal === 'gnext' || !article.portal ? '/news' : '/' + article.portal)`
);

content = content.replace(
  /\{currentUser\.portal === 'yoikijatim' \? 'YO IKI JATIM \(Jawa Timur\)' : currentUser\.portal === 'lumajangtalks' \? 'LUMAJANG TALKS \(Lumajang\)' : 'GNEXT NEWS \(Nasional\)'\}/g,
  `{getPortalById(currentUser.portal || 'gnext').name}`
);

content = content.replace(
  /article\.portal === 'yoikijatim'\s*\?\s*'bg-orange-50 text-orange-600 border-orange-200'\s*:\s*article\.portal === 'lumajangtalks'\s*\?\s*'bg-lumajang-50 text-lumajang-400 border-lumajang-200'\s*:\s*'bg-red-50 text-red-600 border-red-200'/g,
  `getPortalStyle(article.portal || 'gnext')`
);

content = content.replace(
  /\{article\.portal === 'yoikijatim' \? 'YO IKI JATIM' : article\.portal === 'lumajangtalks' \? 'LUMAJANG' : 'GNEXT'\}/g,
  `{getPortalById(article.portal || 'gnext').name}`
);

content = content.replace(
  /\{article\.portal === 'yoikijatim' \? 'Yo Iki Jatim' : article\.portal === 'lumajangtalks' \? 'Lumajang Talks' : 'Gnext News'\}/g,
  `{getPortalById(article.portal || 'gnext').name}`
);

fs.writeFileSync('src/pages/studio/NewsManager.tsx', content);
