const fs = require('fs');
const content = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
const articleStart = content.indexOf(") : (");
if (articleStart > -1) {
  console.log("Found ) : ( at index", articleStart);
}
