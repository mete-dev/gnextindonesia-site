const fs = require('fs');
let code = fs.readFileSync('src/pages/Studio.tsx', 'utf-8');
code = code.replace(/localStorage\.removeItem\('studio_user'\)/g, "try { localStorage.removeItem('studio_user'); } catch(e) {}");
fs.writeFileSync('src/pages/Studio.tsx', code);
console.log('Fixed removeItem in Studio');
