const fs = require('fs');
const dataCode = `
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

let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
if (!code.includes('deviceData')) {
  code = code.replace("export default function AnalyticsManager", dataCode + "\nexport default function AnalyticsManager");
  fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
  console.log('Data injected!');
} else {
  console.log('Data already exists');
}
