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
  X
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { Article } from './studio/types';
import { getTrendingHeadlineCandidates, parseArticleDate, getLatestTickerArticles, getPopularArticles, formatDate } from '../lib/trending';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { NewsFeedSkeleton } from '../components/NewsSkeletons';
import { trackPortalVisit } from '../lib/tracker';
import { getHijriDate } from '../lib/dateUtils';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';

export const gummahFallbackArticles: Article[] = [
  {
    id: 'gummah-1',
    title: 'Pesantren Ar-Raudhah Lumajang Luncurkan Inkubator Bisnis Santri Mandiri 2026',
    content: 'Pondok Pesantren Ar-Raudhah resmi meluncurkan program Inkubator Bisnis Santri Mandiri sebagai langkah konkret dalam mendorong kemandirian ekonomi pesantren dan mempersiapkan santri menjadi wirausahawan masa depan berlandaskan nilai syariah.',
    categoryId: 'cat-kabar-ummah',
    category_id: 'cat-kabar-ummah',
    authorId: 'redaksi-gummah',
    status: 'published',
    date: '15 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80',
    views: 4210,
    news_location: 'Lumajang',
    portal: 'gummah',
    sub_category: 'Kabar Ummah'
  } as any,
  {
    id: 'gummah-2',
    title: 'Pasar Modal Syariah Indonesia Catat Pertumbuhan Investor Milenial Tertinggi di Asia Tenggara',
    content: 'Otoritas Jasa Keuangan (OJK) melaporkan pertumbuhan jumlah investor muda pada instrumen reksa dana dan saham syariah terus melonjak drastis, memperkuat posisi Indonesia sebagai salah satu pusat keuangan syariah paling prospektif.',
    categoryId: 'cat-ekonomi-syariah',
    category_id: 'cat-ekonomi-syariah',
    authorId: 'redaksi-gummah',
    status: 'published',
    date: '14 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    views: 5120,
    news_location: 'Nasional',
    portal: 'gummah',
    sub_category: 'Ekonomi Syariah'
  } as any,
  {
    id: 'gummah-3',
    title: 'Rekomendasi 5 Destinasi Ramah Muslim Terbaik 2026 yang Wajib Dikunjungi Keluarga',
    content: 'Kombinasi layanan ramah muslim, ketersediaan kuliner bersertifikat halal, serta fasilitas ibadah yang mudah diakses kini membuat tren Halal Travel semakin digemari oleh turis nusantara maupun mancanegara.',
    categoryId: 'cat-halal-lifestyle',
    category_id: 'cat-halal-lifestyle',
    authorId: 'redaksi-gummah',
    status: 'published',
    date: '12 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    views: 3890,
    news_location: 'Global',
    portal: 'gummah',
    sub_category: 'Halal Lifestyle'
  } as any,
  {
    id: 'gummah-4',
    title: 'Masjid Berdaya: Kisah Inspiratif Masjid Al-Fatih yang Sukses Angkat Derajat Ekonomi Dhuafa Lewat Lumbung Wakaf',
    content: 'Melalui pengelolaan Zakat, Infak, Sedekah, dan Wakaf (Ziswaf) yang modern dan akuntabel, Dewan Kemakmuran Masjid Al-Fatih berhasil mendirikan unit usaha produktif berbasis jemaah, membebaskan warga sekitar dari jerat rentenir.',
    categoryId: 'cat-ziswaf',
    category_id: 'cat-ziswaf',
    authorId: 'redaksi-gummah',
    status: 'published',
    date: '10 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    views: 4980,
    news_location: 'Surabaya',
    portal: 'gummah',
    sub_category: 'Ziswaf'
  } as any,
  {
    id: 'gummah-5',
    title: 'Menelisik Manuskrip Kuno Islam Nusantara: Bukti Toleransi dan Peradaban Tinggi di Abad Pertengahan',
    content: 'Sebuah tim peneliti gabungan sejarah berhasil mengarsipkan ratusan kitab kuno nusantara yang menjelaskan bagaimana proses asimilasi budaya lokal dan ajaran Islam berjalan damai, melahirkan khazanah keilmuan yang kaya.',
    categoryId: 'cat-inspirasi-muslim',
    category_id: 'cat-inspirasi-muslim',
    authorId: 'redaksi-gummah',
    status: 'published',
    date: '08 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80',
    views: 3120,
    news_location: 'Yogyakarta',
    portal: 'gummah',
    sub_category: 'Inspirasi Muslim'
  } as any
];

const getBasePath = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('gummah.') || hostname.startsWith('g-ummah.') || hostname.startsWith('ummah.')) return '';
    if (window.location.pathname.startsWith('/ummah')) return '/ummah';
  }
  return '/gummah';
};

// Maps category slugs/names into friendly readable labels
const mainCategoriesMapping: Record<string, string> = {
  'Semua': 'Semua',
  'Kabar Ummah': 'Kabar Ummah',
  'Islam Global': 'Islam Global',
  'Kalam & Opini': 'Kalam & Opini',
  'Ekonomi Syariah': 'Ekonomi Syariah',
  'Ziswaf': 'Ziswaf',
  'Halal Lifestyle': 'Halal Lifestyle',
  'Inspirasi Muslim': 'Inspirasi Muslim'
};

const subCategoriesMap: Record<string, string[]> = {};

export default function GUmmahPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [activeSubCategory, setActiveSubCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);



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

      // Filter articles specifically belonging to gummah portal or having ummah categories
      const gummahArticles = fetched.filter(a => {
        const p = (a.portal || '').toLowerCase();
        if (p === 'gummah') return true;
        const catId = a.categoryId || a.category_id || '';
        const catName = dbCategories.find((c: any) => c.id === catId)?.name?.toLowerCase() || '';
        return catName.includes('ummah') || catName.includes('islam') || catName.includes('syariah');
      });

      const finalArticles = gummahArticles.length > 0 
        ? gummahArticles 
        : filterValidArticles(gummahFallbackArticles);

      setArticles(finalArticles);
    } catch (err) {
      console.error('G-Ummah news load error:', err);
      setArticles(filterValidArticles(gummahFallbackArticles));
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
      'cat-kabar-ummah': 'Kabar Ummah',
      'cat-islam-global': 'Islam Global',
      'cat-kalam-opini': 'Kalam & Opini',
      'cat-ekonomi-syariah': 'Ekonomi Syariah',
      'cat-ziswaf': 'Ziswaf',
      'cat-halal-lifestyle': 'Halal Lifestyle',
      'cat-inspirasi-muslim': 'Inspirasi Muslim'
    };
    const catId = article.categoryId || '';
    if (mainCatMap[catId]) return mainCatMap[catId];
    
    // Fallback search database categories
    const found = categories.find(c => c.id === catId);
    if (found) return found.name;
    return 'Dinamika & Wawasan';
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

  // Get headline Candidates
  const headlineCandidates = getTrendingHeadlineCandidates(articles, 'gummah');
  const heroMain = headlineCandidates[0] || null;
  const heroSub = headlineCandidates.slice(1, 3);
  const popularArticles = getPopularArticles(articles, 5);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hijriDate = getHijriDate();
  const [showHijri, setShowHijri] = useState(true);

  useEffect(() => {
    trackPortalVisit('gummah');
    const timer = setInterval(() => {
      setShowHijri(prev => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-neutral-900 font-sans selection:bg-emerald-600 selection:text-white overflow-x-hidden">
      <SEO
        title="Gnext Ummah - Portal Berita Faktual, Edukasi & Gaya Hidup Islami"
        description="Portal berita terkini, dinamika ummat, kajian keagamaan kontemporer, ekonomi syariah, ziswaf, serta gaya hidup halal ramah keluarga."
        path="/gummah"
      />
      <Navbar 
        portal="gummah" 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        categories={['Semua', 'Kabar Ummah', 'Islam Global', 'Kalam & Opini', 'Ekonomi Syariah', 'Ziswaf', 'Halal Lifestyle', 'Inspirasi Muslim']}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryClick}
        tickerArticles={articles.length > 0 ? getLatestTickerArticles(articles, 5) : []}
        todayFormatted={showHijri ? hijriDate : todayFormatted}
        getCategoryName={getCategoryFriendlyName}
        getBasePath={getBasePath}
      />

      <main className="pt-28 pb-20">

        {loading ? (
          <NewsFeedSkeleton portal="gummah" />
        ) : (
          <>
            {/* CNN INDONESIA STYLE PREMIUM HOME GRID */}
            {heroMain && !searchQuery && activeCategory === 'Semua' && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 flex flex-col gap-6">
                
                {/* PRIMARY SPLIT HEADLINE GRID (Left Hero Block + Right Popular Column) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT PRIMARY BLOCK (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Compact Hero Article Card */}
                    <Link
                      to={`${getBasePath()}/${slugify(getCategoryFriendlyName(heroMain))}/${slugify(heroMain.title)}`}
                      className="group bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-100 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all duration-300 flex items-center justify-between gap-3 sm:gap-4"
                    >
                      {/* Left Side: Editorial Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                              BERITA UTAMA
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                              {getCategoryFriendlyName(heroMain)}
                            </span>
                          </div>
                          
                          <h2 className="text-sm sm:text-base md:text-lg font-normal text-neutral-900 leading-snug tracking-tight group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
                            {heroMain.title}
                          </h2>
                          
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2 hidden sm:block">
                            {getCleanExcerpt(heroMain.content, 110)}
                          </p>
                        </div>
                        
                        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-semibold uppercase tracking-wide text-emerald-600">
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
                          className="group bg-white p-3 rounded-xl border border-neutral-150 flex gap-3 hover:border-emerald-400 hover:shadow-2xs transition-all items-center"
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
                              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">
                                {getCategoryFriendlyName(sub)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
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

                  {/* RIGHT SIDEBAR POPULAR LIST (4 Cols - "TERPOPULER") */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3 mb-4 gap-2">
                        <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                          <TrendingUp size={18} className="text-emerald-600" />
                          <span>POPULER UMMAH</span>
                        </h3>
                        <span className="text-[10px] text-emerald-600 font-extrabold tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 uppercase">
                          HARI INI
                        </span>
                      </div>

                      <div className="flex flex-col divide-y divide-neutral-100">
                        {popularArticles.slice(0, 5).map((pop, idx) => (
                          <Link
                            key={pop.id || idx}
                            to={`${getBasePath()}/${slugify(getCategoryFriendlyName(pop))}/${slugify(pop.title)}`}
                            className="py-3.5 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                          >
                            <span className={`text-2xl font-black font-display shrink-0 w-8 text-center ${
                              idx === 0 ? 'text-emerald-600' : 'text-neutral-400'
                            }`}>
                              0{idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-0.5">
                                {getCategoryFriendlyName(pop)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {pop.title}
                              </h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* "SOROTAN UTAMA" MID GRID HEADLINES */}
                <div className="border-t border-emerald-100 pt-6">
                  <div className="pb-3 border-b border-emerald-100 mb-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                      SOROTAN UTAMA
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
                          className="group flex flex-col gap-2"
                        >
                          <h4 className="text-sm sm:text-base font-normal text-neutral-900 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {art.title}
                          </h4>
                          <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider block">
                            {getCategoryFriendlyName(art)}
                          </span>
                        </Link>
                      ));
                    })()}
                  </div>
                </div>

              </div>
            )}

            {/* MAIN PORTAL BODY */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Feed (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* SUB-CATEGORY FILTERS (Dynamic based on selected main category) */}
                {activeCategory !== 'Semua' && subCategoriesMap[activeCategory] && (
                  <div className="py-1 border-b border-neutral-100">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Filter size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sub Kategori {activeCategory}</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                      <button
                        onClick={() => handleSubCategoryClick('Semua')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                          activeSubCategory === 'Semua'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50 border-neutral-200/80 hover:border-emerald-200/50'
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
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-neutral-600 hover:text-emerald-600 hover:bg-emerald-50 border-neutral-200/80 hover:border-emerald-200/50'
                          }`}
                        >
                          {subCat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* News feed title */}
                <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-serif font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2.5">
                    <BookOpen size={20} className="text-emerald-600" />
                    <span>
                      {searchQuery
                        ? `PENCARIAN: "${searchQuery}"`
                        : `Daftar Kabar Berita ${activeCategory !== 'Semua' ? `: ${activeCategory}` : ''}`
                      }
                    </span>
                  </h3>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase flex items-center gap-1"
                    >
                      <X size={14} />
                      <span>Hapus Pencarian</span>
                    </button>
                  )}
                </div>

                {/* Articles List / Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {filteredArticles.slice(0, 16).map((article) => (
                    <motion.article
                      key={article.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col group h-full overflow-hidden"
                    >
                      {/* Cover Photo */}
                      <Link
                        to={`${getBasePath()}/${slugify(getCategoryFriendlyName(article))}/${slugify(article.title)}`}
                        className="relative block aspect-video bg-neutral-900 overflow-hidden"
                      >
                        <BlurImage
                          src={getArticleImage(article)}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider font-mono">
                            {article.news_location}
                          </span>
                          {(article as any).sub_category && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                              {(article as any).sub_category}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Content Card Body */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-400 mb-2 font-medium">
                          <span className="text-emerald-600 font-bold uppercase tracking-wider">
                            {getCategoryFriendlyName(article)}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{article.date || 'Baru'}</span>
                        </div>

                        <Link
                          to={`${getBasePath()}/${slugify(getCategoryFriendlyName(article))}/${slugify(article.title)}`}
                          className="block mt-1 flex-1"
                        >
                          <h4 className="font-serif font-normal text-base sm:text-lg text-neutral-900 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-3">
                            {article.title}
                          </h4>
                        </Link>

                        <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-neutral-400 font-bold">
                            {article.views?.toLocaleString('id-ID') || 0} Pembaca
                          </span>

                          <Link
                            to={`${getBasePath()}/${slugify(getCategoryFriendlyName(article))}/${slugify(article.title)}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors"
                          >
                            <span>Baca Selengkapnya</span>
                            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}

                  {filteredArticles.length === 0 && (
                    <div className="col-span-full bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-500">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <Search size={20} />
                      </div>
                      <p className="font-bold text-neutral-800">Tidak ada berita ditemukan</p>
                      <p className="text-xs text-neutral-400 mt-1">Silakan coba kata kunci lain atau pilih kategori yang berbeda.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* INSPIRASI HADIS BANNER */}
                <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-6 shadow-sm border border-emerald-700 relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
                    <BookOpen size={160} />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                      <Sparkles size={11} />
                      <span>Oase Inspirasi</span>
                    </span>
                    <blockquote className="font-serif italic text-sm leading-relaxed text-emerald-100">
                      "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya."
                    </blockquote>
                    <cite className="block text-xs font-mono font-bold text-emerald-400 not-italic">
                      — HR. Ahmad & Thabrani
                    </cite>
                  </div>
                </div>



              </div>

            </div>
          </>
        )}
      </main>

      <Footer portal="gummah" />
    </div>
  );
}
