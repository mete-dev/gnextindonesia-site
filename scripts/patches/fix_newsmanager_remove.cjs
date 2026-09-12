const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/NewsManager.tsx', 'utf-8');
code = code.replace(/localStorage\.removeItem\('article_draft'\)/g, "try { localStorage.removeItem('article_draft'); } catch (e) {}");
fs.writeFileSync('src/pages/studio/NewsManager.tsx', code);
console.log('Fixed removeItem in NewsManager');
