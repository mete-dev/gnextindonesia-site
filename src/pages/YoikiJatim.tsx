import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  Share2,
  Check,
  Flame,
  Clock,
  Search,
  TrendingUp,
  Newspaper,
  ChevronRight,
  Radio,
  Eye,
  Sparkles,
  Send,
  MapPin,
  MessageSquare,
  Bookmark,
  X
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { EAST_JAVA_CITIES } from '../data/indonesiaLocations';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { Article } from './studio/types';
import { getTrendingHeadlineCandidates, getPopularArticles, parseArticleDate, formatDate, getLatestTickerArticles, getBeritaUtama, getTerpopulerHarian, getTerpopulerMingguan, getSorotanUtama } from '../lib/trending';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { NewsFeedSkeleton } from '../components/NewsSkeletons';
import { trackPortalVisit } from '../lib/tracker';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';

export const yoikiJatimFallbackArticles: Article[] = [
  {
    id: 'yoiki-1',
    title: 'Pemerintah Provinsi Jawa Timur Percepat Digitalisasi UMKM dan Layanan Publik 2026',
    content: 'Pemprov Jawa Timur terus memacu percepatan transformasi digital bagi sektor usaha mikro kecil menengah (UMKM) serta memperluas layanan publik berbasis sistem cerdas di seluruh kabupaten dan kota se-Jawa Timur.',
    categoryId: 'cat-ekonomi-jatim',
    authorId: 'redaksi-yoikijatim',
    status: 'published',
    date: '08 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    views: 4850,
    news_location: 'Surabaya',
  } as any,
  {
    id: 'yoiki-2',
    title: 'Kawasan Wisata Bromo & Malang Raya Catat Peningkatan Kunjungan Wisatawan Internasional',
    content: 'Destinasi wisata unggulan Malang Raya dan Taman Nasional Bromo Tengger Semeru terus menyedot antusiasme turis mancanegara. Pengembangan homestay warga lokal mendongkrak perekonomian masyarakat Jawa Timur.',
    categoryId: 'cat-wisata-jatim',
    authorId: 'redaksi-yoikijatim',
    status: 'published',
    date: '07 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
    views: 5300,
    news_location: 'Malang',
  } as any,
  {
    id: 'yoiki-3',
    title: 'Tol Probolinggo - Banyuwangi Siap Difungsikan, Konektivitas Jawa Timur Makin Cepat',
    content: 'Penyelesaian jaringan jalan tol Trans Jawa lintas Probolinggo hingga Banyuwangi memberikan kemudahan akses logistik dan mobilitas masyarakat di kawasan timur Pulau Jawa.',
    categoryId: 'cat-infrastruktur-jatim',
    authorId: 'redaksi-yoikijatim',
    status: 'published',
    date: '06 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    views: 3910,
    news_location: 'Banyuwangi',
  } as any,
  {
    id: 'yoiki-4',
    title: 'Inovasi Mobil Listrik Hemat Energi Mahasiswa Surabaya Pukau Ajang Kompetisi Internasional',
    content: 'Tim riset otomotif perguruan tinggi Surabaya kembali menorehkan prestasi gemilang lewat rancangan kendaraan ramah lingkungan bertenaga surya.',
    categoryId: 'cat-teknologi-jatim',
    authorId: 'redaksi-yoikijatim',
    status: 'published',
    date: '05 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    views: 6120,
    news_location: 'Surabaya',
  } as any,
  {
    id: 'yoiki-5',
    title: 'Panen Raya Padi Organik Kediri dan Sidoarjo Perkuat Ketahanan Pangan Nasional',
    content: 'Para petani di wilayah Kediri dan Sidoarjo meraih peningkatan hasil panen signifikan berkat integrasi teknologi irigasi modern dan pupuk organik ramah lingkungan.',
    categoryId: 'cat-pertanian-jatim',
    authorId: 'redaksi-yoikijatim',
    status: 'published',
    date: '04 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    views: 3420,
    news_location: 'Kediri',
  } as any
];

export const lumajangFallbackArticles = yoikiJatimFallbackArticles;

const getBasePath = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname.startsWith('yoikijatim.')) return '';
  }
  return '/yoikijatim';
};

export default function YoikiJatimPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Semua'); // Represents active Location/Category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>(['Semua', 'Jawa Timur', ...EAST_JAVA_CITIES]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    if (catParam) {
      const p = catParam.toLowerCase().trim();
      const matchedLoc = locations.find((l) => l.toLowerCase().includes(p) || p.includes(l.toLowerCase()));
      if (matchedLoc) {
        setActiveCategory(matchedLoc);
      } else {
        setActiveCategory(catParam.charAt(0).toUpperCase() + catParam.slice(1));
      }
    } else {
      setActiveCategory('Semua');
    }
  }, [searchParams, locations]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'Semua') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slugify(cat) });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { articles: dbArticles, categories: dbCategories, settings: dbSettings } = await fetchPublishedArticlesAndMetadata();

      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories);
      }

      // 1. Process locations configuration
      const yoikiSetting = dbSettings?.find((s: any) => s.path === 'yoikijatim-locations');
      const parsedLocs = yoikiSetting?.content
        ? yoikiSetting.content.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      
      const combinedLocs = Array.from(new Set([...EAST_JAVA_CITIES, ...parsedLocs]));
      setLocations(['Semua', 'Jawa Timur', ...combinedLocs]);

      // 2. Process articles
      let fetched: Article[] = [];
      if (dbArticles && dbArticles.length > 0) {
        fetched = filterValidArticles(dbArticles).map((a: any) => ({
          ...a,
          categoryId: a.category_id || a.categoryId,
          authorId: a.author_id || a.authorId,
          news_location: a.news_location || 'Nasional',
          cover_image: a.cover_image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'
        }));
      }

      // Prioritize articles belonging to Yoiki Jatim or having Jawa Timur locations
      const prioritizedArticles = [...fetched].sort((a, b) => {
        const portalA = (a.portal || '').toLowerCase();
        const portalB = (b.portal || '').toLowerCase();
        const isJatimA = portalA === 'yoikijatim';
        const isJatimB = portalB === 'yoikijatim';

        if (isJatimA && !isJatimB) return -1;
        if (!isJatimA && isJatimB) return 1;

        // Match Jawa Timur keywords in location
        const locA = (a.news_location || '').toLowerCase().trim();
        const locB = (b.news_location || '').toLowerCase().trim();
        const jatimKeywords = ['jatim', 'jawa timur', 'surabaya', 'malang', 'banyuwangi', 'jember', 'kediri', 'sidoarjo', 'gresik', 'probolinggo', 'pasuruan'];
        const isJatimLocA = jatimKeywords.some(k => locA.includes(k));
        const isJatimLocB = jatimKeywords.some(k => locB.includes(k));
        if (isJatimLocA && !isJatimLocB) return -1;
        if (!isJatimLocA && isJatimLocB) return 1;

        const dateA = parseArticleDate(a.date || (a as any).created_at).getTime();
        const dateB = parseArticleDate(b.date || (b as any).created_at).getTime();
        return dateB - dateA;
      });

      // Only use fallback articles if DB returns no published articles
      const finalArticles = prioritizedArticles.length > 0
        ? prioritizedArticles
        : filterValidArticles(lumajangFallbackArticles);

      setArticles(finalArticles);
    } catch (err) {
      console.error('Yo Iki Jatim news load error:', err);
      setArticles(filterValidArticles(lumajangFallbackArticles));
      setLocations(['Semua', 'Jawa Timur', 'Surabaya', 'Malang', 'Banyuwangi', 'Kediri', 'Jember']);
    } finally {
      setLoading(false);
    }
  };

  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80';

  const extractFirstImage = (content?: string) => {
    if (!content) return null;
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1]?.trim()) return mdMatch[1].trim();
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/);
    if (htmlMatch && htmlMatch[1]?.trim()) return htmlMatch[1].trim();
    return null;
  };

  const getArticleImage = (article?: Article | null) => {
    if (!article) return DEFAULT_COVER;
    const cover = (article as any).cover_image;
    if (typeof cover === 'string' && cover.trim()) return cover.trim();
    const extracted = extractFirstImage(article.content);
    if (extracted) return extracted;
    return DEFAULT_COVER;
  };

  const getCategoryTag = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    if (found) return found.name;
    if (catId === 'cat-sosial') return 'Sosial';
    if (catId === 'cat-pendidikan') return 'Pendidikan';
    if (catId === 'cat-keuangan') return 'Keuangan';
    if (catId === 'cat-lingkungan') return 'Lingkungan';
    if (catId === 'cat-wisata' || catId.includes('wisata')) return 'Wisata & Semeru';
    if (catId === 'cat-ekonomi' || catId.includes('ekonomi')) return 'Ekonomi & Bisnis';
    if (catId === 'cat-kreatif' || catId.includes('pemuda')) return 'Komunitas Pemuda';
    if (catId === 'cat-teknologi') return 'Teknologi';
    return 'Seputar Jawa Timur';
  };

  const handleShare = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = `${window.location.origin}/yoikijatim/${slugify(getCategoryTag(article.categoryId))}/${slugify(article.title)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: fullUrl });
        return;
      } catch (err) {}
    }
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
  };

  // Filter based on selected location or category tag
  const filteredArticles = articles.filter((a) => {
    const loc = (a.news_location || '').toLowerCase().trim();
    const catTag = getCategoryTag(a.categoryId).toLowerCase().trim();
    const activeLower = activeCategory.toLowerCase().trim();
    const activeSlug = slugify(activeCategory);

    let matchesFilter = true;
    if (activeCategory === 'Semua') {
      matchesFilter = true;
    } else if (activeCategory === 'Jawa Timur') {
      const locNames = locations.map((l) => l.toLowerCase().trim());
      matchesFilter = loc === 'jawa timur' || loc === 'jatim' || locNames.includes(loc);
    } else {
      matchesFilter =
        (loc.length > 0 && activeLower.length > 0 && (loc.includes(activeLower) || activeLower.includes(loc))) ||
        (catTag.length > 0 && activeLower.length > 0 && (catTag.includes(activeLower) || activeLower.includes(catTag))) ||
        (loc.length > 0 && slugify(loc) === activeSlug) ||
        (catTag.length > 0 && slugify(catTag) === activeSlug);
    }

    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const [popularTab, setPopularTab] = useState<'harian' | 'mingguan'>('harian');

  // 1. Berita Utama Jawa Timur: Berita pembaca terbanyak 3 hari terakhir
  const beritaUtamaList = getBeritaUtama(articles, 'jatim');
  const heroMain = beritaUtamaList[0] || articles[0] || null;
  const heroSub = beritaUtamaList.slice(1, 4).length > 0 
    ? beritaUtamaList.slice(1, 4) 
    : articles.slice(1, 4);

  // 2. Terpopuler Jatim: Harian vs Mingguan
  const popularHarian = getTerpopulerHarian(articles, 5);
  const popularMingguan = getTerpopulerMingguan(articles, 5);
  const popularArticles = popularTab === 'harian' ? popularHarian : popularMingguan;

  // 3. Sorotan Utama Jatim: Berita tanding 7 hari terakhir
  const heroIds = new Set([heroMain?.id, ...heroSub.map(s => s.id)].filter(Boolean));
  const sorotanUtamaList = getSorotanUtama(articles, 5, Array.from(heroIds));

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Track portal visit
  useEffect(() => {
    trackPortalVisit('yoikijatim');
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans selection:bg-yoiki-400 selection:text-white overflow-x-hidden">
      <SEO
        title="YO IKI JATIM - Portal Berita Terkini Seputar Jawa Timur"
        description="Portal berita terkini seputar Provinsi Jawa Timur, Surabaya, Malang, Banyuwangi, Kediri, ekonomi, serta komunitas Jawa Timur."
        path="/yoikijatim"
      />
      <Navbar 
        portal="yoikijatim" 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        categories={locations}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryClick}
        tickerArticles={articles.length > 0 ? getLatestTickerArticles(articles, 5) : []}
        todayFormatted={todayFormatted}
        getCategoryName={getCategoryTag}
        getBasePath={getBasePath}
      />

      <main className="pt-28 pb-20">

        {loading ? (
          <NewsFeedSkeleton portal="yoikijatim" />
        ) : (
          <>
            {/* GNEXT/CNN STYLE PREMIUM HOME GRID FOR YO IKI JATIM */}
            {heroMain && !searchQuery && activeCategory === 'Semua' && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 flex flex-col gap-6">
                
                {/* 1. PRIMARY SPLIT HEADLINE GRID (8 Cols Hero + 4 Cols Popular) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT PRIMARY BLOCK (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Compact Hero Article Card */}
                    <Link
                      to={`${getBasePath()}/${slugify(getCategoryTag(heroMain.categoryId))}/${slugify(heroMain.title)}`}
                      className="group bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col sm:flex-row hover:shadow-md hover:border-yoiki-400 transition-all duration-300"
                    >
                      {/* Left Side: Editorial Content */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-yoiki-400 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                              SUARA JATIM
                            </span>
                            <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase tracking-wider border border-neutral-200">
                              {getCategoryTag(heroMain.categoryId)}
                            </span>
                          </div>
                          
                          <h2 className="text-base sm:text-lg md:text-xl font-normal text-neutral-900 leading-snug tracking-tight group-hover:text-yoiki-400 transition-colors duration-200">
                            {heroMain.title}
                          </h2>
                          
                          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">
                            {getCleanExcerpt(heroMain.content, 120)}
                          </p>
                        </div>
                        
                        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-semibold uppercase tracking-wide text-yoiki-400 flex items-center gap-1">
                            <MapPin size={12} />
                            {heroMain.news_location || 'Jawa Timur'}
                          </span>
                          <span className="font-medium flex items-center gap-1 font-calibri">
                            <Clock size={12} />
                            {formatDate(heroMain.date, (heroMain as any).created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Visual Cover */}
                      <div className="w-full sm:w-36 md:w-44 h-24 sm:h-28 max-h-28 bg-neutral-950 relative shrink-0 overflow-hidden">
                        <BlurImage
                          src={getArticleImage(heroMain)}
                          alt={heroMain.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-10" />
                      </div>
                    </Link>

                    {/* Secondary Horizontal Items Side-By-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {heroSub.slice(0, 2).map((sub, idx) => (
                        <Link
                          key={sub.id || idx}
                          to={`${getBasePath()}/${slugify(getCategoryTag(sub.categoryId))}/${slugify(sub.title)}`}
                          className="group bg-white p-3 rounded-xl border border-neutral-200 flex gap-3 hover:border-yoiki-400 hover:shadow-2xs transition-all items-center"
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
                              <span className="text-[9px] font-bold text-yoiki-400 uppercase tracking-wider block mb-0.5">
                                {getCategoryTag(sub.categoryId)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-yoiki-400 transition-colors">
                                {sub.title}
                              </h4>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-calibri flex items-center gap-1 mt-1">
                              <MapPin size={10} className="text-yoiki-400" />
                              {sub.news_location || 'Jawa Timur'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                  </div>

                  {/* RIGHT SIDEBAR POPULAR LIST (4 Cols - "TERPOPULER JATIM HARIAN") */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-yoiki-400 pb-3 mb-4 gap-2">
                        <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                          <TrendingUp size={18} className="text-yoiki-400" />
                          <span>TERPOPULER JATIM HARIAN</span>
                        </h3>
                        <span className="text-[10px] text-yoiki-400 font-extrabold tracking-widest bg-yoiki-50 px-2.5 py-1 rounded-md border border-yoiki-200 uppercase">
                          24 JAM
                        </span>
                      </div>

                      <div className="flex flex-col divide-y divide-neutral-100">
                        {popularHarian.slice(0, 5).map((pop, idx) => (
                          <Link
                            key={pop.id || idx}
                            to={`${getBasePath()}/${slugify(getCategoryTag(pop.categoryId))}/${slugify(pop.title)}`}
                            className="py-3.5 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                          >
                            <span className={`text-2xl font-black font-display shrink-0 w-8 text-center ${
                              idx === 0 ? 'text-yoiki-400' : 'text-neutral-400'
                            }`}>
                              0{idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-yoiki-400 uppercase tracking-wider block mb-0.5">
                                {getCategoryTag(pop.categoryId)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-yoiki-400 transition-colors">
                                {pop.title}
                              </h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. MID GRID HEADLINES ("RAGAM KABAR JAWA TIMUR") */}
                <div className="border-t border-neutral-200 pt-6">
                  <div className="pb-3 border-b border-neutral-200 mb-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Newspaper size={16} className="text-yoiki-400" />
                      <span>RAGAM KABAR JAWA TIMUR</span>
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
                          to={`${getBasePath()}/${slugify(getCategoryTag(art.categoryId))}/${slugify(art.title)}`}
                          className="group flex flex-col gap-2 bg-white p-4 rounded-xl border border-neutral-200 hover:border-yoiki-400 transition-all shadow-2xs"
                        >
                          <h4 className="text-sm sm:text-base font-normal text-neutral-900 leading-snug group-hover:text-yoiki-400 transition-colors line-clamp-2">
                            {art.title}
                          </h4>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                            <span className="text-yoiki-400 font-extrabold uppercase tracking-wider block">
                              {getCategoryTag(art.categoryId)}
                            </span>
                            <span className="font-calibri">{art.news_location || 'Jawa Timur'}</span>
                          </div>
                        </Link>
                      ));
                    })()}
                  </div>
                </div>

                {/* 3. ORANGE ACCENT SPECIAL SEGMENT ("SOROTAN UTAMA JAWA TIMUR") */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-2">
                  <div 
                    className="lg:col-span-12 bg-[#993300] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col gap-6"
                    style={{ background: 'linear-gradient(135deg, #7a2900 0%, #c44500 50%, #471800 100%)' }}
                  >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-amber-500/50 pb-3 z-10">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-widest flex items-center gap-2 text-white">
                        <span className="w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
                        <span>SOROTAN UTAMA JAWA TIMUR</span>
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-white/30 transition-colors">
                        JATIM TERDEPAN
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
                                to={`${getBasePath()}/${slugify(getCategoryTag(focusArticle.categoryId))}/${slugify(focusArticle.title)}`}
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
                                  <span className="text-[12px] font-black text-amber-300 uppercase tracking-widest block mb-1">
                                    {getCategoryTag(focusArticle.categoryId)}
                                  </span>
                                  <Link 
                                    to={`${getBasePath()}/${slugify(getCategoryTag(focusArticle.categoryId))}/${slugify(focusArticle.title)}`}
                                    className="hover:text-amber-200 transition-colors block text-white"
                                  >
                                    <h4 className="text-xl sm:text-2xl font-normal leading-tight mb-2 drop-shadow-sm text-white">
                                      {focusArticle.title}
                                    </h4>
                                  </Link>
                                  <p className="text-[14px] text-amber-100/90 leading-relaxed line-clamp-3 font-normal">
                                    {getCleanExcerpt(focusArticle.content, 160)}
                                  </p>
                                </div>
                                <span className="text-[10px] text-amber-200 mt-4 font-mono block">
                                  {focusArticle.news_location || 'Jawa Timur'} • {formatDate(focusArticle.date, (focusArticle as any).created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Quick-Links footer */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-amber-500/80 pt-4 z-10 text-base sm:text-[18px]">
                              {subSorotan.map((art, idx) => (
                                <Link
                                  key={art.id || idx}
                                  to={`${getBasePath()}/${slugify(getCategoryTag(art.categoryId))}/${slugify(art.title)}`}
                                  className="hover:text-amber-200 transition-all font-normal line-clamp-2 leading-snug border-l-2 border-amber-300 pl-3.5"
                                >
                                  {art.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        );
                      })()
                    ) : null}

                  </div>
                </div>

              </div>
            )}

            {/* 4. MAIN BODY GRID: ARTICLE FEED + SIDEBAR */}
            <section id="news-feed-container" className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6 scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT FEED (8 COLS) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b-2 border-yoiki-400 pb-2 bg-white px-4 py-3 rounded-t-xl shadow-2xs">
                    <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                      <Flame size={18} className="text-yoiki-400" />
                      <span>
                        {searchQuery
                          ? `PENCARIAN: "${searchQuery}"`
                          : activeCategory === 'Semua' 
                            ? 'KABAR JAWA TIMUR TERKINI' 
                            : `DAERAH / KATEGORI: ${activeCategory}`
                        }
                      </span>
                    </h3>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-bold text-yoiki-400 hover:text-amber-600 transition-colors uppercase flex items-center gap-1"
                      >
                        <X size={14} />
                        <span>Hapus Pencarian</span>
                      </button>
                    )}
                  </div>

                  {filteredArticles.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 font-medium">
                      <span>
                        {searchQuery 
                          ? `Tidak ditemukan berita Jawa Timur untuk kata kunci "${searchQuery}".` 
                          : `Belum ada kabar berita khusus untuk ${activeCategory}.`}
                      </span>
                      <button
                        onClick={() => {
                          setActiveCategory('Semua');
                          setSearchQuery('');
                        }}
                        className="px-3 py-1.5 bg-yoiki-400 text-white rounded-lg text-xs font-bold uppercase shrink-0 hover:bg-amber-600 transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredArticles.slice(0, 16).map((article) => {
                          const catName = getCategoryTag(article.categoryId);
                          const image = getArticleImage(article);

                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.3 }}
                              key={article.id}
                              className="group bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 hover:border-yoiki-400 hover:shadow-md transition-all"
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
                                    <span className="bg-yoiki-400 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow">
                                      {catName}
                                    </span>
                                    {article.news_location && (
                                      <span className="bg-neutral-900/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow flex items-center gap-1">
                                        <MapPin size={9} className="text-yoiki-400" />
                                        {article.news_location}
                                      </span>
                                    )}
                                  </div>
                                </Link>

                                {/* Article Text Content */}
                                <div className="flex flex-col flex-1 min-w-0 h-full">
                                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 font-calibri">
                                    <span className="flex items-center gap-1 text-neutral-500">
                                      <Clock size={12} />
                                      {article.date || 'Terbaru'}
                                    </span>

                                    <button
                                      onClick={(e) => handleShare(e, article)}
                                      className="text-neutral-400 hover:text-yoiki-400 transition-colors p-1"
                                      title="Bagikan kabar"
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
                                    <h4 className="text-base sm:text-lg md:text-xl font-normal text-neutral-900 leading-snug mb-2 group-hover:text-yoiki-400 transition-colors">
                                      {article.title}
                                    </h4>
                                  </Link>

                                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                                    {getCleanExcerpt(article.content, 140)}
                                  </p>

                                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-100">
                                    <Link
                                      to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-yoiki-400 uppercase tracking-wider hover:underline"
                                    >
                                      <span>Baca Kabar Selengkapnya</span>
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
                  </div>

                {/* RIGHT SIDEBAR (4 COLS) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* TERPOPULER RANKING CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between border-b-2 border-yoiki-400 pb-3 mb-4 gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                        <Flame size={18} className="text-yoiki-400" />
                        <span>KABAR POPULER MINGGUAN</span>
                      </h3>
                      <span className="text-[10px] text-yoiki-400 font-extrabold tracking-widest bg-yoiki-50 px-2.5 py-1 rounded-md border border-yoiki-200 uppercase">
                        7 HARI
                      </span>
                    </div>

                    <div className="flex flex-col divide-y divide-neutral-100">
                      {popularMingguan.slice(0, 5).map((pop, idx) => (
                        <Link
                          key={pop.id || idx}
                          to={`${getBasePath()}/${slugify(getCategoryTag(pop.categoryId))}/${slugify(pop.title)}`}
                          className="py-3.5 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                        >
                          <span className={`text-2xl font-black font-display shrink-0 w-8 text-center ${
                            idx === 0 ? 'text-yoiki-400' : 'text-neutral-400'
                          }`}>
                            0{idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-yoiki-400 uppercase tracking-wider block mb-0.5">
                              {getCategoryTag(pop.categoryId)}
                            </span>
                            <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-yoiki-400 transition-colors">
                              {pop.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <Eye size={11} />
                                {(pop as any).views || 1800 + idx * 350} dibaca
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* DAERAH UTAMA JAWA TIMUR QUICK FILTER */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-yoiki-400" />
                      <span>LINTAS DAERAH JATIM</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {['Surabaya', 'Malang', 'Banyuwangi', 'Jember', 'Kediri', 'Sidoarjo', 'Gresik', 'Probolinggo', 'Pasuruan', 'Madiun'].map((loc) => {
                        const isActive = activeCategory.toLowerCase().includes(loc.toLowerCase());
                        return (
                          <button
                            key={loc}
                            onClick={() => handleCategoryClick(loc)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-yoiki-400 text-white shadow-xs'
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            {loc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STUDIO REDAKTUR PROMO CARD */}
                  <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white p-6 rounded-2xl shadow-md border border-neutral-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yoiki-400/20 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-yoiki-400 bg-yoiki-400/10 border border-yoiki-400/30 px-2.5 py-1 rounded-md inline-block mb-3">
                      Suara Komunitas Jatim
                    </span>
                    <h4 className="text-base font-extrabold leading-snug mb-2">
                      Punya Kabar atau Liputan Seputar Jawa Timur?
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      Kirimkan artikel, rilisan pers, atau kabar warga melalui Studio Redaktur GNEXT untuk dipublikasikan di Yo Iki Jatim.
                    </p>
                    <Link
                      to="/studio"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-yoiki-400 hover:bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <span>Masuk Studio Redaktur</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>

                </div>

              </div>
            </section>
          </>
        )}
      </main>

      <Footer portal="yoikijatim" />
    </div>
  );
}

