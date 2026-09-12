const fs = require('fs');

let content = fs.readFileSync('src/pages/LumajangTalks.tsx', 'utf8');
content = content.replace(/yellow-/g, 'lumajang-');
fs.writeFileSync('src/pages/LumajangTalks.tsx', content);
console.log('Replaced yellow with lumajang in LumajangTalks.tsx');
