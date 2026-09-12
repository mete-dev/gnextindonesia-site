const fs = require('fs');
let content = fs.readFileSync('src/pages/studio/NewsManager.tsx', 'utf-8');

if (!content.includes('const getPortalStyle')) {
  content = content.replace(
    `export default function NewsManager({ currentUser }: { currentUser: any }) {`,
    `const getPortalStyle = (portalId: string) => {
    if (portalId === 'yoikijatim') return 'bg-orange-50 text-orange-600 border-orange-200';
    if (portalId === 'lumajangtalks') return 'bg-lumajang-50 text-lumajang-400 border-lumajang-200';
    if (portalId?.startsWith('lentera')) return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-red-50 text-red-600 border-red-200';
  };

export default function NewsManager({ currentUser }: { currentUser: any }) {`
  );
  fs.writeFileSync('src/pages/studio/NewsManager.tsx', content);
}
