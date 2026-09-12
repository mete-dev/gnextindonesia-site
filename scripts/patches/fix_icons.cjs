const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(
  "import { \n  TrendingUp,",
  "import { \n  Smartphone, Globe2, Navigation,\n  TrendingUp,"
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
