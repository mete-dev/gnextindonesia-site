const fs = require('fs');

const files = [
  'src/pages/NewsDetail.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/pages/News.tsx',
  'src/pages/studio/NewsManager.tsx',
  'src/pages/studio/UserManager.tsx',
  'src/pages/Studio.tsx',
  'src/pages/Work.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/amber-/g, 'lumajang-');
  fs.writeFileSync(file, content);
  console.log('Patched ' + file);
}
