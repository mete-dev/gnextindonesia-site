const fs = require('fs');
let code = fs.readFileSync('src/pages/Studio.tsx', 'utf-8');
code = "import ErrorBoundary from '../components/ErrorBoundary';\n" + code;
code = code.replace(
  "{renderContent()}",
  "<ErrorBoundary>{renderContent()}</ErrorBoundary>"
);
fs.writeFileSync('src/pages/Studio.tsx', code);
console.log('Added ErrorBoundary to Studio.tsx');
