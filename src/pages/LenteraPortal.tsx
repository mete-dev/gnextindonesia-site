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
  ChevronRight,
  Radio,
  Eye,
  MapPin,
  Globe,
  Compass,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';
import { supabase } from '../lib/supabase';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { Article } from './studio/types';
import { detectPortal, lenteraNetworks, ALL_PORTALS } from '../lib/portals';
import { getTrendingHeadlineCandidates, getPopularArticles, parseArticleDate, getLatestTickerArticles } from '../lib/trending';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { NewsFeedSkeleton } from '../components/NewsSkeletons';
import { LenteraLogo } from '../components/LenteraLogo';
import { trackPortalVisit } from '../lib/tracker';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';

export const lenteraFallbackArticles: Article[] = [
  {
    id: 'lentera-fb-1',
    title: 'Transformasi Digital Layanan Publik Jawa Timur Capai Efisiensi 90% di Tahun 2026',
    content: 'Pemerintah Provinsi Jawa Timur terus mendorong integrasi sistem pelayanan publik berbasis kecerdasan buatan dan aplikasi terpadu. Inovasi ini mempermudah masyarakat dalam mengurus perizinan, administrasi kependudukan, serta layanan kesehatan secara transparan dan cepat.',
    categoryId: 'cat-ekonomi',
    authorId: 'redaksi-lentera',
    status: 'published',
    date: '08 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    views: 4520,
    news_location: 'Surabaya',
  } as any,
  {
    id: 'lentera-fb-2',
    title: 'Pariwisata Gunung Bromo & Semeru Catat Rekor Kunjungan Wisatawan Mancanegara',
    content: 'Kawasan wisata Bromo Tengger Semeru mengalami peningkatan drastis kunjungan wisatawan domestik dan luar negeri. Pengembangan ekowisata ramah lingkungan dan homestay lokal mendongkrak ekonomi warga sekitar.',
    categoryId: 'cat-wisata',
    authorId: 'redaksi-lentera',
    status: 'published',
    date: '07 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
    views: 6180,
    news_location: 'Malang',
  } as any,
  {
    id: 'lentera-fb-3',
    title: 'Festival Produk Kreatif UMKM Jawa Timur Tembus Pasar Ekspor Asia Tenggara',
    content: 'Ajang tahunan pameran UMKM yang digelar di Grand City Surabaya berhasil membukukan transaksi miliaran rupiah. Produk kriya, olahan kopi organik, dan busana batik khas daerah menarik minat pembeli mancanegara.',
    categoryId: 'cat-kreatif',
    authorId: 'redaksi-lentera',
    status: 'published',
    date: '06 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80',
    views: 3890,
    news_location: 'Jawa Timur',
  } as any,
  {
    id: 'lentera-fb-4',
    title: 'Pembangunan Akses Jalur Lintas Selatan Jatim Percepat Pertumbuhan Ekonomi Pesisir',
    content: 'Penyelesaian infrastruktur Jalur Lintas Selatan (JLS) yang menghubungkan Banyuwangi hingga Pacitan membawa dampak positif signifikan bagi konektivitas antar-wilayah dan distribusi hasil laut serta pertanian.',
    categoryId: 'cat-keuangan',
    authorId: 'redaksi-lentera',
    status: 'published',
    date: '05 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    views: 2940,
    news_location: 'Banyuwangi',
  } as any,
  {
    id: 'lentera-fb-5',
    title: 'Inovasi Kendaraan Listrik Karya Mahasiswa Surabaya Raih Penghargaan Internasional',
    content: 'Tim riset mahasiswa perguruan tinggi di Surabaya merancang mobil bertenaga surya bermaterial ramah lingkungan yang memenangkan kejuaraan efisiensi energi di tingkat internasional.',
    categoryId: 'cat-teknologi',
    authorId: 'redaksi-lentera',
    status: 'published',
    date: '04 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    views: 5310,
    news_location: 'Surabaya',
  } as any,
  {
    id: 'lentera-fb-6',
    title: 'Panen Raya Padi Organik di Kediri Pertahankan Ketahanan Pangan Nasional',
    content: 'Para petani di wilayah Kediri dan sekitarnya sukses meningkatkan produktivitas panen berkat metode pertanian ramah lingkungan dan teknologi sistem irigasi pintar modern.',
    categoryId: 'cat-sosial',
    authorId: 'redaksi-lentera',
    status: 'published',
    date: '03 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    views: 3120,
    news_location: 'Kediri',
  } as any
];

const getBasePath = (pId?: string) => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const portal = detectPortal(hostname, pathname);
    const id = pId || (portal ? portal.id : 'lenterabangsa');
    if (hostname.startsWith(id + '.')) return '';
    return `/${id}`;
  }
  return pId ? `/${pId}` : '/lenterabangsa';
};

const getDefaultLocations = (pId: string, pName: string) => {
  if (pId.includes('jogja')) return ['Semua', pName, 'Kota Jogja', 'Sleman', 'Bantul', 'Gunungkidul', 'Kulon Progo'];
  if (pId.includes('aceh')) return ['Semua', pName, 'Banda Aceh', 'Lhokseumawe', 'Sabang', 'Langsa', 'Meulaboh'];
  if (pId.includes('jabar')) return ['Semua', pName, 'Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cirebon', 'Garut'];
  if (pId.includes('jateng')) return ['Semua', pName, 'Semarang', 'Solo', 'Magelang', 'Banyumas', 'Pekalongan', 'Kudus'];
  if (pId.includes('jatim')) return ['Semua', pName, 'Surabaya', 'Malang', 'Sidoarjo', 'Gresik', 'Kediri', 'Jember', 'Banyuwangi'];
  if (pId.includes('jakarta')) return ['Semua', pName, 'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'];
  if (pId.includes('bali')) return ['Semua', pName, 'Denpasar', 'Badung', 'Gianyar', 'Buleleng', 'Tabanan'];
  if (pId.includes('sumut')) return ['Semua', pName, 'Medan', 'Deli Serdang', 'Binjai', 'Pematangsiantar', 'Toba'];
  return ['Semua', pName, 'Nasional', 'Politik', 'Ekonomi', 'Daerah', 'Budaya'];
};

export default function LenteraPortalPage() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const portal = detectPortal(hostname, pathname);
  const portalName = portal && portal.id !== 'gnext' ? portal.name : 'Lentera Bangsa';
  const portalId = portal ? portal.id : 'lenterabangsa';
  const basePath = getBasePath(portalId);

  useEffect(() => {
    // Dynamically update favicon based on portal
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#23150C';
      ctx.beginPath();
      ctx.roundRect(0, 0, 64, 64, 12);
      ctx.fill();

      ctx.fillStyle = '#D98319';
      ctx.font = '900 42px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('L', 32, 34);
    }

    const faviconUrl = canvas.toDataURL();

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link') as HTMLLinkElement;
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [portalId]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>(() => getDefaultLocations(portalId, portalName));
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLocations(getDefaultLocations(portalId, portalName));
    loadData();
  }, [portalId, portalName]);

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
          portal: a.portal || 'lenterabangsa',
          cover_image:
            a.cover_image ||
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
        }));
      }

      // Lentera portals display all articles from the shared database, prioritizing the current portal's region
      const prioritizedArticles = [...fetched].sort((a, b) => {
        const portalA = (a.portal || '').toLowerCase();
        const portalB = (b.portal || '').toLowerCase();
        
        // Match specific portal ID
        const matchA = portalA === portalId.toLowerCase();
        const matchB = portalB === portalId.toLowerCase();
        if (matchA && !matchB) return -1;
        if (!matchA && matchB) return 1;

        // Match regional keyword in location
        const locKeyword = portalName.toLowerCase().replace(/^lentera\s*/i, '').trim();
        const locA = (a.news_location || '').toLowerCase().trim();
        const locB = (b.news_location || '').toLowerCase().trim();
        if (locKeyword && locKeyword !== 'bangsa') {
          const isLocA = locA.includes(locKeyword);
          const isLocB = locB.includes(locKeyword);
          if (isLocA && !isLocB) return -1;
          if (!isLocA && isLocB) return 1;
        }

        const dateA = parseArticleDate(a.date, (a as any).created_at).getTime();
        const dateB = parseArticleDate(b.date, (b as any).created_at).getTime();
        return dateB - dateA;
      });

      // Only use fallback articles if DB returns no published articles
      const finalArticles = prioritizedArticles.length > 0 
        ? prioritizedArticles 
        : filterValidArticles(lenteraFallbackArticles);

      setArticles(finalArticles);
    } catch (err) {
      console.error('Lentera news load error:', err);
      setArticles(filterValidArticles(lenteraFallbackArticles));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTag = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    if (found) return found.name;
    if (catId === 'cat-sosial') return 'Sosial';
    if (catId === 'cat-pendidikan') return 'Pendidikan';
    if (catId === 'cat-keuangan') return 'Keuangan';
    if (catId === 'cat-lingkungan') return 'Lingkungan';
    if (catId === 'cat-wisata') return 'Wisata & Budaya';
    if (catId === 'cat-ekonomi') return 'Ekonomi & Bisnis';
    if (catId === 'cat-kreatif') return 'Kreatif & Media';
    if (catId === 'cat-teknologi') return 'Teknologi';
    return 'Berita';
  };

  const handleShare = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();

    const fullUrl = `${window.location.origin}${basePath}/${slugify(
      getCategoryTag(article.categoryId)
    )}/${slugify(article.title)}`;
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

  const filteredArticles = articles.filter((a) => {
    const loc = (a.news_location || '').toLowerCase().trim();
    const catTag = getCategoryTag(a.categoryId).toLowerCase().trim();
    const activeLower = activeCategory.toLowerCase().trim();
    const activeSlug = slugify(activeCategory);

    let matchesFilter = true;
    if (activeCategory === 'Semua' || activeLower === 'semua') {
      matchesFilter = true;
    } else if (activeCategory === portalName || activeLower === portalName.toLowerCase() || activeLower === 'lentera bangsa' || activeLower === 'lentera') {
      // Filter strictly to this regional area/portal if it is a regional Lentera network site
      const locKeyword = portalName.toLowerCase().replace(/^lentera\s*/i, '').trim();
      if (locKeyword && locKeyword !== 'bangsa') {
        const portal = (a.portal || '').toLowerCase();
        matchesFilter = (
          portal.includes(locKeyword) ||
          loc.includes(locKeyword) ||
          (locKeyword === 'jogja' && (loc.includes('yogyakarta') || loc.includes('jogja'))) ||
          (locKeyword === 'jabar' && (loc.includes('jawabarat') || loc.includes('jawa barat') || loc.includes('bandung'))) ||
          (locKeyword === 'jateng' && (loc.includes('jawa tengah') || loc.includes('semarang'))) ||
          (locKeyword === 'jatim' && (loc.includes('jawa timur') || loc.includes('surabaya')))
        );
      } else {
        matchesFilter = true;
      }
    } else {
      matchesFilter =
        (loc.length > 0 && activeLower.length > 0 && (loc.includes(activeLower) || activeLower.includes(loc))) ||
        (catTag.length > 0 && activeLower.length > 0 && (catTag.includes(activeLower) || activeLower.includes(catTag))) ||
        (loc.length > 0 && slugify(loc) === activeSlug) ||
        (catTag.length > 0 && slugify(catTag) === activeSlug);
    }

    const matchesSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Get trending headline candidates for Lentera location (fallback to highest traffic national if no local articles)
  const headlineCandidates = getTrendingHeadlineCandidates(articles, 'lentera', portalName);
  const heroMain = headlineCandidates[0] || null;
  const heroSub = headlineCandidates.slice(1, 4);

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Highlight key regional portals for network bar
  const topRegionalNetworks = [
    { id: 'lenterajogja', name: 'Jogja', path: '/lenterajogja' },
    { id: 'lenterajatim', name: 'Jatim', path: '/lenterajatim' },
    { id: 'lenterajabar', name: 'Jabar', path: '/lenterajabar' },
    { id: 'lenterajateng', name: 'Jateng', path: '/lenterajateng' },
    { id: 'lenterajakarta', name: 'Jakarta', path: '/lenterajakarta' },
    { id: 'lenterabali', name: 'Bali', path: '/lenterabali' },
    { id: 'lenterasumut', name: 'Sumut', path: '/lenterasumut' },
    { id: 'lenteraaceh', name: 'Aceh', path: '/lenteraaceh' },
  ];


  // Track portal visit
  useEffect(() => {
    trackPortalVisit(portalId || 'lenterabangsa');
  }, [portalId]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23150C] font-sans selection:bg-[#8C4A21] selection:text-white overflow-x-hidden">
      <SEO
        title={`${portalName} - Portal Berita & Informasi Terdepan`}
        description={`Portal berita terkini, akurat, dan berimbang seputar ${portalName} dan kawasan sekitarnya.`}
        path={basePath || '/'}
      />
      <Navbar 
        portal={portalId} 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        categories={locations}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryClick}
      />

      <main className="pt-[108px] pb-20">
        {/* TOP TICKER BANNER (DARK COFFEE & GOLD ACCENTS) */}
        <div className="w-full bg-[#1B0F08] text-white border-b border-[#D98319]/35 shadow-md fixed top-16 left-0 right-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-11 overflow-hidden">
            <div className="flex items-center gap-2 bg-[#D98319] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shrink-0 mr-3 animate-pulse shadow-sm">
              <Radio size={14} className="animate-spin text-white" />
              <span className="hidden sm:inline">{portalName.toUpperCase()} TODAY</span>
              <span className="sm:hidden">{portalName.toUpperCase()}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#EADCC9] border-r border-[#3A2315] pr-4 mr-4 shrink-0 font-calibri">
              <Clock size={12} className="text-[#D98319]" />
              <span>{todayFormatted}</span>
            </div>

            <div className="flex-1 overflow-hidden relative text-xs font-medium text-[#FAF7F2]">
              <div className="whitespace-nowrap inline-block animate-marquee">
                {(articles.length > 0 ? (() => {
                  const latest = getLatestTickerArticles(articles, 5);
                  return [...latest, ...latest, ...latest, ...latest];
                })() : []).map((a, i) => (
                  <span key={`${a.id || 'art'}-${i}`} className="inline-flex items-center mx-6">
                    <span className="text-[#D98319] font-bold mr-2">
                      [{getCategoryTag(a.categoryId)}]
                    </span>
                    <Link
                      to={`${basePath}/${slugify(getCategoryTag(a.categoryId))}/${slugify(a.title)}`}
                      className="hover:text-[#F5A847] transition-colors"
                    >
                      {a.title}
                    </Link>
                    <span className="ml-6 text-[#5C4435]">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>



        {loading ? (
          <NewsFeedSkeleton portal={portalId} />
        ) : (
          <>
            {/* HERO FEATURED STORY */}
            {heroMain && !searchQuery && activeCategory === 'Semua' && (
              <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-4">
                <div className="bg-white rounded-2xl border border-[#EADCC9] shadow-sm p-4 sm:p-5 lg:p-6 overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Primary Lead Story (7 Cols) */}
                    <div className="lg:col-span-7 flex flex-col group h-full">
                      <Link
                        to={`${getBasePath()}/${slugify(
                          getCategoryTag(heroMain.categoryId)
                        )}/${slugify(heroMain.title)}`}
                        className="relative flex flex-col h-full rounded-2xl overflow-hidden shadow-sm"
                      >
                        {/* Cover Image */}
                        <div className="relative w-full h-full min-h-[300px] lg:min-h-[400px] bg-[#1E120A]">
                          <BlurImage
                            src={getArticleImage(heroMain)}
                            alt={heroMain.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1B0F08]/95 via-[#1B0F08]/45 to-transparent pointer-events-none z-10" />

                          {/* Text Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#D98319] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                                <Flame size={12} className="animate-pulse" />
                                <span>KABAR UTAMA</span>
                              </span>
                              <span className="text-white/60">•</span>
                              <span className="text-xs font-extrabold uppercase tracking-wider text-[#F5A847]">
                                {getCategoryTag(heroMain.categoryId)}
                              </span>
                            </div>

                            {/* Headline Title */}
                            <h2 style={{ fontSize: '28px' }} className="font-sans font-extrabold text-white leading-tight tracking-tight group-hover:text-[#F5A847] transition-colors">
                              {heroMain.title}
                            </h2>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Sub-Lead Column (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-start lg:border-l lg:border-[#EADCC9] lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#EADCC9]">
                      <div className="pb-2.5 flex items-center justify-between border-b border-[#EADCC9] mb-2">
                        <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#23150C] flex items-center gap-2">
                          <TrendingUp size={16} className="text-[#8C4A21]" />
                          <span>SOROTAN REGIONAL</span>
                        </h3>
                        <span className="text-[11px] text-[#8C715E] font-mono">Trending</span>
                      </div>

                      <div className="flex flex-col divide-y divide-[#F2E8DC]">
                        {heroSub.map((sub, idx) => (
                          <Link
                            key={sub.id || idx}
                            to={`${getBasePath()}/${slugify(
                              getCategoryTag(sub.categoryId)
                            )}/${slugify(sub.title)}`}
                            className="py-2.5 group flex gap-3.5 items-center hover:bg-[#FAF3E8] px-2 rounded-xl transition-colors"
                          >
                            <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#1E120A] relative shadow-sm">
                              <BlurImage
                                src={getArticleImage(sub)}
                                alt={sub.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-1 left-1 bg-[#1B0F08]/90 text-[#D98319] font-mono text-[9px] font-black px-1.5 py-0.5 rounded border border-[#D98319]/30 z-10 pointer-events-none">
                                0{idx + 1}
                              </span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-[10px] font-black text-[#8C4A21] uppercase tracking-wider mb-1">
                                {getCategoryTag(sub.categoryId)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-[#23150C] leading-snug line-clamp-2 group-hover:text-[#8C4A21] transition-colors font-sans">
                                {sub.title}
                              </h4>
                              <span className="text-[10px] text-[#8C715E] mt-1 font-calibri flex items-center gap-1">
                                <Clock size={10} />
                                {sub.date || 'Terkini'}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* MAIN FEED & SIDEBAR SECTION */}
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Feed */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b-2 border-[#8C4A21] pb-2 bg-white px-4 py-3 rounded-t-2xl shadow-sm border border-[#EADCC9]">
                    <h3 className="text-lg font-black uppercase tracking-tight text-[#23150C] flex items-center gap-2">
                      <Flame size={18} className="text-[#8C4A21]" />
                      <span>
                        {searchQuery
                          ? `PENCARIAN: "${searchQuery}"`
                          : activeCategory === 'Semua'
                            ? `KABAR TERKINI ${portalName.toUpperCase()}`
                            : `KATEGORI: ${activeCategory}`
                        }
                      </span>
                    </h3>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-bold text-[#8C4A21] hover:text-[#5C4435] transition-colors uppercase flex items-center gap-1"
                      >
                        <X size={14} />
                        <span>Hapus Pencarian</span>
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-[#EADCC9]">
                      <div className="w-8 h-8 border-4 border-[#8C4A21] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs font-mono text-[#8C715E]">
                        Memuat kabar {portalName}...
                      </p>
                    </div>
                  ) : filteredArticles.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-[#EADCC9]">
                      <p className="text-sm font-medium text-[#5C4435]">
                        Belum ada berita untuk kategori ini di {portalName}.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <AnimatePresence mode="popLayout">
                        {filteredArticles.slice(0, 16).map((article) => {
                          const catName = getCategoryTag(article.categoryId);
                          const image = (article as any).cover_image;

                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.3 }}
                              key={article.id}
                              className="group bg-white p-4 sm:p-5 rounded-2xl border border-[#EADCC9] hover:border-[#D98319] hover:shadow-md transition-all"
                            >
                              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch h-full">
                                <Link
                                  to={`${getBasePath()}/${slugify(catName)}/${slugify(
                                    article.title
                                  )}`}
                                  className="w-full aspect-[16/10] sm:aspect-none sm:w-48 sm:h-auto sm:self-stretch rounded-xl overflow-hidden shrink-0 bg-[#1E120A] relative"
                                >
                                  <BlurImage
                                    src={image}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                    <span className="bg-[#8C4A21] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
                                      {catName}
                                    </span>
                                    {article.news_location && (
                                      <span className="bg-[#1B0F08]/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow flex items-center gap-1">
                                        <MapPin size={9} className="text-[#D98319]" />
                                        {article.news_location}
                                      </span>
                                    )}
                                  </div>
                                </Link>

                                <div className="flex flex-col flex-1 min-w-0 h-full">
                                  <div className="flex items-center justify-between text-xs text-[#8C715E] mb-1.5 font-calibri">
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} />
                                      {article.date || 'Terbaru'}
                                    </span>

                                    <button
                                      onClick={(e) => handleShare(e, article)}
                                      className="text-[#8C715E] hover:text-[#8C4A21] transition-colors p-1"
                                    >
                                      {copiedId === article.id ? (
                                        <Check size={14} className="text-emerald-700" />
                                      ) : (
                                        <Share2 size={14} />
                                      )}
                                    </button>
                                  </div>

                                  <Link
                                    to={`${getBasePath()}/${slugify(catName)}/${slugify(
                                      article.title
                                    )}`}
                                    className="block"
                                  >
                                    <h4 className="text-base sm:text-xl font-bold text-[#23150C] leading-snug mb-2 group-hover:text-[#8C4A21] transition-colors">
                                      {article.title}
                                    </h4>
                                  </Link>

                                  <p className="text-xs sm:text-sm text-[#5C4435] line-clamp-2 leading-relaxed mb-3">
                                    {article.content}
                                  </p>

                                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-[#F2E8DC]">
                                    <Link
                                      to={`${getBasePath()}/${slugify(catName)}/${slugify(
                                        article.title
                                      )}`}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-[#8C4A21] uppercase tracking-wider hover:underline"
                                    >
                                      <span>Baca Selengkapnya</span>
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

                {/* Right Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* POPULAR WIDGET */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EADCC9] shadow-sm">
                    <div className="flex items-center justify-between border-b-2 border-[#8C4A21] pb-3 mb-4 gap-2">
                      <h3 className="text-base font-black uppercase tracking-tight text-[#23150C] flex items-center gap-2">
                        <Flame size={18} className="text-[#8C4A21]" />
                        <span>POPULER DI {portalName.toUpperCase()}</span>
                      </h3>
                      <span className="text-[10px] text-[#8C4A21] font-extrabold tracking-widest bg-[#FAF3E8] px-2.5 py-1 rounded-md border border-[#EADCC9] uppercase">
                        HOT
                      </span>
                    </div>

                    <div className="flex flex-col divide-y divide-[#F2E8DC]">
                      {articles.slice(0, 5).map((pop, idx) => (
                        <Link
                          key={pop.id || idx}
                          to={`${getBasePath()}/${slugify(
                            getCategoryTag(pop.categoryId)
                          )}/${slugify(pop.title)}`}
                          className="py-3.5 group flex gap-3.5 items-start hover:bg-[#FAF3E8] px-2 rounded-xl transition-colors"
                        >
                          <span className={`text-2xl font-black font-display shrink-0 w-8 text-center ${
                            idx === 0 ? 'text-[#8C4A21]' : 'text-[#8C715E]'
                          }`}>
                            0{idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-[#8C4A21] uppercase tracking-wider block mb-0.5">
                              {getCategoryTag(pop.categoryId)}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-[#23150C] leading-snug line-clamp-2 group-hover:text-[#8C4A21] transition-colors">
                              {pop.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-[#8C715E] mt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <Eye size={11} />
                                {(pop as any).views || 2500 + idx * 400} dibaca
                              </span>
                            </div>
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

      <Footer portal={portalId} />
    </div>
  );
}
