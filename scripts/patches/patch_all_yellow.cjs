const fs = require('fs');
const files = [
  'src/pages/LumajangTalks.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/pages/NewsDetail.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/lumajang-200/g, 'lumajang-400');
  content = content.replace(/lumajang-300/g, 'lumajang-400');
  content = content.replace(/lumajang-500/g, 'lumajang-400');
  content = content.replace(/lumajang-600/g, 'lumajang-400');
  content = content.replace(/lumajang-700/g, 'lumajang-400');
  fs.writeFileSync(file, content);
}
console.log('Patched all lumajang accents to 400');
