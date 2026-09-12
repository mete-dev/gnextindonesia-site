const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

// I duplicated imports it seems. Let's clean up imports.
content = content.replace(/import \{ detectPortal, getPortalById \} from '\.\.\/lib\/portals';\nimport \{ LenteraLogo \} from '\.\/LenteraLogo';\nimport \{ detectPortal, getPortalById \} from '\.\.\/lib\/portals';\nimport \{ LenteraLogo \} from '\.\/LenteraLogo';/g, "import { detectPortal, getPortalById } from '../lib/portals';\nimport { LenteraLogo } from './LenteraLogo';");
content = content.replace(/import \{ detectPortal, getPortalById \} from '\.\.\/lib\/portals';\nimport \{ detectPortal, getPortalById \} from '\.\.\/lib\/portals';/g, "import { detectPortal, getPortalById } from '../lib/portals';");

// Check duplicate identifiers by just reading file
