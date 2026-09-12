const fs = require('fs');

const replacement = `
        <div className="space-y-8">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">Performa Artikel</h3>
                <p className="text-sm text-neutral-500">Analisis popularitas dan trafik per artikel.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Cari artikel..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-lg text-sm w-[200px] focus:ring-2 focus:ring-neutral-200"
                  />
                </div>
                <select
                  value={articlePortalFilter}
                  onChange={e => setArticlePortalFilter(e.target.value)}
                  className="px-3 py-2 bg-neutral-100 border-none rounded-lg text-sm font-medium text-neutral-700 focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="all">Semua Portal</option>
                  <option value="gnext">Gnext News</option>
                  <option value="lentera-all">Lentera Network (Semua)</option>
                  <option value="yoikijatim">Yo Iki Jatim</option>
                  <option value="lumajangtalks">Lumajang Talks</option>
                </select>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-neutral-100 border-none rounded-lg text-sm font-medium text-neutral-700 focus:ring-2 focus:ring-neutral-200"
                >
                  <option value="views">Paling Rame (Views)</option>
                  <option value="date">Terbaru</option>
                  <option value="title">A-Z</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>
            ) : currentArticlesList.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-sm bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                Belum ada artikel publikasi.
              </div>
            ) : (
              <div className="space-y-3">
                {currentArticlesList.map((article, index) => {
                  const views = article.views || 0;
                  const percentage = Math.round((views / maxViewsInList) * 100);
                  let rankBadgeClass = 'bg-neutral-100 text-neutral-700';
                  if (index === 0) rankBadgeClass = 'bg-amber-400 text-neutral-950 font-black shadow-sm';
                  else if (index < 3) rankBadgeClass = 'bg-neutral-900 text-white font-bold';

                  return (
                    <div key={article.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50 transition-colors group">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={\`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm \${rankBadgeClass}\`}>
                          #{index + 1}
                        </div>
                        <div className="flex gap-4 flex-1 min-w-0">
                          <img src={getArticleImg(article)} alt="" className="w-16 h-16 rounded-lg object-cover bg-neutral-200 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-neutral-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">{article.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 uppercase">
                                {article.portal || 'gnext'}
                              </span>
                              <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                                <Calendar size={12} /> {new Date(article.date || article.created_at || new Date()).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="sm:w-[200px] shrink-0 flex flex-col justify-center gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                            <Eye size={14} /> Total Views
                          </span>
                          <span className="text-sm font-bold text-neutral-900">{views.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className={\`h-full rounded-full transition-all duration-1000 \${index === 0 ? 'bg-amber-400' : 'bg-neutral-900'}\`} style={{ width: \`\${percentage}%\` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
`;

let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');
code = code.replace(/<div className="py-12 text-center text-neutral-500 text-sm">Laporan artikel telah dihapus sesuai permintaan\.<\/div>/, replacement.trim());
fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', code);
console.log('Restored article report');
