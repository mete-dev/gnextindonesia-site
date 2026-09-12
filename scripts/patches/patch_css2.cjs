const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');
content = content.replace('--color-lumajang-500: #cca700;', '--color-lumajang-500: #E6D000;');
content = content.replace('--color-lumajang-600: #997800;', '--color-lumajang-600: #CCB800;');
content = content.replace('--color-lumajang-700: #664d00;', '--color-lumajang-700: #998A00;');
content = content.replace('--color-lumajang-800: #332600;', '--color-lumajang-800: #665C00;');
fs.writeFileSync('src/index.css', content);
console.log('Patched index.css for better yellows');
