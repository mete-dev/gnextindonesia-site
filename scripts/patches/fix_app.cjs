const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("<ErrorBoundary><div className=\"min-h-screen bg-white\">", "<div className=\"min-h-screen bg-white\">");
code = code.replace("<BrowserRouter>", "<ErrorBoundary><BrowserRouter>");
fs.writeFileSync('src/App.tsx', code);
