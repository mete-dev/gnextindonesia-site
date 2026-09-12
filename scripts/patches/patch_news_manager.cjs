const fs = require('fs');

let content = fs.readFileSync('src/pages/studio/NewsManager.tsx', 'utf8');

// Add import
if (!content.includes('indonesiaLocations')) {
  content = content.replace("import { logAudit } from '../../lib/audit';", 
    "import { logAudit } from '../../lib/audit';\nimport { indonesiaLocations } from '../../data/indonesiaLocations';");
}

// Add state
if (!content.includes('setLocSearch')) {
  content = content.replace("const [tagInput, setTagInput] = useState('');", 
    "const [tagInput, setTagInput] = useState('');\n  const [locSearch, setLocSearch] = useState('');\n  const [showLocDropdown, setShowLocDropdown] = useState(false);");
}

// Add filteredLocs inside component
if (!content.includes('const filteredLocs')) {
  content = content.replace("const handleSave = async (e: React.FormEvent) =>", 
    "const filteredLocs = locSearch.trim() ? indonesiaLocations.filter(loc => loc.toLowerCase().includes(locSearch.toLowerCase())).slice(0, 15) : indonesiaLocations.slice(0, 15);\n\n  const handleSave = async (e: React.FormEvent) =>");
}

fs.writeFileSync('src/pages/studio/NewsManager.tsx', content);
console.log('Patched states');
