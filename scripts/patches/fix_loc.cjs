const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(
  "(a.news_location && a.news_location.toLowerCase().includes(q))",
  "(a.news_location && typeof a.news_location === 'string' && a.news_location.toLowerCase().includes(q))"
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Fixed news_location type check');
