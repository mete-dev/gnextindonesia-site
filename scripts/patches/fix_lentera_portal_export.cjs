const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

content = content.replace(
  /export const \[\]: Article\[\] = \[\];/,
  `// Removed fallback articles export`
);

fs.writeFileSync('src/pages/LenteraPortal.tsx', content);
