const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  "server: { middlewareMode: true },",
  "server: { middlewareMode: true, hmr: false },"
);
fs.writeFileSync('server.ts', code);
console.log('Disabled HMR in server.ts');
