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
  X
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { LUMAJANG_DISTRICTS } from '../data/indonesiaLocations';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { Article } from './studio/types';
import { getTrendingHeadlineCandidates, getPopularArticles, getTerpopulerHarian, getTerpopulerMingguan, parseArticleDate, formatDate, getLatestTickerArticles } from '../lib/trending';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { NewsFeedSkeleton } from '../components/NewsSkeletons';
import { trackPortalVisit } from '../lib/tracker';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';
import { lumajangFallbackArticles } from './YoikiJatim';

const getBasePath = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase();
      if (hostname.startsWith('lumajangtalks.')) return '';
    }
    return '/lumajangtalks';
  };

export default function LumajangTalksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Semua'); // Represents active Location/Category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>(['Semua', 'Lumajang', ...LUMAJANG_DISTRICTS]);
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
      const lumajangSetting = dbSettings?.find((s: any) => s.path === 'lumajangtalks-locations');
      const parsedLocs = lumajangSetting?.content
        ? lumajangSetting.content.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      
      const combinedLocs = Array.from(new Set([...LUMAJANG_DISTRICTS, ...parsedLocs]));
      setLocations(['Semua', 'Lumajang', ...combinedLocs]);

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

      // Prioritize articles belonging to Lumajang Talks or having Lumajang locations
      const prioritizedArticles = [...fetched].sort((a, b) => {
        const portalA = (a.portal || '').toLowerCase();
        const portalB = (b.portal || '').toLowerCase();
        const isLumajangA = portalA === 'lumajangtalks';
        const isLumajangB = portalB === 'lumajangtalks';

        if (isLumajangA && !isLumajangB) return -1;
        if (!isLumajangA && isLumajangB) return 1;

        // Match Lumajang location
        const locA = (a.news_location || '').toLowerCase().trim();
        const locB = (b.news_location || '').toLowerCase().trim();
        const isLumajangLocA = locA.includes('lumajang');
        const isLumajangLocB = locB.includes('lumajang');
        if (isLumajangLocA && !isLumajangLocB) return -1;
        if (!isLumajangLocA && isLumajangLocB) return 1;

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
      console.error('Lumajang Talks news load error:', err);
      setArticles(filterValidArticles(lumajangFallbackArticles));
      setLocations(['Semua', 'Lumajang', 'Senduro', 'Pasrujambe', 'Pronojiwo']);
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
    if (catId === 'cat-ekonomi' || catId.includes('ekonomi')) return 'Pisang & Kuliner';
    if (catId === 'cat-kreatif' || catId.includes('pemuda')) return 'Komunitas Pemuda';
    if (catId === 'cat-teknologi') return 'Teknologi';
    return 'Seputar Lumajang';
  };

  const handleShare = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = `${window.location.origin}/lumajangtalks/${slugify(getCategoryTag(article.categoryId))}/${slugify(article.title)}`;
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
    } else if (activeCategory === 'Lumajang') {
      const locNames = locations.map((l) => l.toLowerCase().trim());
      matchesFilter = loc === 'lumajang' || locNames.includes(loc);
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

  // Get trending headline candidates for Lumajang sorted by highest traffic in past 7 days
  const headlineCandidates = getTrendingHeadlineCandidates(articles, 'lumajang');
  const heroMain = headlineCandidates[0] || null;
  const heroSub = headlineCandidates.slice(1, 4);

  const popularHarian = getTerpopulerHarian(articles, 5);
  const popularMingguan = getTerpopulerMingguan(articles, 5);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });


  // Track portal visit
  useEffect(() => {
    trackPortalVisit('lumajangtalks');
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans selection:bg-lumajang-400 selection:text-neutral-950 overflow-x-hidden">
      <SEO
        title="Lumajang Talks - Portal Berita Terkini Kab. Lumajang"
        description="Portal berita terkini seputar Kabupaten Lumajang, Gunung Semeru, Kecamatan, Kuliner Pisang Pasifik, Ekonomi, dan Komunitas Warga Lumajang."
        path="/lumajangtalks"
      />
      <Navbar 
        portal="lumajangtalks" 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        categories={locations}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryClick}
      />

      <main className="pt-[108px] pb-20">

        {/* TOP TICKER & BREAKING NEWS BANNER (LUMAJANG BRANDING) */}
        <div className="w-full bg-neutral-950 text-white border-b border-lumajang-500/40 shadow-sm fixed top-16 left-0 right-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-11 overflow-hidden">
            <div className="flex items-center gap-2 bg-lumajang-400 text-neutral-950 px-3 py-1 rounded text-xs font-black uppercase tracking-wider shrink-0 mr-3 animate-pulse">
              <Radio size={14} className="animate-spin" />
              <span className="hidden sm:inline">LUMAJANG TODAY</span>
              <span className="sm:hidden">LUMAJANG TODAY</span>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-xs text-neutral-300 border-r border-neutral-800 pr-4 mr-4 shrink-0 font-calibri">
              <Clock size={12} className="text-lumajang-400" />
              <span>{todayFormatted}</span>
            </div>

            <div className="flex-1 overflow-hidden relative text-xs font-medium text-neutral-200">
              <div className="whitespace-nowrap inline-block animate-marquee">
                {(articles.length > 0 ? (() => {
                  const latest = getLatestTickerArticles(articles, 5);
                  return [...latest, ...latest, ...latest, ...latest];
                })() : []).map((a, i) => (
                  <span key={`${a.id || 'art'}-${i}`} className="inline-flex items-center mx-6">
                    <span className="text-lumajang-400 font-bold mr-2">
                      [{getCategoryTag(a.categoryId)}]
                    </span>
                    <Link
                      to={`${getBasePath()}/${slugify(getCategoryTag(a.categoryId))}/${slugify(a.title)}`}
                      className="hover:text-lumajang-400 transition-colors"
                    >
                      {a.title}
                    </Link>
                    <span className="ml-6 text-neutral-700">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>



        {loading ? (
          <NewsFeedSkeleton portal="lumajangtalks" />
        ) : (
          <>
            {/* GNEXT/CNN STYLE PREMIUM HOME GRID FOR LUMAJANG TALKS */}
            {heroMain && !searchQuery && activeCategory === 'Semua' && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4 flex flex-col gap-6">
                
                {/* 1. PRIMARY SPLIT HEADLINE GRID (8 Cols Hero + 4 Cols Popular) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT PRIMARY BLOCK (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Big Hero Article Card (Split Left Text, Right Photo) */}
                    <Link
                      to={`${getBasePath()}/${slugify(getCategoryTag(heroMain.categoryId))}/${slugify(heroMain.title)}`}
                      className="group bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto md:min-h-[360px] hover:shadow-md hover:border-lumajang-400 transition-all duration-300"
                    >
                      {/* Left Side: Editorial Content */}
                      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="px-2.5 py-0.5 rounded-md bg-lumajang-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                              KABAR LUMAJANG
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[10px] font-extrabold uppercase tracking-wider border border-neutral-200">
                              {getCategoryTag(heroMain.categoryId)}
                            </span>
                          </div>
                          
                          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 leading-tight tracking-tight group-hover:text-lumajang-600 transition-colors duration-300">
                            {heroMain.title}
                          </h2>
                          
                          <p className="text-neutral-600 text-xs sm:text-sm mt-3.5 leading-relaxed line-clamp-3">
                            {getCleanExcerpt(heroMain.content, 180)}
                          </p>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-extrabold uppercase tracking-wide text-lumajang-600 flex items-center gap-1">
                            <MapPin size={13} />
                            {heroMain.news_location || 'Lumajang'}
                          </span>
                          <span className="font-medium flex items-center gap-1 font-calibri">
                            <Clock size={12} />
                            {formatDate(heroMain.date, (heroMain as any).created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Visual Cover */}
                      <div className="w-full md:w-[45%] h-[240px] md:h-auto bg-neutral-900 relative shrink-0 overflow-hidden">
                        <BlurImage
                          src={getArticleImage(heroMain)}
                          alt={heroMain.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10" />
                      </div>
                    </Link>

                    {/* Secondary Horizontal Items Side-By-Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {heroSub.slice(0, 2).map((sub, idx) => (
                        <Link
                          key={sub.id || idx}
                          to={`${getBasePath()}/${slugify(getCategoryTag(sub.categoryId))}/${slugify(sub.title)}`}
                          className="group bg-white p-4 rounded-xl border border-neutral-200 flex gap-4 hover:border-lumajang-400 hover:shadow-sm transition-all"
                        >
                          <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-neutral-950 relative">
                            <BlurImage
                              src={getArticleImage(sub)}
                              alt={sub.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col justify-between min-w-0 flex-1">
                            <div>
                              <span className="text-[9px] font-black text-lumajang-600 uppercase tracking-widest block mb-0.5">
                                {getCategoryTag(sub.categoryId)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-lumajang-600 transition-colors">
                                {sub.title}
                              </h4>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-calibri flex items-center gap-1">
                              <MapPin size={10} className="text-lumajang-600" />
                              {sub.news_location || 'Lumajang'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                  </div>

                  {/* RIGHT SIDEBAR POPULAR LIST (4 Cols - "TERPOPULER LUMAJANG HARIAN") */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-lumajang-600 pb-3 mb-4 gap-2">
                        <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                          <TrendingUp size={18} className="text-lumajang-600" />
                          <span>TERPOPULER LUMAJANG HARIAN</span>
                        </h3>
                        <span className="text-[10px] text-lumajang-700 font-extrabold tracking-widest bg-lumajang-50 px-2.5 py-1 rounded-md border border-lumajang-200 uppercase">
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
                              idx === 0 ? 'text-lumajang-600' : 'text-neutral-400'
                            }`}>
                              0{idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-lumajang-600 uppercase tracking-wider block mb-0.5">
                                {getCategoryTag(pop.categoryId)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-lumajang-600 transition-colors">
                                {pop.title}
                              </h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. MID GRID HEADLINES ("RAGAM KABAR LUMAJANG") */}
                <div className="border-t border-neutral-200 pt-6">
                  <div className="pb-3 border-b border-neutral-200 mb-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                      <Newspaper size={16} className="text-lumajang-600" />
                      <span>RAGAM KABAR LUMAJANG</span>
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
                          className="group flex flex-col gap-2 bg-white p-4 rounded-xl border border-neutral-200 hover:border-lumajang-400 transition-all shadow-2xs"
                        >
                          <h4 className="text-sm sm:text-base font-extrabold text-neutral-900 leading-snug group-hover:text-lumajang-600 transition-colors line-clamp-2">
                            {art.title}
                          </h4>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-400">
                            <span className="text-lumajang-600 font-extrabold uppercase tracking-wider block">
                              {getCategoryTag(art.categoryId)}
                            </span>
                            <span className="font-calibri">{art.news_location || 'Lumajang'}</span>
                          </div>
                        </Link>
                      ));
                    })()}
                  </div>
                </div>

                {/* 3. LUMAJANG ACCENT SPECIAL SEGMENT ("SOROTAN UTAMA LUMAJANG") */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-2">
                  <div 
                    className="lg:col-span-12 bg-lumajang-400 text-neutral-950 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col gap-6"
                    style={{ background: 'linear-gradient(135deg, #FDE600 0%, #FFF566 50%, #FFEA00 100%)' }}
                  >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full translate-x-20 -translate-y-20 pointer-events-none" />
                    
                    <div className="flex items-center justify-between border-b border-neutral-950/20 pb-3 z-10">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-widest flex items-center gap-2 text-neutral-950">
                        <span className="w-2.5 h-2.5 bg-neutral-950 rounded-full animate-ping" />
                        <span>SOROTAN UTAMA LUMAJANG</span>
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-950 text-white px-2.5 py-1 rounded cursor-pointer hover:bg-neutral-900 transition-colors shadow-xs">
                        LUMAJANG BERDAYA
                      </span>
                    </div>

                    {articles.length > 0 ? (
                      (() => {
                        const heroIds = new Set([heroMain?.id, ...heroSub.map(s => s.id)].filter(Boolean));
                        const availableForSorotan = articles.filter(a => !heroIds.has(a.id));
                        const focusArticle = availableForSorotan[0] || articles[1] || heroMain;
                        const subSorotan = availableForSorotan.slice(1, 4).length > 0 
                          ? availableForSorotan.slice(1, 4) 
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
                                  <span className="text-[12px] font-black text-neutral-800 uppercase tracking-widest block mb-1">
                                    {getCategoryTag(focusArticle.categoryId)}
                                  </span>
                                  <Link 
                                    to={`${getBasePath()}/${slugify(getCategoryTag(focusArticle.categoryId))}/${slugify(focusArticle.title)}`}
                                    className="hover:text-neutral-800 transition-colors block text-neutral-950"
                                  >
                                    <h4 className="text-xl sm:text-2xl font-black leading-tight mb-2 text-neutral-950">
                                      {focusArticle.title}
                                    </h4>
                                  </Link>
                                  <p className="text-[14px] text-neutral-800 leading-relaxed line-clamp-3">
                                    {getCleanExcerpt(focusArticle.content, 160)}
                                  </p>
                                </div>
                                <span className="text-[10px] text-neutral-800 mt-4 font-mono block">
                                  {focusArticle.news_location || 'Lumajang'} • {formatDate(focusArticle.date, (focusArticle as any).created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Quick-Links footer */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-950/20 pt-4 z-10 text-base sm:text-[18px]">
                              {subSorotan.map((art, idx) => (
                                <Link
                                  key={art.id || idx}
                                  to={`${getBasePath()}/${slugify(getCategoryTag(art.categoryId))}/${slugify(art.title)}`}
                                  className="text-neutral-950 hover:text-neutral-800 transition-all font-semibold line-clamp-2 leading-snug border-l-2 border-neutral-950 pl-3.5"
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
                  <div className="flex items-center justify-between border-b-2 border-lumajang-400 pb-2 bg-white px-4 py-3 rounded-t-xl shadow-2xs">
                    <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                      <Flame size={18} className="text-lumajang-400" />
                      <span>
                        {searchQuery
                          ? `PENCARIAN: "${searchQuery}"`
                          : activeCategory === 'Semua' 
                            ? 'KABAR LUMAJANG TERKINI' 
                            : `KECAMATAN / KATEGORI: ${activeCategory}`
                        }
                      </span>
                    </h3>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-bold text-lumajang-400 hover:text-neutral-950 transition-colors uppercase flex items-center gap-1"
                      >
                        <X size={14} />
                        <span>Hapus Pencarian</span>
                      </button>
                    )}
                  </div>

                  {filteredArticles.length === 0 && (
                    <div className="bg-lumajang-50 border border-lumajang-200 p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm text-lumajang-900 font-medium">
                      <span>
                        {searchQuery 
                          ? `Tidak ditemukan berita Lumajang untuk kata kunci "${searchQuery}".` 
                          : `Belum ada kabar berita khusus untuk ${activeCategory}.`}
                      </span>
                      <button
                        onClick={() => {
                          setActiveCategory('Semua');
                          setSearchQuery('');
                        }}
                        className="px-3 py-1.5 bg-lumajang-400 text-neutral-950 rounded-lg text-xs font-bold uppercase shrink-0 hover:bg-lumajang-500 transition-colors"
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
                              className="group bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 hover:border-lumajang-400 hover:shadow-md transition-all"
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
                                    <span className="bg-lumajang-400 text-neutral-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow">
                                      {catName}
                                    </span>
                                    {article.news_location && (
                                      <span className="bg-neutral-900/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow flex items-center gap-1">
                                        <MapPin size={9} className="text-lumajang-400" />
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
                                      className="text-neutral-400 hover:text-lumajang-600 transition-colors p-1"
                                      title="Bagikan kabar"
                                    >
                                      {copiedId === article.id ? (
                                        <Check size={14} className="text-lumajang-600" />
                                      ) : (
                                        <Share2 size={14} />
                                      )}
                                    </button>
                                  </div>

                                  <Link
                                    to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                    className="block"
                                  >
                                    <h4 className="text-base sm:text-xl font-bold text-neutral-900 leading-snug mb-2 group-hover:text-lumajang-600 transition-colors">
                                      {article.title}
                                    </h4>
                                  </Link>

                                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                                    {getCleanExcerpt(article.content, 140)}
                                  </p>

                                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-100">
                                    <Link
                                      to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-lumajang-600 uppercase tracking-wider hover:underline"
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
                    <div className="flex items-center justify-between border-b-2 border-lumajang-600 pb-3 mb-4 gap-2">
                      <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                        <Flame size={18} className="text-lumajang-600" />
                        <span>KABAR POPULER MINGGUAN</span>
                      </h3>
                      <span className="text-[10px] text-lumajang-700 font-extrabold tracking-widest bg-lumajang-50 px-2.5 py-1 rounded-md border border-lumajang-200 uppercase">
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
                            idx === 0 ? 'text-lumajang-600' : 'text-neutral-400'
                          }`}>
                            0{idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-lumajang-600 uppercase tracking-wider block mb-0.5">
                              {getCategoryTag(pop.categoryId)}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-lumajang-600 transition-colors">
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

                  {/* KECAMATAN LUMAJANG QUICK FILTER */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-lumajang-600" />
                      <span>KECAMATAN LUMAJANG</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {['Senduro', 'Pasrujambe', 'Pronojiwo', 'Candipuro', 'Pasirian', 'Tempeh', 'Yosowilangun', 'Sukodono', 'Klakah', 'Kedungjajang'].map((loc) => {
                        const isActive = activeCategory.toLowerCase().includes(loc.toLowerCase());
                        return (
                          <button
                            key={loc}
                            onClick={() => handleCategoryClick(loc)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-lumajang-400 text-neutral-950 font-black shadow-xs'
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
                    <div className="absolute top-0 right-0 w-24 h-24 bg-lumajang-500/20 rounded-full blur-xl pointer-events-none" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-lumajang-400 bg-lumajang-500/10 border border-lumajang-500/30 px-2.5 py-1 rounded-md inline-block mb-3">
                      Suara Warga Lumajang
                    </span>
                    <h4 className="text-base font-extrabold leading-snug mb-2">
                      Punya Kabar Warga atau Info Seputar Lumajang?
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      Kirimkan artikel, kabar kecamatan, atau agenda lokal melalui Studio Redaktur GNEXT untuk dipublikasikan di Lumajang Talks.
                    </p>
                    <Link
                      to="/studio"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-lumajang-400 hover:bg-lumajang-500 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
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

      <Footer portal="lumajangtalks" />
    </div>
  );
}
