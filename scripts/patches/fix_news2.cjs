const fs = require('fs');
let news = fs.readFileSync('src/pages/News.tsx', 'utf-8');
news = news.replace(/portalObj\?\.id/g, "'gnext'");
fs.writeFileSync('src/pages/News.tsx', news);
console.log('Fixed undefined portalObj 2');
