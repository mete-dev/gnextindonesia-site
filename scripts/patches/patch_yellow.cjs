const fs = require('fs');

const files = [
  'src/pages/LumajangTalks.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/pages/NewsDetail.tsx',
  'src/pages/studio/NewsManager.tsx',
  'src/pages/studio/UserManager.tsx',
  'src/pages/Studio.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Make everything lumajang-400 for consistency in brightness, except maybe backgrounds
  content = content.replace(/text-lumajang-500/g, 'text-lumajang-400');
  content = content.replace(/text-lumajang-600/g, 'text-lumajang-400');
  content = content.replace(/text-lumajang-700/g, 'text-lumajang-400');
  content = content.replace(/text-lumajang-800/g, 'text-lumajang-400');
  content = content.replace(/text-lumajang-900/g, 'text-lumajang-400');

  content = content.replace(/bg-lumajang-500/g, 'bg-lumajang-400');
  content = content.replace(/bg-lumajang-600/g, 'bg-lumajang-400');
  content = content.replace(/bg-lumajang-700/g, 'bg-lumajang-400');
  
  content = content.replace(/border-lumajang-500/g, 'border-lumajang-400');
  content = content.replace(/border-lumajang-600/g, 'border-lumajang-400');
  
  content = content.replace(/from-lumajang-500/g, 'from-lumajang-400');
  content = content.replace(/hover:text-lumajang-500/g, 'hover:text-lumajang-400');
  content = content.replace(/hover:text-lumajang-600/g, 'hover:text-lumajang-400');
  content = content.replace(/hover:bg-lumajang-500/g, 'hover:bg-lumajang-400');

  // Any remaining 'amber-' from when I missed it?
  content = content.replace(/text-amber-/g, 'text-lumajang-');
  content = content.replace(/bg-amber-/g, 'bg-lumajang-');
  content = content.replace(/border-amber-/g, 'border-lumajang-');
  content = content.replace(/from-amber-/g, 'from-lumajang-');
  
  fs.writeFileSync(file, content);
}
console.log('Patched colors');
