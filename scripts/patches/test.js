const fs = require('fs');
console.log(fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8').split('activeSubTab === \\\'website\\\' ? (')[1].substring(0, 500));
