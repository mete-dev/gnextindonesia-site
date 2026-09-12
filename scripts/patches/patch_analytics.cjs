const fs = require('fs');

let analytics = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
let demographics = fs.readFileSync('src/pages/studio/DemographicsManager.tsx', 'utf-8');

// Ensure correct imports in AnalyticsManager
if (!analytics.includes('PieChart')) {
  analytics = analytics.replace("import {  } from 'recharts';", "import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';");
}

// Add data arrays after imports
const dataArrays = `
const deviceData = [
  { name: 'Mobile', value: 72, color: '#3b82f6' },
  { name: 'Desktop', value: 24, color: '#6366f1' },
  { name: 'Tablet', value: 4, color: '#06b6d4' }
];

const browserData = [
  { name: 'Chrome', value: 68, color: '#22c55e' },
  { name: 'Safari', value: 18, color: '#0ea5e9' },
  { name: 'Lainnya', value: 14, color: '#f97316' }
];

const locationData = [
  { name: 'Jawa Timur', value: 45, color: '#f43f5e' },
  { name: 'DKI Jakarta', value: 30, color: '#f59e0b' },
  { name: 'Jawa Tengah', value: 25, color: '#a855f7' }
];
`;
if (!analytics.includes('const deviceData =')) {
  analytics = analytics.replace("export default function AnalyticsManager", dataArrays + "\nexport default function AnalyticsManager");
}

// Update state
analytics = analytics.replace(/useState<'website' \| 'article'>\('website'\)/g, "useState<'website' | 'article' | 'demographics'>('website')");

// Add button
const demoBtn = `
          <button
            onClick={() => setActiveSubTab('demographics')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all \${
              activeSubTab === 'demographics'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }\`}
          >
            <Users size={16} />
            <span>Demografi Pembaca</span>
          </button>
`;
if (!analytics.includes('<span>Demografi Pembaca</span>')) {
  analytics = analytics.replace("<span>Laporan Artikel</span>\n          </button>", "<span>Laporan Artikel</span>\n          </button>\n" + demoBtn);
}

// Extract demographics content
const demoMatch = demographics.match(/<div className="grid grid-cols-1 md:grid-cols-3 gap-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
if (demoMatch) {
  let demoContent = demoMatch[0];
  // Remove the outermost </div> to match structure
  demoContent = demoContent.substring(0, demoContent.lastIndexOf('</div>'));
  
  const conditionalContent = `
      {activeSubTab === 'demographics' ? (
        <div className="space-y-8">
          ${demoContent}
      ) : activeSubTab === 'website' ? (
  `;
  
  if (!analytics.includes("activeSubTab === 'demographics' ?")) {
    analytics = analytics.replace("{activeSubTab === 'website' ? (", conditionalContent.trim());
  }
}

fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', analytics);
console.log('Patched AnalyticsManager');
