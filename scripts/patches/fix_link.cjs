const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

content = content.replace(/link\.href = faviconUrl;/g, `(link as HTMLLinkElement).href = faviconUrl;`);

fs.writeFileSync('src/pages/LenteraPortal.tsx', content);
