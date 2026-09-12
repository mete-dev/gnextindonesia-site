const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(
  "return a.title.localeCompare(b.title);",
  "return (a.title || '').localeCompare(b.title || '');"
);
code = code.replace(
  "a.title.toLowerCase().includes(q) ||",
  "(a.title || '').toLowerCase().includes(q) ||"
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Fixed title possible undefined');
