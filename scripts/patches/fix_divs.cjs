const fs = require("fs");
let code = fs.readFileSync("src/pages/studio/AnalyticsManager.tsx", "utf-8");
code = code.replace(
  "{/* 2. TRAFFIC DEMOGRAPHICS */}",
  "            </div>\n          </div>\n          {/* 2. TRAFFIC DEMOGRAPHICS */}"
);
fs.writeFileSync("src/pages/studio/AnalyticsManager.tsx", code);
