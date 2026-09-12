const fs = require('fs');

function patchLogoLink(file, prefix) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(new RegExp(`to="/${prefix}"`, 'g'), `to={getBasePath() || '/'}`);
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}

patchLogoLink('src/pages/News.tsx', 'news');
patchLogoLink('src/pages/YoikiJatim.tsx', 'yoikijatim');
patchLogoLink('src/pages/LumajangTalks.tsx', 'lumajangtalks');
