import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  Flame,
  Clock,
  Search,
  TrendingUp,
  Radio,
  BookOpen,
  Filter,
  Check,
  MapPin,
  Sparkles,
  ChevronRight,
  Calendar,
  X,
  Share2,
  Newspaper
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { Article } from './studio/types';
import { 
  getBeritaUtama, 
  getTerpopulerHarian, 
  getTerpopulerMingguan, 
  getSorotanUtama, 
  parseArticleDate, 
  getLatestTickerArticles, 
  formatDate 
} from '../lib/trending';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { NewsFeedSkeleton } from '../components/NewsSkeletons';
import { trackPortalVisit } from '../lib/tracker';
import { getHijriDate } from '../lib/dateUtils';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';

export const financeFallbackArticles: Article[] = [
  {
    id: 'finance-1',
    title: 'Bank Indonesia Pertahankan Suku Bunga Acuan BI Rate di Level 6,00 Persen',
    content: 'Rapat Dewan Gubernur (RDG) Bank Indonesia (BI) memutuskan untuk mempertahankan BI Rate pada level 6,00%, suku bunga Deposit Facility sebesar 5,25%, dan suku bunga Lending Facility sebesar 6,75% untuk menjaga stabilitas makroekonomi.',
    categoryId: 'cat-kabar-fiskal',
    category_id: 'cat-kabar-fiskal',
    authorId: 'redaksi-finance',
    status: 'published',
    date: '15 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    views: 4210,
    news_location: 'Jakarta',
    portal: 'finance',
    sub_category: 'Fiskal'
  } as any,
  {
    id: 'finance-2',
    title: 'IHSG Cetak Rekor Baru, Saham Perbankan Jadi Motor Penggerak Utama',
    content: 'Indeks Harga Saham Gabungan (IHSG) kembali mencetak rekor tertinggi sepanjang masa (All Time High), didorong oleh aliran modal asing (capital inflow) yang masuk deras ke saham-saham perbankan berkapitalisasi besar (big caps).',
    categoryId: 'cat-bursa-emiten',
    category_id: 'cat-bursa-emiten',
    authorId: 'redaksi-finance',
    status: 'published',
    date: '14 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    views: 5120,
    news_location: 'Nasional',
    portal: 'finance',
    sub_category: 'Bursa Saham'
  } as any,
  {
    id: 'finance-3',
    title: 'Tren Investasi Emas Fisik dan Digital Melonjak di Kalangan Gen Z',
    content: 'Generasi Z (Gen Z) mulai beralih ke investasi emas, baik fisik maupun digital. Hal ini didorong oleh kemudahan akses melalui platform fintech dan sifat emas sebagai aset pelindung nilai (safe haven).',
    categoryId: 'cat-aset-alternatif',
    category_id: 'cat-aset-alternatif',
    authorId: 'redaksi-finance',
    status: 'published',
    date: '12 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    views: 3890,
    news_location: 'Global',
    portal: 'finance',
    sub_category: 'Komoditas'
  } as any,
  {
    id: 'finance-4',
    title: 'Pemerintah Kucurkan KUR Rp300 Triliun untuk Dorong Digitalisasi UMKM',
    content: 'Pemerintah resmi menambah plafon Kredit Usaha Rakyat (KUR) menjadi Rp300 triliun pada tahun 2026. Dana ini diprioritaskan bagi pelaku UMKM yang mulai melakukan transformasi digital dalam model bisnis mereka.',
    categoryId: 'cat-sentra-umkm',
    category_id: 'cat-sentra-umkm',
    authorId: 'redaksi-finance',
    status: 'published',
    date: '10 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    views: 4980,
    news_location: 'Surabaya',
    portal: 'finance',
    sub_category: 'Kredit Usaha'
  } as any,
  {
    id: 'finance-5',
    title: 'OJK Terbitkan Aturan Baru Fintech P2P Lending untuk Lindungi Konsumen',
    content: 'Otoritas Jasa Keuangan (OJK) merilis aturan terbaru terkait industri layanan pendanaan bersama berbasis teknologi informasi (fintech P2P lending) guna memperketat manajemen risiko dan meningkatkan pelindungan konsumen.',
    categoryId: 'cat-perbankan-fintech',
    category_id: 'cat-perbankan-fintech',
    authorId: 'redaksi-finance',
    status: 'published',
    date: '08 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    views: 3120,
    news_location: 'Yogyakarta',
    portal: 'finance',
    sub_category: 'Khas & Sejarah'
  } as any
];

const getBasePath = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('finance.')) return '';
    if (window.location.pathname.startsWith('/finance')) return '/finance';
  }
  return '/finance';
};

// Maps category slugs/names into friendly readable labels
const mainCategoriesMapping: Record<string, string> = {
  'Semua': 'Semua',
  'Kabar Fiskal': 'Kabar Fiskal',
  'Perbankan & Fintech': 'Perbankan & Fintech',
  'Bursa & Emiten': 'Bursa & Emiten',
  'Aset Alternatif': 'Aset Alternatif',
  'Dapur Bisnis': 'Dapur Bisnis',
  'Sentra UMKM': 'Sentra UMKM',
  'Cerdas Finansial': 'Cerdas Finansial'
};

const subCategoriesMap: Record<string, string[]> = {
  'Kabar Fiskal': ['Kebijakan Fiskal', 'Pajak & Anggaran', 'Ekonomi Makro'],
  'Perbankan & Fintech': ['Perbankan Syariah & Konvensional', 'Fintech P2P', 'Digital Banking'],
  'Bursa & Emiten': ['Saham & IHSG', 'Obligasi', 'Kinerja Emiten'],
  'Aset Alternatif': ['Emas & Komoditas', 'Kripto & Blockchain', 'Properti'],
  'Dapur Bisnis': ['Strategi Bisnis', 'Ekspansi Corporate', 'Manajemen'],
  'Sentra UMKM': ['Kredit Usaha (KUR)', 'Pendampingan UMKM', 'Digitalisasi UMKM'],
  'Cerdas Finansial': ['Perencanaan Keuangan', 'Tips Investasi', 'Literasi Finansial']
};

export default function GnextFinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeSubCategory, setActiveSubCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularTab, setPopularTab] = useState<'harian' | 'mingguan'>('harian');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShareArticle = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();
    const catName = getCategoryFriendlyName(article);
    const url = `${window.location.origin}${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };



  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  useEffect(() => {
    const qParam = searchParams.get('search') || searchParams.get('q');
    if (qParam !== null) {
      setSearchQuery(qParam);
    }

    const catParam = searchParams.get('category');
    const subParam = searchParams.get('subcategory');

    if (catParam) {
      const decodedCat = decodeURIComponent(catParam).replace(/-/g, ' ');
      // Find matching main category
      const matched = Object.keys(mainCategoriesMapping).find(
        k => k.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === decodedCat.toLowerCase().trim()
      );
      if (matched) {
        setActiveCategory(matched);
      } else {
        setActiveCategory('Semua');
      }
    } else {
      setActiveCategory('Semua');
    }

    if (subParam) {
      setActiveSubCategory(decodeURIComponent(subParam));
    } else {
      setActiveSubCategory('Semua');
    }
  }, [searchParams]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubCategory('Semua'); // reset sub-category when changing main
    if (cat === 'Semua') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slugify(cat) });
    }
  };

  const handleSubCategoryClick = (subCat: string) => {
    setActiveSubCategory(subCat);
    const params: Record<string, string> = { category: slugify(activeCategory) };
    if (subCat !== 'Semua') {
      params.subcategory = encodeURIComponent(subCat);
    }
    setSearchParams(params);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { articles: dbArticles, categories: dbCategories } = await fetchPublishedArticlesAndMetadata();

      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories);
      }

      let fetched: Article[] = [];
      if (dbArticles && dbArticles.length > 0) {
        fetched = filterValidArticles(dbArticles).map((a: any) => ({
          ...a,
          categoryId: a.category_id || a.categoryId,
          authorId: a.author_id || a.authorId,
          news_location: a.news_location || 'Nasional',
          cover_image: a.cover_image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
          sub_category: a.sub_category || a.subCategory || 'Kabar Ummah'
        }));
      }

      // Filter articles specifically belonging to finance portal or having finance categories
      const financeArticles = fetched.filter(a => {
        const p = (a.portal || '').toLowerCase();
        if (p === 'finance') return true;
        const catId = a.categoryId || a.category_id || '';
        const catName = dbCategories.find((c: any) => c.id === catId)?.name?.toLowerCase() || '';
        return catName.includes('finance') || catName.includes('keuangan') || catName.includes('ekonomi') || catName.includes('bisnis') || catName.includes('saham');
      });

      const finalArticles = financeArticles.length > 0 
        ? financeArticles 
        : filterValidArticles(financeFallbackArticles);

      setArticles(finalArticles);
    } catch (err) {
      console.error('Gnext Finance news load error:', err);
      setArticles(filterValidArticles(financeFallbackArticles));
    } finally {
      setLoading(false);
    }
  };

  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80';

  const getArticleImage = (article?: Article | null) => {
    if (!article) return DEFAULT_COVER;
    const cover = (article as any).cover_image;
    if (typeof cover === 'string' && cover.trim()) return cover.trim();
    return DEFAULT_COVER;
  };

  const getCategoryFriendlyName = (article: Article) => {
    const mainCatMap: Record<string, string> = {
      'cat-kabar-fiskal': 'Kabar Fiskal',
      'cat-perbankan-fintech': 'Perbankan & Fintech',
      'cat-bursa-emiten': 'Bursa & Emiten',
      'cat-aset-alternatif': 'Aset Alternatif',
      'cat-dapur-bisnis': 'Dapur Bisnis',
      'cat-sentra-umkm': 'Sentra UMKM',
      'cat-cerdas-finansial': 'Cerdas Finansial',
    };
    const catId = article.categoryId || '';
    if (mainCatMap[catId]) return mainCatMap[catId];
    
    // Fallback search database categories
    const found = categories.find(c => c.id === catId);
    if (found) return found.name;
    return 'Kabar Fiskal';
  };

  // Filter based on active main category, sub category, and search query
  const filteredArticles = articles.filter(a => {
    const friendlyCategoryName = getCategoryFriendlyName(a);
    const matchesCategory = activeCategory === 'Semua' || friendlyCategoryName.toLowerCase() === activeCategory.toLowerCase();
    
    const articleSubCat = (a as any).sub_category || '';
    const matchesSubCategory = activeSubCategory === 'Semua' || articleSubCat.toLowerCase() === activeSubCategory.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  // 1. Berita Utama: Berita pembaca terbanyak / headline finance
  const beritaUtamaList = getBeritaUtama(articles, 'finance');
  const heroMain = beritaUtamaList[0] || null;
  const heroSub = beritaUtamaList.slice(1, 4);

  // 2. Terpopuler: Harian vs Mingguan
  const popularHarian = getTerpopulerHarian(articles, 5);
  const popularMingguan = getTerpopulerMingguan(articles, 5);
  const popularArticles = popularTab === 'harian' ? popularHarian : popularMingguan;

  // 3. Sorotan Utama: Berita tanding / trending finance
  const heroIds = new Set([heroMain?.id, ...heroSub.map(s => s.id)].filter(Boolean));
  const sorotanUtamaList = getSorotanUtama(articles, 5, Array.from(heroIds));

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hijriDate = getHijriDate();
  const [showHijri, setShowHijri] = useState(true);

  useEffect(() => {
    trackPortalVisit('finance');
    const timer = setInterval(() => {
      setShowHijri(prev => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans selection:bg-finance-600 selection:text-white overflow-x-hidden">
      <SEO
        title="Gnext Finance - Berita Ekonomi, Bisnis, Perbankan & UMKM Terkini"
        description="Portal berita seputar ekonomi makro, investasi, perbankan, fintech, bursa, saham, aset kripto, serta informasi bisnis dan pengembangan UMKM."
        path="/finance"
      />
      <Navbar 
        portal="finance" 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        categories={['Semua', 'Kabar Fiskal', 'Perbankan & Fintech', 'Bursa & Emiten', 'Aset Alternatif', 'Dapur Bisnis', 'Sentra UMKM', 'Cerdas Finansial']}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryClick}
        tickerArticles={articles.length > 0 ? getLatestTickerArticles(articles, 5) : []}
        todayFormatted={todayFormatted}
        getCategoryName={getCategoryFriendlyName}
        getBasePath={getBasePath}
      />

      <main className="pt-28 pb-20">

        {loading ? (
          <NewsFeedSkeleton portal="finance" />
        ) : (
          <>
            {/* CNN INDONESIA STYLE PREMIUM HOME GRID */}
            {heroMain && !searchQuery && activeCategory === 'Semua' && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 flex flex-col gap-6">
                
                {/* 1. PRIMARY SPLIT HEADLINE GRID (Left Hero Block + Right Popular Column) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT PRIMARY BLOCK (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Compact Hero Article Card */}
                    <Link
                      to={`${getBasePath()}/${slugify(getCategoryFriendlyName(heroMain))}/${slugify(heroMain.title)}`}
                      className="group bg-white p-3.5 sm:p-4 rounded-xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-finance-400 transition-all duration-300 flex items-center justify-between gap-3 sm:gap-4"
                    >
                      {/* Left Side: Editorial Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-finance-600 text-white text-[10px] font-black uppercase tracking-wider">
                              BERITA UTAMA
                            </span>
                            <span className="px-2 py-0.5 rounded bg-finance-50 text-finance-800 text-[10px] font-bold uppercase tracking-wider border border-finance-200">
                              {getCategoryFriendlyName(heroMain)}
                            </span>
                          </div>
                          
                          <h2 className="text-sm sm:text-base md:text-lg font-normal text-neutral-900 leading-snug tracking-tight group-hover:text-finance-600 transition-colors duration-200 line-clamp-2">
                            {heroMain.title}
                          </h2>
                          
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 hidden sm:block">
                            {getCleanExcerpt(heroMain.content, 110)}
                          </p>
                        </div>
                        
                        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-semibold uppercase tracking-wide text-finance-600">
                            📍 {heroMain.news_location || 'Nasional'}
                          </span>
                          <span className="font-medium flex items-center gap-1 font-calibri">
                            <Clock size={12} />
                            {formatDate(heroMain.date, (heroMain as any).created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Visual Cover (Controlled compact thumbnail) */}
                      <div className="w-28 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 rounded-lg overflow-hidden shrink-0 bg-neutral-950 relative shadow-2xs">
                        <BlurImage
                          src={getArticleImage(heroMain)}
                          alt={heroMain.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </Link>

                    {/* Secondary Horizontal Items Side-By-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {heroSub.slice(0, 2).map((sub, idx) => (
                        <Link
                          key={sub.id || idx}
                          to={`${getBasePath()}/${slugify(getCategoryFriendlyName(sub))}/${slugify(sub.title)}`}
                          className="group bg-white p-3 rounded-xl border border-neutral-200 flex gap-3 hover:border-finance-400 hover:shadow-2xs transition-all items-center"
                        >
                          <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg overflow-hidden shrink-0 bg-neutral-950 relative">
                            <BlurImage
                              src={getArticleImage(sub)}
                              alt={sub.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col justify-between min-w-0 flex-1">
                            <div>
                              <span className="text-[9px] font-bold text-finance-600 uppercase tracking-wider block mb-0.5">
                                {getCategoryFriendlyName(sub)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-finance-600 transition-colors">
                                {sub.title}
                              </h4>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-calibri flex items-center gap-1 mt-1">
                              <Clock size={10} />
                              {sub.news_location || 'Nasional'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                  </div>

                  {/* RIGHT SIDEBAR POPULAR LIST (4 Cols - "TERPOPULER FINANSIAL") */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-finance-600 pb-3 mb-4 gap-2">
                        <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                          <TrendingUp size={18} className="text-finance-600" />
                          <span>TERPOPULER FINANSIAL</span>
                        </h3>
                        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                          <button
                            onClick={() => setPopularTab('harian')}
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md transition-all uppercase cursor-pointer ${
                              popularTab === 'harian'
                                ? 'bg-finance-600 text-white shadow-xs'
                                : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                          >
                            24 Jam
                          </button>
                          <button
                            onClick={() => setPopularTab('mingguan')}
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md transition-all uppercase cursor-pointer ${
                              popularTab === 'mingguan'
                                ? 'bg-finance-600 text-white shadow-xs'
                                : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                          >
                            7 Hari
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col divide-y divide-neutral-100">
                        {popularArticles.slice(0, 5).map((pop, idx) => (
                          <Link
                            key={pop.id || idx}
                            to={`${getBasePath()}/${slugify(getCategoryFriendlyName(pop))}/${slugify(pop.title)}`}
                            className="py-3.5 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                          >
                            <span className={`text-2xl font-black font-display shrink-0 w-8 text-center ${
                              idx === 0 ? 'text-finance-600' : 'text-neutral-400'
                            }`}>
                              0{idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-finance-600 uppercase tracking-wider block mb-0.5">
                                {getCategoryFriendlyName(pop)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-finance-600 transition-colors">
                                {pop.title}
                              </h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. MID GRID HEADLINES ("RAGAM KABAR FINANSIAL") */}
                <div className="border-t border-neutral-200 pt-6">
                  <div className="pb-3 border-b border-neutral-200 mb-4">
                    <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Newspaper size={16} className="text-finance-600" />
                      <span>RAGAM KABAR FINANSIAL</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(() => {
                      const heroIds = new Set([heroMain?.id, ...heroSub.map(s => s.id)].filter(Boolean));
                      const distinctArticles = articles.filter(a => !heroIds.has(a.id));
                      const listToDisplay = distinctArticles.length >= 3 ? distinctArticles.slice(0, 3) : articles.slice(3, 6);
                      return listToDisplay.map((art, idx) => (
                        <Link
                          key={art.id || idx}
                          to={`${getBasePath()}/${slugify(getCategoryFriendlyName(art))}/${slugify(art.title)}`}
                          className="group flex flex-col gap-2 bg-white p-4 rounded-xl border border-neutral-200 hover:border-finance-400 transition-all shadow-2xs"
                        >
                          <h4 className="text-sm sm:text-base font-normal text-neutral-900 leading-snug group-hover:text-finance-600 transition-colors line-clamp-2">
                            {art.title}
                          </h4>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                            <span className="text-finance-600 font-extrabold uppercase tracking-wider block">
                              {getCategoryFriendlyName(art)}
                            </span>
                            <span className="font-calibri">{art.news_location || 'Nasional'}</span>
                          </div>
                        </Link>
                      ));
                    })()}
                  </div>
                </div>

                {/* 3. BLUE ACCENT SPECIAL SEGMENT ("SOROTAN UTAMA FINANSIAL") */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-2">
                  <div 
                    className="lg:col-span-12 bg-finance-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col gap-6"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)' }}
                  >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-finance-500/50 pb-3 z-10">
                      <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-widest flex items-center gap-2 text-white">
                        <span className="w-2.5 h-2.5 bg-finance-300 rounded-full animate-ping" />
                        <span>SOROTAN UTAMA FINANSIAL</span>
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-white/30 transition-colors">
                        FINANCE UTAMA
                      </span>
                    </div>

                    {sorotanUtamaList.length > 0 ? (
                      (() => {
                        const focusArticle = sorotanUtamaList[0];
                        const subSorotan = sorotanUtamaList.slice(1, 4).length > 0 
                          ? sorotanUtamaList.slice(1, 4) 
                          : articles.filter(a => a.id !== focusArticle?.id).slice(0, 3);

                        return (
                          <>
                            <div className="flex flex-col md:flex-row gap-6 items-stretch w-full h-full z-10">
                              {/* Focus Image */}
                              <Link 
                                to={`${getBasePath()}/${slugify(getCategoryFriendlyName(focusArticle))}/${slugify(focusArticle.title)}`}
                                className="w-full md:w-[45%] rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative shadow-md group block h-auto self-stretch min-h-[200px]"
                              >
                                <BlurImage
                                  src={getArticleImage(focusArticle)}
                                  alt={focusArticle.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </Link>

                              {/* Focus Content Text */}
                              <div className="flex flex-col justify-between flex-1 h-full py-0.5">
                                <div>
                                  <span className="text-[9px] font-black text-finance-300 uppercase tracking-widest block mb-1">
                                    {getCategoryFriendlyName(focusArticle)}
                                  </span>
                                  <Link 
                                    to={`${getBasePath()}/${slugify(getCategoryFriendlyName(focusArticle))}/${slugify(focusArticle.title)}`}
                                    className="hover:text-finance-200 transition-colors block"
                                  >
                                    <h4 className="text-xl sm:text-2xl md:text-3xl font-normal leading-tight mb-2 drop-shadow-sm text-white">
                                      {focusArticle.title}
                                    </h4>
                                  </Link>
                                  <p className="text-xs text-finance-100 leading-relaxed line-clamp-3 font-normal">
                                    {getCleanExcerpt(focusArticle.content, 150)}
                                  </p>
                                </div>
                                <span className="text-[10px] text-finance-200 mt-4 font-mono block">
                                  {focusArticle.news_location || 'Nasional'} • {formatDate(focusArticle.date, (focusArticle as any).created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Blue Box Quick-Links footer */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-finance-500/50 pt-4 z-10 text-xs">
                              {subSorotan.map((art, idx) => (
                                <Link
                                  key={art.id || idx}
                                  to={`${getBasePath()}/${slugify(getCategoryFriendlyName(art))}/${slugify(art.title)}`}
                                  className="hover:text-finance-200 transition-all font-normal line-clamp-2 leading-snug border-l-2 border-finance-300 pl-3.5 text-white"
                                >
                                  {art.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <div className="z-10 py-10 text-center text-finance-100 font-semibold">
                        Koleksi artikel sorotan utama finansial sedang disiapkan redaksi.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* MAIN PORTAL BODY (8-COL FEED + 4-COL SIDEBAR GRID MATCHING NEWS.TSX) */}
            <section id="news-feed-container" className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6 scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT FEED (8 COLS) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                  {/* SUB-CATEGORY FILTERS */}
                  {activeCategory !== 'Semua' && subCategoriesMap[activeCategory] && (
                    <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-2xs">
                      <div className="flex items-center gap-2 mb-2">
                        <Filter size={12} className="text-finance-600" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sub Kategori {activeCategory}</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth">
                        <button
                          onClick={() => handleSubCategoryClick('Semua')}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                            activeSubCategory === 'Semua'
                              ? 'bg-finance-600 text-white border-finance-600 shadow-xs'
                              : 'bg-neutral-50 text-neutral-600 hover:text-finance-600 hover:bg-finance-50 border-neutral-200'
                          }`}
                        >
                          Semua
                        </button>
                        {subCategoriesMap[activeCategory].map((subCat) => (
                          <button
                            key={subCat}
                            onClick={() => handleSubCategoryClick(subCat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                              activeSubCategory === subCat
                                ? 'bg-finance-600 text-white border-finance-600 shadow-xs'
                                : 'bg-neutral-50 text-neutral-600 hover:text-finance-600 hover:bg-finance-50 border-neutral-200'
                            }`}
                          >
                            {subCat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b-2 border-finance-600 pb-2 bg-white px-4 py-3 rounded-t-xl shadow-xs">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                      <Flame size={18} className="text-finance-600" />
                      <span>
                        {searchQuery
                          ? `PENCARIAN: "${searchQuery}"`
                          : activeCategory === 'Semua' 
                            ? 'BERITA TERKINI' 
                            : `KATEGORI: ${activeCategory}`
                        }
                      </span>
                    </h3>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-bold text-finance-600 hover:text-finance-800 transition-colors uppercase flex items-center gap-1"
                      >
                        <X size={14} />
                        <span>Hapus Pencarian</span>
                      </button>
                    )}
                  </div>

                  {/* Articles Feed */}
                  {filteredArticles.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <Search size={20} />
                      </div>
                      <p className="text-sm text-neutral-600 font-medium">
                        Tidak ditemukan berita untuk kriteria ini.
                      </p>
                      <button
                        onClick={() => {
                          setActiveCategory('Semua');
                          setActiveSubCategory('Semua');
                          setSearchQuery('');
                        }}
                        className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <AnimatePresence mode="popLayout">
                        {filteredArticles.slice(0, 16).map((article) => {
                          const catName = getCategoryFriendlyName(article);
                          const image = getArticleImage(article);

                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.3 }}
                              key={article.id}
                              className="group bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 hover:border-finance-400 hover:shadow-md transition-all"
                            >
                              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch h-full">
                                {/* Article Image */}
                                <Link
                                  to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                  className="w-full aspect-[16/10] sm:aspect-none sm:w-48 sm:h-auto sm:self-stretch rounded-xl overflow-hidden shrink-0 bg-neutral-200 relative group-hover:opacity-95"
                                >
                                  <BlurImage
                                    src={image}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10 pointer-events-none">
                                    <span className="bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                      {catName}
                                    </span>
                                    {article.news_location && (
                                      <span className="bg-finance-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
                                        {article.news_location}
                                      </span>
                                    )}
                                  </div>
                                </Link>

                                {/* Article Text Content */}
                                <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-0.5">
                                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 font-calibri">
                                    <span className="flex items-center gap-1 text-neutral-500">
                                      <Clock size={12} />
                                      {article.date || 'Baru Saja'}
                                    </span>

                                    <button
                                      onClick={(e) => handleShareArticle(e, article)}
                                      className="text-neutral-400 hover:text-finance-600 transition-colors p-1 cursor-pointer"
                                      title="Bagikan artikel"
                                    >
                                      {copiedId === article.id ? (
                                        <Check size={14} className="text-emerald-600" />
                                      ) : (
                                        <Share2 size={14} />
                                      )}
                                    </button>
                                  </div>

                                  <Link
                                    to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                    className="block"
                                  >
                                    <h4 className="text-base sm:text-xl md:text-2xl font-normal text-neutral-900 leading-snug mb-2 group-hover:text-finance-600 transition-colors">
                                      {article.title}
                                    </h4>
                                  </Link>

                                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                                    {getCleanExcerpt(article.content, 140)}
                                  </p>

                                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-100">
                                    <Link
                                      to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-finance-600 uppercase tracking-wider hover:underline"
                                    >
                                      <span>Baca Berita</span>
                                      <ChevronRight size={14} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}

                </div>

                {/* RIGHT SIDEBAR: TERPOPULER MINGGUAN (4 COLS MATCHING NEWS.TSX) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between border-b-2 border-finance-600 pb-3 mb-4 gap-2">
                      <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                        <Flame size={18} className="text-finance-600" />
                        <span>TERPOPULER MINGGUAN</span>
                      </h3>
                      <span className="text-[10px] text-finance-600 font-extrabold tracking-widest bg-finance-50 px-2.5 py-1 rounded-md border border-finance-200 uppercase">
                        7 HARI
                      </span>
                    </div>

                    <div className="flex flex-col divide-y divide-neutral-100">
                      {popularMingguan.slice(0, 5).map((pop, idx) => (
                        <Link
                          key={pop.id || idx}
                          to={`${getBasePath()}/${slugify(getCategoryFriendlyName(pop))}/${slugify(pop.title)}`}
                          className="py-3.5 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                        >
                          <span className={`text-2xl font-black font-display shrink-0 w-8 text-center ${
                            idx === 0 ? 'text-finance-600' : 'text-neutral-400'
                          }`}>
                            0{idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-finance-600 uppercase tracking-wider block mb-0.5">
                              {getCategoryFriendlyName(pop)}
                            </span>
                            <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-finance-600 transition-colors">
                              {pop.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </>
        )}
      </main>

      <Footer portal="finance" />
    </div>
  );
}
