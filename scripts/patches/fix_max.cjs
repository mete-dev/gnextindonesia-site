const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(
  "const maxViewsInList = currentArticlesList.length > 0 ? Math.max(...currentArticlesList.map(a => a.views || 1)) : 1;",
  "const maxViewsInList = currentArticlesList.length > 0 ? currentArticlesList.reduce((max, a) => Math.max(max, a.views || 1), 1) : 1;"
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Fixed maxViewsInList stack overflow risk');
