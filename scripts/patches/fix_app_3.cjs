const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  /import \{ detectPortal \} from "\.\/lib\/portals";/,
  `import { detectPortal, ALL_PORTALS, lenteraNetworks } from "./lib/portals";`
);
fs.writeFileSync('src/App.tsx', content);
