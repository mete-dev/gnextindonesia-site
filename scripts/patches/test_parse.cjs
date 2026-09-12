const fs = require('fs');
const acorn = require('acorn-jsx');
const code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
// It's TSX so acorn can't parse it entirely.
// Let's use ts-node or something. Or just count divs.
