const fs = require('fs');

let content = fs.readFileSync('src/pages/studio/NewsManager.tsx', 'utf8');

const oldBlock = `            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Lokasi Berita</label>
              <select
                value={currentArticle.news_location || 'Nasional'}
                onChange={e => setCurrentArticle({ ...currentArticle, news_location: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium"
              >
                {(() => {
                  const portal = currentArticle.portal || (currentUser.role === 'Administrator' ? 'gnext' : (currentUser.portal || 'gnext'));
                  if (portal === 'yoikijatim') {
                    return (
                      <>
                        <option value="Jawa Timur">Jawa Timur (Umum)</option>
                        {yoikiLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </>
                    );
                  }
                  if (portal === 'lumajangtalks') {
                    return (
                      <>
                        <option value="Lumajang">Lumajang (Umum)</option>
                        {lumajangLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </>
                    );
                  }
                  return (
                    <>
                      <option value="Nasional">Nasional</option>
                      <optgroup label="Jawa Timur">
                        <option value="Jawa Timur">Jawa Timur (Umum)</option>
                        {yoikiLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Lumajang">
                        <option value="Lumajang">Lumajang (Umum)</option>
                        {lumajangLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </optgroup>
                    </>
                  );
                })()}
              </select>
            </div>`;

const newBlock = `            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">Lokasi Berita</label>
              {(() => {
                const portal = currentArticle.portal || (currentUser.role === 'Administrator' ? 'gnext' : (currentUser.portal || 'gnext'));
                if (portal === 'gnext') {
                  return (
                    <div className="relative">
                      <input
                        type="text"
                        value={showLocDropdown ? locSearch : (currentArticle.news_location || 'Nasional')}
                        onChange={e => {
                          setLocSearch(e.target.value);
                          setCurrentArticle({ ...currentArticle, news_location: e.target.value });
                          setShowLocDropdown(true);
                        }}
                        onFocus={() => {
                          setLocSearch('');
                          setShowLocDropdown(true);
                        }}
                        onBlur={() => setTimeout(() => setShowLocDropdown(false), 200)}
                        placeholder="Ketik nama kota..."
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium"
                      />
                      {showLocDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                           {filteredLocs.length > 0 ? filteredLocs.map(loc => (
                              <div 
                                key={loc}
                                className="px-4 py-2 hover:bg-neutral-100 cursor-pointer text-sm font-medium text-neutral-900"
                                onClick={() => {
                                   setCurrentArticle({ ...currentArticle, news_location: loc });
                                   setLocSearch('');
                                   setShowLocDropdown(false);
                                }}
                              >
                                {loc}
                              </div>
                           )) : (
                              <div className="px-4 py-2 text-sm text-neutral-500">Lokasi tidak ditemukan</div>
                           )}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <select
                    value={currentArticle.news_location || 'Nasional'}
                    onChange={e => setCurrentArticle({ ...currentArticle, news_location: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium"
                  >
                    {portal === 'yoikijatim' ? (
                      <>
                        <option value="Jawa Timur">Jawa Timur (Umum)</option>
                        {yoikiLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </>
                    ) : (
                      <>
                        <option value="Lumajang">Lumajang (Umum)</option>
                        {lumajangLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </>
                    )}
                  </select>
                );
              })()}
            </div>`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync('src/pages/studio/NewsManager.tsx', content);
  console.log('Successfully patched select block');
} else {
  console.log('Failed to find oldBlock');
}
