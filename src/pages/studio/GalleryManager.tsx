import React, { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Calendar, Globe, User, ArrowRight, Copy, Check, ExternalLink, HelpCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User as UserType } from './types';
import { getPortalById, lenteraNetworks } from '../../lib/portals';

interface GalleryItem {
  cover_image: string;
  image_caption: string;
  image_credit: string;
  articles: Array<{
    id: string;
    title: string;
    date: string;
    portal: string;
  }>;
}

export default function GalleryManager({ currentUser }: { currentUser: UserType }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortal, setSelectedPortal] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      // Fetch articles with covers
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .not('cover_image', 'is', null)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        // Group by unique cover_image
        const grouped: Record<string, GalleryItem> = {};
        
        data.forEach((article: any) => {
          const imgUrl = article.cover_image;
          if (!imgUrl || imgUrl.trim() === '') return;

          // Normalize
          const caption = article.image_caption || '';
          const credit = article.image_credit || '';
          const portal = article.portal || 'gnext';

          if (!grouped[imgUrl]) {
            grouped[imgUrl] = {
              cover_image: imgUrl,
              image_caption: caption || 'Foto Berita Tanpa Keterangan',
              image_credit: credit || 'Tidak ada kredit foto',
              articles: []
            };
          }

          // Push article reference
          grouped[imgUrl].articles.push({
            id: article.id,
            title: article.title,
            date: article.date,
            portal: portal
          });
        });

        // Convert to array
        const galleryArray = Object.values(grouped);
        setItems(galleryArray);
      }
    } catch (err) {
      console.error('Gagal mengambil histori galeri cover:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter items based on search query and selected portal
  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    
    // Search in caption, credit, or any of the article titles
    const matchesSearch = 
      item.image_caption.toLowerCase().includes(query) ||
      item.image_credit.toLowerCase().includes(query) ||
      item.articles.some(a => a.title.toLowerCase().includes(query));

    // Filter by portal
    const matchesPortal = 
      selectedPortal === 'all' || 
      item.articles.some(a => a.portal === selectedPortal);

    return matchesSearch && matchesPortal;
  });

  // Unique portals present in the gallery to populate filter
  const portalsInGallery = Array.from(
    new Set(items.flatMap(item => item.articles.map(a => a.portal)))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-900 text-white rounded-lg">
                <ImageIcon size={20} />
              </div>
              <h1 className="text-xl font-display font-black tracking-tight text-neutral-900">Galeri Media Cover</h1>
            </div>
            <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
              Jelajahi dan gunakan kembali histori foto cover berita yang tersimpan di database. Sistem mendeteksi foto dari artikel yang telah diterbitkan atau di-draft otomatis.
            </p>
          </div>
          <button
            onClick={loadGallery}
            className="px-4 py-2 text-xs font-semibold uppercase bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-all self-start md:self-auto border border-neutral-200"
          >
            Segarkan Galeri
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari foto berdasarkan keterangan, kredit, atau judul artikel..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Portal Filter */}
        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
          <Globe size={16} className="text-neutral-400 hidden xs:inline" />
          <select
            value={selectedPortal}
            onChange={e => setSelectedPortal(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 font-medium text-neutral-700"
          >
            <option value="all">Semua Portal Wilayah</option>
            <option value="gnext">GNEXT NEWS (Nasional)</option>
            <option value="yoikijatim">YO IKI JATIM</option>
            <option value="lumajangtalks">LUMAJANG TALKS</option>
            {lenteraNetworks.map(net => (
              <option key={net.id} value={net.id}>
                {net.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, idx) => (
            <div key={idx} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs animate-pulse">
              <div className="aspect-video bg-neutral-100" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 bg-neutral-100 rounded w-3/4" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-100">
            <ImageIcon size={22} />
          </div>
          <h3 className="text-sm font-bold text-neutral-800">Tidak ada foto ditemukan</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedPortal !== 'all' 
              ? 'Coba ganti filter pencarian atau portal Anda untuk menemukan foto cover.'
              : 'Belum ada foto cover berita yang tersimpan di dalam database Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item, idx) => {
            const firstArticle = item.articles[0];
            const portalObj = firstArticle ? getPortalById(firstArticle.portal) : null;
            const isBase64 = item.cover_image.startsWith('data:');

            return (
              <div
                key={idx}
                onClick={() => setSelectedItem(item)}
                className="group bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-md rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col h-full"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-neutral-100 overflow-hidden shrink-0">
                  <img
                    src={item.cover_image}
                    alt={item.image_caption}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Base64 Badge / size badge */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-1.5 py-0.5 bg-neutral-900/85 backdrop-blur-xs text-[9px] text-white rounded font-bold uppercase tracking-wider">
                      {isBase64 ? 'Compressed' : 'Remote'}
                    </span>
                    {portalObj && (
                      <span className="px-1.5 py-0.5 bg-red-600/85 backdrop-blur-xs text-[9px] text-white rounded font-semibold truncate max-w-[100px]">
                        {portalObj.name.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-800 line-clamp-2 min-h-[2rem]" title={item.image_caption}>
                      {item.image_caption}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      Kredit: {item.image_credit}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                    <span className="truncate max-w-[110px]" title={firstArticle?.title}>
                      Art: {firstArticle?.title}
                    </span>
                    <span className="shrink-0">
                      {item.articles.length}x Pakai
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200/95 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-800">Detail Galeri Foto</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Big Image Panel */}
              <div className="relative aspect-video rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
                <img
                  src={selectedItem.cover_image}
                  alt={selectedItem.image_caption}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Keterangan Foto (Caption)</span>
                    <p className="text-sm font-bold text-neutral-800 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
                      {selectedItem.image_caption}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Kredit Sumber Foto</span>
                    <p className="text-xs font-semibold text-neutral-600 bg-neutral-50 px-3 py-2.5 rounded-xl border border-neutral-200/60">
                      {selectedItem.image_credit}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Riwayat Penggunaan Berita ({selectedItem.articles.length})</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedItem.articles.map((art, idx) => {
                        const portObj = getPortalById(art.portal);
                        return (
                          <div key={idx} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/40 text-xs flex flex-col gap-1.5 hover:bg-neutral-100/60">
                            <p className="font-bold text-neutral-800 line-clamp-1">{art.title}</p>
                            <div className="flex items-center justify-between text-[10px] text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {art.date}
                              </span>
                              <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded font-semibold text-[8px] uppercase">
                                {portObj?.name || art.portal}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Copy actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleCopy(selectedItem.cover_image)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all shadow-xs"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>Data Foto Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Salin URL / Data Base64 Foto</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-neutral-400 text-center mt-2">
                      Gunakan tombol ini untuk menyalin data media cover agar bisa langsung disematkan ke berita baru.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
