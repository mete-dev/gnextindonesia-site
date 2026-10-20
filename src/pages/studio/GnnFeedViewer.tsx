import React, { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Globe, CheckCircle2, Search, Radio, Filter, Eye } from 'lucide-react';
import { fetchGNNArticles } from '../../lib/gnnApi';
import { User } from './types';

export default function GnnFeedViewer({ currentUser }: { currentUser: User }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const loadData = async (force: boolean = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchGNNArticles(50, force);
      setArticles(data || []);
    } catch (e) {
      console.error('Failed to load GNN feed in Studio:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ['Semua', ...Array.from(new Set(articles.map(a => a.category_name || a.category || 'Nusantara').filter(Boolean)))];

  const filteredArticles = articles.filter(a => {
    const matchesSearch = !searchQuery || 
      (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.news_location || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const catName = a.category_name || a.category || 'Nusantara';
    const matchesCat = selectedCategory === 'Semua' || catName.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Live Feed Terhubung
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 leading-snug">
            Feed Artikel Good News Nusantara
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            Artikel berita di situs Gnext Indonesia disinkronkan secara otomatis dan langsung dari API resmi Good News Nusantara (<code className="text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-xs">goodnewsnusantara.my.id</code>).
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shrink-0 shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Menyinkronkan...' : 'Sinkronkan Ulang'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul artikel atau kota..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-neutral-400 shrink-0 hidden sm:block" />
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table / List */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-neutral-500 font-medium">Memuat data feed dari Good News Nusantara...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-xs font-medium">
            Tidak ada artikel yang sesuai dengan filter pencarian.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredArticles.map((article, idx) => {
              const viewUrl = `/news/${encodeURIComponent((article.category_name || 'kabar-baik').toLowerCase())}/${encodeURIComponent(article.slug || '')}`;
              
              return (
                <div key={article.id || idx} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <img
                      src={article.cover_image || article.image}
                      alt={article.title}
                      className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover shrink-0 bg-neutral-100 border border-neutral-200/60"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200/60 px-2 py-0.5 rounded-md">
                          {article.category_name || article.category || 'Nusantara'}
                        </span>
                        <span className="text-xs text-neutral-300">•</span>
                        <span className="text-[11px] font-medium text-neutral-600">
                          {article.news_location || 'Nasional'}
                        </span>
                        <span className="text-xs text-neutral-300">•</span>
                        <span className="text-[11px] text-neutral-400">
                          {article.date}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-neutral-900 leading-snug line-clamp-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                        {article.summary || article.content?.replace(/<[^>]+>/g, ' ').substring(0, 120)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                      title="Lihat di Gnext News"
                    >
                      <Eye size={13} />
                      <span>Lihat Artikel</span>
                    </a>
                    {article.external_url && (
                      <a
                        href={article.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                        title="Buka di Good News Nusantara"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
