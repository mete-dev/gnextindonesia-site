const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');
if (!code.includes('ErrorBoundary')) {
  code = "import ErrorBoundary from './components/ErrorBoundary';\n" + code;
  code = code.replace(
    "<HelmetProvider>",
    "<ErrorBoundary><HelmetProvider>"
  );
  code = code.replace(
    "</HelmetProvider>",
    "</HelmetProvider></ErrorBoundary>"
  );
  fs.writeFileSync('src/main.tsx', code);
  console.log('Added ErrorBoundary to main.tsx');
}
