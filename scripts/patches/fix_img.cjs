const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(
  "if (art.cover_image && art.cover_image.trim()) return art.cover_image.trim();",
  "if (art.cover_image && typeof art.cover_image === 'string' && art.cover_image.trim()) return art.cover_image.trim();"
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Fixed cover_image type check');
