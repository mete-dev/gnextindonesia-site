const fs = require('fs');

let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');

const startMarker = '{/* 2. TRAFFIC DEMOGRAPHICS */}';
const endMarker = '          <div className="space-y-6">';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const extracted = code.substring(startIndex, endIndex);
  
  // Remove from old place
  code = code.substring(0, startIndex) + code.substring(endIndex);
  
  // Find where to inject demographics
  const injectionPoint = '      {activeSubTab === \'website\' ? (';
  const newContent = `      {activeSubTab === 'demographics' ? (
        <div className="space-y-8">
          ` + extracted.trim() + `
        </div>
      ) : activeSubTab === 'website' ? (`;
  
  code = code.replace(injectionPoint, newContent);
  
  fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
  console.log('Successfully moved');
} else {
  console.log('Markers not found');
}
