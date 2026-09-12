const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /const getInitialSubdomain = \(\)\: string \| null => \{([\s\S]*?)return null;\n\};\n/m,
  `const getInitialSubdomain = (): string | null => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    const portal = detectPortal(hostname);
    if (portal && portal.id !== 'gnext') {
      return portal.id;
    }
    if (hostname.startsWith('news.')) return 'news';
  }
  return null;
};\n`
);

content = content.replace(
  /\} else if \(subdomain === 'lentera'\) \{/g,
  `} else if (subdomain && subdomain.startsWith('lentera')) {`
);

// We should also ensure lentera routes are generated in the main domain:
content = content.replace(
  /<Route path="\/news" element=\{<NewsPage \/>\} \/>/g,
  `{ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={n.id} path={\`/\${n.id}\`} element={<LenteraPortalPage />} />
          ))}
          {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(n => (
            <Route key={\`\${n.id}-news\`} path={\`/\${n.id}/:categorySlug/:slug\`} element={<NewsDetail />} />
          ))}
          <Route path="/news" element={<NewsPage />} />`
);

if (!content.includes('ALL_PORTALS')) {
  content = content.replace(
    /import \{ detectPortal \} from "\.\/lib\/portals";/,
    `import { detectPortal, ALL_PORTALS } from "./lib/portals";`
  );
}

fs.writeFileSync('src/App.tsx', content);
