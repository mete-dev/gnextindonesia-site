const fs = require('fs');

let analytics = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');

const target = `
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-neutral-900 text-white rounded-xl shadow-sm">
              <BarChart2 size={22} />
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">
              Analitik Trafik & Performa Portal
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            Pantau statistik pembaca berita, performa artikel terpopuler, dan buat laporan langsung ke Audit Log.
          </p>
        </div>

        {/* Tab Switcher: Website vs Article */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-100 p-1 rounded-xl self-start md:self-auto border border-neutral-200/80">
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
        </div>
      </div>
`.trim();

const replacement = `
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-neutral-900 text-white rounded-xl shadow-sm">
              <BarChart2 size={24} />
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 tracking-tight">
              Analitik & Trafik
            </h2>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Pantau statistik pembaca berita, demografi pengunjung, performa artikel terpopuler, dan integrasi Audit Log.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-neutral-100/80 rounded-xl overflow-x-auto hide-scrollbar self-start w-full sm:w-auto border border-neutral-200/60 shadow-sm">
          <button
            onClick={() => setActiveSubTab('website')}
            className={\`flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none \${
              activeSubTab === 'website'
                ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
            }\`}
          >
            <Globe size={16} />
            <span>Laporan Website</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('article')}
            className={\`flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none \${
              activeSubTab === 'article'
                ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
            }\`}
          >
            <FileText size={16} />
            <span>Laporan Artikel</span>
          </button>

          <button
            onClick={() => setActiveSubTab('demographics')}
            className={\`flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none \${
              activeSubTab === 'demographics'
                ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/50'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
            }\`}
          >
            <Users size={16} />
            <span>Demografi</span>
          </button>
        </div>
      </div>
`.trim();

// Because whitespace is tricky, we'll replace everything between {/* Top Header & Navigation Tabs */} and {activeSubTab === 'demographics' ? (

const fullTargetRegex = /\{\/\* Top Header & Navigation Tabs \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{activeSubTab === 'demographics' \? \(/;

analytics = analytics.replace(fullTargetRegex, replacement + "\\n\\n      {activeSubTab === 'demographics' ? (");

fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', analytics);
console.log('Fixed tabs wrapper');
