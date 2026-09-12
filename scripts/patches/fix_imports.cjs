const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace("import { supabase } from '../../lib/supabase';", "import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';\nimport { supabase } from '../../lib/supabase';");
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Imports added');
