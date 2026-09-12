const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
if (!html.includes('vite-error-overlay')) {
  html = html.replace('</head>', '<style>vite-error-overlay { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }</style></head>');
  fs.writeFileSync('index.html', html);
  console.log('Added CSS to hide vite-error-overlay');
}
