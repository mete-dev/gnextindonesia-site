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

const replaceWith = `
          {/* 2. TRAFFIC DEMOGRAPHICS */}
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
                    <Tooltip 
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
                    <Tooltip 
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
                    <Tooltip 
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
`;

let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');

// Insert imports
if (!code.includes('recharts')) {
  code = code.replace("import { lucide-react } from 'lucide-react';", "import { lucide-react } from 'lucide-react';\nimport { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';");
  
  // also inject data
  const insertIndex = code.indexOf('export default function AnalyticsManager');
  code = code.slice(0, insertIndex) + dataCode + '\n' + code.slice(insertIndex);
}

// Replace UI
const startMarker = '{/* 2. TRAFFIC DEMOGRAPHICS */}';
const endMarker = ') : (';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  // We need to keep some closing tags before `) : (`.
  // The original has:
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       ) : (
  
  // Let's just find the end of the location stats div
  const newCode = code.slice(0, startIndex) + replaceWith + '\n        </div>\n      ' + code.slice(endIndex);
  fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', newCode);
  console.log('Updated successfully');
} else {
  console.log('Markers not found');
}
