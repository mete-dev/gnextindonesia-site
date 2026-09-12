const fs = require('fs');
let code = fs.readFileSync('src/pages/NewsDetail.tsx', 'utf-8');
code = code.replace(
  "if (typeof window !== 'undefined' && !sessionStorage.getItem('viewed_' + found.id)) {",
  "// Removed tracking here to rely on lightweight script\nif (false) {"
);
fs.writeFileSync('src/pages/NewsDetail.tsx', code);
