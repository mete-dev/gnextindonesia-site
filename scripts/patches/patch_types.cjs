const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/let link = document\.querySelector\("link\[rel~='icon'\]"\);/g, "let link = document.querySelector(\"link[rel~='icon']\") as HTMLLinkElement;");
content = content.replace(/let shortcutLink = document\.querySelector\("link\[rel='shortcut icon'\]"\);/g, "let shortcutLink = document.querySelector(\"link[rel='shortcut icon']\") as HTMLLinkElement;");
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed types in App.tsx');
