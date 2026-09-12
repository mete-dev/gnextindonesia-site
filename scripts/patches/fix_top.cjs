const fs = require('fs');

const replacement = `
        <div className="flex flex-col sm:flex-row items-center gap-4 self-start xl:self-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-neutral-200/80 rounded-xl text-sm font-bold text-neutral-700 shadow-sm outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="this_month">Bulan Ini</option>
            <option value="all">Semua Waktu</option>
          </select>

          {/* Tab Switcher: Website vs Article */}
          <div className="flex items-center p-1.5 bg-neutral-100/80 rounded-xl border border-neutral-200/60 shrink-0 w-full sm:w-auto">
`;

let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(
  "{/* Tab Switcher: Website vs Article */}\n        <div className=\"flex items-center p-1.5 bg-neutral-100/80 rounded-xl border border-neutral-200/60 shrink-0 self-start xl:self-auto\">",
  replacement
);
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('UI inserted');
