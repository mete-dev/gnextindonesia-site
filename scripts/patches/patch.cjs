const fs = require('fs');

function patchFile(file, prefix) {
  let content = fs.readFileSync(file, 'utf8');
  
  const getBasePath = `const getBasePath = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase();
      if (hostname.startsWith('${prefix}.')) return '';
    }
    return '/${prefix}';
  };\n`;
  
  if (!content.includes('const getBasePath')) {
    content = content.replace('export default function ', getBasePath + '\nexport default function ');
  }
  
  content = content.replace(new RegExp(`to={\`/${prefix}/`, 'g'), `to={\`\${getBasePath()}/`);
  
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}

patchFile('src/pages/News.tsx', 'news');
patchFile('src/pages/YoikiJatim.tsx', 'yoikijatim');
patchFile('src/pages/LumajangTalks.tsx', 'lumajangtalks');
