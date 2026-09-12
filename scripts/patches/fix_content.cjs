const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(
  "if (!content) return null;",
  "if (!content || typeof content !== 'string') return null;"
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Fixed content type check');
