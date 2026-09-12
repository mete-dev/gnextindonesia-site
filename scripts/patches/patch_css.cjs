const fs = require('fs');

let content = fs.readFileSync('src/index.css', 'utf8');
content = content.replace('--color-accent: #E1FF00; /* Vibrant creative yellow */', 
`--color-accent: #E1FF00; /* Vibrant creative yellow */
  
  /* Lumajang Talks Palette */
  --color-lumajang-50: #fffceb;
  --color-lumajang-100: #fff9d6;
  --color-lumajang-200: #fff3ad;
  --color-lumajang-300: #feea84;
  --color-lumajang-400: #FDE600;
  --color-lumajang-500: #cca700;
  --color-lumajang-600: #997800;
  --color-lumajang-700: #664d00;
  --color-lumajang-800: #332600;
  --color-lumajang-900: #1a1300;`);
fs.writeFileSync('src/index.css', content);
console.log('Patched index.css');
