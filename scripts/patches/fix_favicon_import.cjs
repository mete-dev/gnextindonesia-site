const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');

if (!content.includes('useEffect')) {
  content = content.replace(
    /import React, \{ useState \} from 'react';/,
    `import React, { useState, useEffect } from 'react';`
  );
  fs.writeFileSync('src/pages/LenteraPortal.tsx', content);
}
