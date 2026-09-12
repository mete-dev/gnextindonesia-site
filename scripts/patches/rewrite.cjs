const fs = require('fs');

let code = fs.readFileSync('src/pages/studio/AnalyticsManager_bak.tsx', 'utf-8');

// 1. Add imports
code = code.replace(
  "import { \n  TrendingUp,",
  "import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';\nimport { \n  TrendingUp,"
);

// 2. Add Data
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
code = code.replace("export default function AnalyticsManager", dataCode + "\nexport default function AnalyticsManager");

// 3. Add states
code = code.replace(
  "const [activeSubTab, setActiveSubTab] = useState<'website' | 'article'>('website');",
  "const [activeSubTab, setActiveSubTab] = useState<'website' | 'article' | 'demographics'>('website');\n  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'this_month' | 'all'>('7d');"
);

// 4. Update the Tab Switcher UI
const oldTabSwitcher = `{/* Tab Switcher: Website vs Article */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveSubTab('website')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all \${
              activeSubTab === 'website'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }\`}
          >
            <Globe size={16} />
            <span>Laporan Website</span>
          </button>
          <button
            onClick={() => setActiveSubTab('article')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all \${
              activeSubTab === 'article'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }\`}
          >
            <FileText size={16} />
            <span>Laporan Artikel</span>
          </button>
        </div>`;

const newTabSwitcher = `<div className="flex flex-col sm:flex-row items-center gap-4 self-start xl:self-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-neutral-200/80 rounded-xl text-sm font-bold text-neutral-700 shadow-sm outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="this_month">Bulan Ini</option>
            <option value="all">Semua Waktu</option>
          </select>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('website')}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all \${
                activeSubTab === 'website'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }\`}
            >
              <Globe size={16} />
              <span>Website</span>
            </button>
            <button
              onClick={() => setActiveSubTab('article')}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all \${
                activeSubTab === 'article'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }\`}
            >
              <FileText size={16} />
              <span>Artikel</span>
            </button>
            <button
              onClick={() => setActiveSubTab('demographics')}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all \${
                activeSubTab === 'demographics'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }\`}
            >
              <Layers size={16} />
              <span>Demografi</span>
            </button>
          </div>
        </div>`;

code = code.replace(oldTabSwitcher, newTabSwitcher);

// 5. Inject Demographics Render Logic
const oldActiveTabCheck = `{activeSubTab === 'website' ? (`;

const demographicsUI = `{activeSubTab === 'demographics' ? (
        <div className="space-y-8">
          {/* TRAFFIC DEMOGRAPHICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Device Stats - Pie Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <Smartphone size={16} className="text-neutral-500" />
                Perangkat (Device)
              </h3>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [\`\${value}%\`, 'Persentase']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {deviceData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name} <span className="text-neutral-900 font-bold ml-0.5">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browser Stats - Bar Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <Globe2 size={16} className="text-neutral-500" />
                Browser Utama
              </h3>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#737373' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#737373' }} />
                    <RechartsTooltip 
                      formatter={(value) => [\`\${value}%\`, 'Persentase']}
                      cursor={{ fill: '#f5f5f5' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {browserData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Location Stats - Horizontal Bar Chart */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <Navigation size={16} className="text-neutral-500" />
                Lokasi Top (Daerah)
              </h3>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#737373' }} width={80} />
                    <RechartsTooltip 
                      formatter={(value) => [\`\${value}%\`, 'Persentase']}
                      cursor={{ fill: '#f5f5f5' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={30}>
                      {locationData.map((entry, index) => (
                        <Cell key={\`cell-\${index}\`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'website' ? (`;

code = code.replace(oldActiveTabCheck, demographicsUI);

fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Rewrite complete!');
