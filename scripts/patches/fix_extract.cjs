const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
const startIndex = code.indexOf('{/* 2. TRAFFIC DEMOGRAPHICS */}');
const endIndex = code.indexOf('{/* Controls Bar: Search & Sort */}');
console.log(code.substring(endIndex - 100, endIndex + 50));
