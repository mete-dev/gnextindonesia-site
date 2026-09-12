const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
const lines = code.split('\n');
const fixedLines = lines.slice(0, 690);
fixedLines.push(
"              )}",
"          </div>",
"        </div>",
"      )}",
"    </div>",
"  );",
"}"
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', fixedLines.join('\n'));
