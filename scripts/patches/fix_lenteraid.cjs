const fs = require('fs');
let content = fs.readFileSync('src/pages/LenteraPortal.tsx', 'utf-8');
content = content.replace(/const portalId = portal \? portal\.id : 'lentera';/, `const portalId = portal ? portal.id : 'lenteraid';`);
fs.writeFileSync('src/pages/LenteraPortal.tsx', content);

let serverContent = fs.readFileSync('server.ts', 'utf-8');
serverContent = serverContent.replace(/host\.includes\('lentera'\)/g, `host.startsWith('lentera')`);
serverContent = serverContent.replace(/url\.startsWith\('\/lentera'\)/g, `url.match(/^\\/lentera/)`);
fs.writeFileSync('server.ts', serverContent);
