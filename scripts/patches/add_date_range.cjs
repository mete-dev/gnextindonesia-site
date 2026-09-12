const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace("const [sortBy, setSortBy] = useState<'views' | 'date' | 'title'>('views');", "const [sortBy, setSortBy] = useState<'views' | 'date' | 'title'>('views');\n  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'this_month' | 'all'>('7d');");
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Added state');
