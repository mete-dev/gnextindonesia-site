const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
if (!html.includes('unhandledrejection')) {
  html = html.replace('</head>', `<script>
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && event.reason.message && event.reason.message.includes('WebSocket')) {
        event.preventDefault();
      }
    });
  </script></head>`);
  fs.writeFileSync('index.html', html);
  console.log('Added unhandledrejection suppressor');
}
