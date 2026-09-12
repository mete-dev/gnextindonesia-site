const fs = require('fs');
let code = fs.readFileSync('src/pages/studio/AnalyticsManager.tsx', 'utf-8');

// Ensure icons are imported
if (!code.includes('Smartphone')) {
  code = code.replace("} from 'lucide-react';", "  Smartphone, Monitor, Tablet, Globe2, Chrome, Navigation, } from 'lucide-react';");
}

// Prepare Website Stats UI
const websiteStatsUI = `
          {/* 2. TRAFFIC DEMOGRAPHICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Device Stats */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Smartphone size={16} className="text-neutral-500" />
                Perangkat (Device)
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span className="flex items-center gap-1.5"><Smartphone size={14}/> Mobile (HP)</span>
                    <span>72%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span className="flex items-center gap-1.5"><Monitor size={14}/> Desktop (PC/Laptop)</span>
                    <span>24%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span className="flex items-center gap-1.5"><Tablet size={14}/> Tablet</span>
                    <span>4%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Browser Stats */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Globe2 size={16} className="text-neutral-500" />
                Browser
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span className="flex items-center gap-1.5"><Chrome size={14}/> Google Chrome</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span className="flex items-center gap-1.5"><Globe2 size={14}/> Safari</span>
                    <span>18%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span className="flex items-center gap-1.5"><Globe2 size={14}/> Edge / Lainnya</span>
                    <span>14%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Stats */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Navigation size={16} className="text-neutral-500" />
                Lokasi IP (Negara/Daerah)
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span>Jawa Timur, ID</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span>DKI Jakarta, ID</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium text-neutral-700">
                    <span>Jawa Tengah & Lainnya</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
`;

const articleStatsUI = `
        {/* 2. ANALITIK DETIL & PERFORMA ARTIKEL / LAPORAN MANA ARTIKEL YANG RAME */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 mb-2">
            <label className="text-sm font-bold text-neutral-700">Filter Portal Artikel</label>
            <select
              value={articlePortalFilter}
              onChange={(e) => setArticlePortalFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="all">Semua Portal (Gabungan)</option>
              <option value="lentera-all">Gabungan Lentera Network</option>
              {ALL_PORTALS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {articlePortalFilter === 'all' 
                    ? 'Semua Portal' 
                    : articlePortalFilter === 'lentera-all' 
                    ? 'Gabungan Lentera Network' 
                    : ALL_PORTALS.find(p => p.id === articlePortalFilter)?.name}
                </span>
                <span className="text-xs font-bold text-neutral-400">
                  • Laporan Performa Pembaca
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
                Peringkat Artikel Paling Rame (Highest Traffic)
              </h3>
            </div>
            
            {/* Portal Stats Counter Cards */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-center min-w-[120px]">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Pembaca</span>
                <span className="text-lg font-display font-bold text-neutral-900">
                  {currentStats.totalViews.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-center min-w-[120px]">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Total Artikel
                </span>
                <span className="text-lg font-display font-bold text-neutral-900">
                  {currentStats.totalArticles.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Controls Bar: Search & Sort */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    placeholder="Cari judul artikel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs font-bold text-neutral-500 shrink-0">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 focus:outline-none"
                  >
                    <option value="views">🔥 Paling Rame (Views Tertinggi)</option>
                    <option value="date">📅 Tanggal Terbaru</option>
                    <option value="title">🔤 Judul (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Articles List Table */}
              {loading ? (
                <div className="py-12 text-center text-neutral-500 text-sm flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Memuat data analitik pembaca...</span>
                </div>
              ) : currentArticlesList.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-sm">
                  Belum ada artikel publikasi di portal ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentArticlesList.map((article, index) => {
                    const views = article.views || 0;
                    const percentage = Math.round((views / maxViewsInList) * 100);
                    let rankBadgeClass = 'bg-neutral-100 text-neutral-700';
                    let rankLabel = \`#\${index + 1}\`;
                    
                    if (index === 0) {
                      rankBadgeClass = 'bg-amber-400 text-neutral-950 font-black shadow-sm';
                      rankLabel = '🥇 #1 RAME';
                    } else if (index === 1) {
                      rankBadgeClass = 'bg-neutral-300 text-neutral-900 font-bold';
                      rankLabel = '🥈 #2';
                    } else if (index === 2) {
                      rankBadgeClass = 'bg-amber-100 text-amber-900 font-bold';
                      rankLabel = '🥉 #3';
                    }

                    let popularityBadge = (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1 shrink-0">
                        <Flame size={12} className="text-orange-500" />
                        🔥 Sangat Rame
                      </span>
                    );
                    
                    if (views < 1000 && views >= 500) {
                      popularityBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          📈 Rame
                        </span>
                      );
                    } else if (views < 500) {
                      popularityBadge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-600 shrink-0">
                          📄 Standard
                        </span>
                      );
                    }

                    return (
                      <div
                        key={article.id}
                        className="p-4 bg-white border border-neutral-200/90 rounded-2xl hover:border-neutral-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Left Info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Rank Badge */}
                          <span className={\`px-2.5 py-1 rounded-lg text-[11px] uppercase tracking-wider shrink-0 \${rankBadgeClass}\`}>
                            {rankLabel}
                          </span>
                          
                          {/* Thumbnail */}
                          <img
                            src={getArticleImg(article)}
                            alt={article.title}
                            className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover shrink-0 bg-neutral-100 border border-neutral-200"
                          />
                          
                          {/* Article Title & Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {popularityBadge}
                              {article.news_location && (
                                <span className="text-[10px] font-bold uppercase text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                                  📍 {article.news_location}
                                </span>
                              )}
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {article.date}
                              </span>
                            </div>
                            <h4 className="font-bold text-neutral-900 text-sm sm:text-base line-clamp-2 leading-snug">
                              {article.title}
                            </h4>
                          </div>
                        </div>

                        {/* Right Analytics Progress & Views Count */}
                        <div className="w-full sm:w-60 shrink-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-neutral-100 pt-3 sm:pt-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              Total Pembaca
                            </span>
                            <span className="text-base font-display font-bold text-neutral-900 flex items-center gap-1">
                              <Eye size={15} className="text-neutral-500" />
                              {views.toLocaleString('id-ID')}
                            </span>
                          </div>
                          
                          {/* Relative Traffic Bar */}
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className={\`h-full rounded-full transition-all duration-700 \${
                                index === 0
                                  ? 'bg-amber-500'
                                  : index < 3
                                  ? 'bg-neutral-800'
                                  : 'bg-neutral-400'
                              }\`}
                              style={{ width: \`\${Math.max(percentage, 5)}%\` }}
                            />
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

// Insert the new UI.
// We look for where activeSubTab === 'website' ends.
// The structure is:
// {activeSubTab === 'website' ? (
//    <div className="space-y-8">
//      ...
//      </div>
//    </div>
// ) : (
//    <div className="py-12 ...">Laporan artikel telah dihapus...</div>
// )}

const splitMarker = "            </div>\n          </div>\n        </div>\n      ) : (";

const parts = code.split(splitMarker);
if (parts.length === 2) {
  const rest = parts[1].split(")}");
  // rest[0] is the deleted message
  // rest.slice(1).join(")}") is the rest of the file
  const endPart = rest.slice(1).join(")}");

  // insert websiteStatsUI at the end of the website tab
  const newCode = parts[0] + "\n" + websiteStatsUI + "\n        </div>\n      ) : (\n" + articleStatsUI + "\n      )}" + endPart;
  
  fs.writeFileSync('src/pages/studio/AnalyticsManager.tsx', newCode);
  console.log("Success");
} else {
  console.log("Split marker not found");
}
