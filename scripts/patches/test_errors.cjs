const fs = require('fs');
let lentera = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');
let news = fs.readFileSync('src/pages/News.tsx', 'utf-8');

lentera = lentera.replace(/activePortal/g, "'lenterabangsa'");
fs.writeFileSync('src/pages/LenteraPortal.tsx', lentera);

news = news.replace(/activePortal/g, "portalObj?.id");
fs.writeFileSync('src/pages/News.tsx', news);
console.log('Fixed undefined vars');
