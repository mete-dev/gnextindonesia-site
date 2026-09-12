const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');

// Remove demographic tab button
code = code.replace(/<button\s*onClick=\{\(\) => setActiveSubTab\('demographics'\)\}[\s\S]*?<\/button>/, '');
// Remove demographics subtab view entirely
code = code.replace(/\{activeSubTab === 'demographics' \? \([\s\S]*?\) : activeSubTab === 'website' \? \(/, "{activeSubTab === 'website' ? (");

// Remove demographic data from top
code = code.replace(/const deviceData = \[[\s\S]*?\];[\s\n]*const browserData = \[[\s\S]*?\];[\s\n]*const locationData = \[[\s\S]*?\];/, '');
code = code.replace("useState<'website' | 'article' | 'demographics'>", "useState<'website' | 'article'>");
code = code.replace("PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid", "");

fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Done');
