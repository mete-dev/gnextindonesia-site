const fs = require('fs');
let content = fs.readFileSync('src/pages/studio/NewsManager.tsx', 'utf8');

const anchor = "const handleSave = async (targetStatus";
const replacement = "const filteredLocs = locSearch.trim() ? indonesiaLocations.filter(loc => loc.toLowerCase().includes(locSearch.toLowerCase())).slice(0, 15) : indonesiaLocations.slice(0, 15);\n\n  " + anchor;

if (content.includes(anchor) && !content.includes('const filteredLocs')) {
  content = content.replace(anchor, replacement);
  fs.writeFileSync('src/pages/studio/NewsManager.tsx', content);
  console.log('Inserted filteredLocs');
} else {
  console.log('Failed to find anchor or already inserted');
}
