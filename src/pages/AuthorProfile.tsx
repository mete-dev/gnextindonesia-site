import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Eye, Instagram, Mail, Phone, BookOpen, ChevronRight, MessageSquare, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Article, Category, User } from './studio/types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { detectPortal, getPortalById } from '../lib/portals';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';

// Skeleton Component
function AuthorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50/50 pt-24 md:pt-32 pb-24">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile Card Skeleton */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 md:p-8 shadow-xs mb-10 animate-pulse">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neutral-200" />
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="h-8 bg-neutral-200 rounded-md w-48 mx-auto md:mx-0" />
              <div className="h-4 bg-neutral-100 rounded w-32 mx-auto md:mx-0" />
              <div className="h-4 bg-neutral-100 rounded w-64 mx-auto md:mx-0" />
              <div className="flex justify-center md:justify-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-neutral-200" />
                <div className="w-8 h-8 rounded-full bg-neutral-200" />
                <div className="w-8 h-8 rounded-full bg-neutral-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Title Skeleton */}
        <div className="h-6 bg-neutral-200 rounded w-48 mb-6 animate-pulse" />

        {/* Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-4 flex gap-4 animate-pulse">
              <div className="w-24 sm:w-32 h-24 sm:h-28 rounded-xl bg-neutral-200 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-neutral-200 rounded w-16" />
                <div className="h-5 bg-neutral-200 rounded w-full" />
                <div className="h-5 bg-neutral-200 rounded w-4/5" />
                <div className="h-3 bg-neutral-100 rounded w-24 pt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuthorProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const cleanUsername = username ? username.replace(/^@/, '') : '';

  const [author, setAuthor] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Determine active portal based on hostname
  const getActivePortalId = (): string => {
    if (typeof window === 'undefined') return 'gnext';
    const host = window.location.hostname.toLowerCase();
    
    if (host.startsWith('finance.')) return 'finance';
    if (host.startsWith('gummah.') || host.startsWith('g-ummah.') || host.startsWith('ummah.')) return 'gummah';
    if (host.startsWith('yoikijatim.')) return 'yoikijatim';
    if (host.startsWith('lumajangtalks.')) return 'lumajangtalks';
    if (host.startsWith('lentera')) {
      const match = host.match(/^lenterabangsa|^lentera[a-z]+/);
      return match ? match[0] : 'lenterabangsa';
    }
    
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.startsWith('/yoikijatim/')) return 'yoikijatim';
    if (pathname.startsWith('/lumajangtalks/')) return 'lumajangtalks';
    
    return 'gnext';
  };

  const activePortal = getActivePortalId();
  const portalObj = getPortalById(activePortal);
  const portalName = portalObj?.name || 'Gnext News';

  useEffect(() => {
    async function loadAuthorProfileAndArticles() {
      if (!cleanUsername) {
        setErrorMsg('Username tidak valid.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Fetch user by username from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (userError || !userData) {
          setErrorMsg('Penulis tidak ditemukan.');
          setLoading(false);
          return;
        }

        const typedUser = userData as User;
        setAuthor(typedUser);

        // 2. Fetch all published articles and categories
        const metadata = await fetchPublishedArticlesAndMetadata(true);
        setCategories(metadata.categories || []);

        // 3. Filter articles matching the author ID
        const authorArticles = (metadata.articles || []).filter(
          (art: Article) => art.authorId === typedUser.id || art.author_id === typedUser.id
        );

        setArticles(authorArticles);
      } catch (err) {
        console.error('Failed to load author profile:', err);
        setErrorMsg('Gagal memuat profil penulis.');
      } finally {
        setLoading(false);
      }
    }

    loadAuthorProfileAndArticles();
  }, [cleanUsername]);

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (cat) return cat.name;
    if (catId === 'cat-sosial') return 'Sosial';
    if (catId === 'cat-pendidikan') return 'Pendidikan';
    if (catId === 'cat-keuangan') return 'Keuangan';
    if (catId === 'cat-lingkungan') return 'Lingkungan';
    return 'News';
  };

  const getDomicileLabel = (domisiliInput?: any): string => {
    if (!domisiliInput) return 'Indonesia';
    
    // If it is already an object
    if (typeof domisiliInput === 'object') {
      try {
        const parts = [];
        if (domisiliInput.kota) parts.push(domisiliInput.kota);
        if (domisiliInput.provinsi && domisiliInput.provinsi !== domisiliInput.kota) parts.push(domisiliInput.provinsi);
        if (domisiliInput.negara && domisiliInput.negara !== 'Indonesia') parts.push(domisiliInput.negara);
        if (parts.length === 0) return domisiliInput.detail || 'Indonesia';
        return parts.join(', ');
      } catch (e) {
        return 'Indonesia';
      }
    }

    // If it's a string, try parsing it as JSON
    try {
      const parsed = JSON.parse(domisiliInput);
      if (parsed && typeof parsed === 'object') {
        const parts = [];
        if (parsed.kota) parts.push(parsed.kota);
        if (parsed.provinsi && parsed.provinsi !== parsed.kota) parts.push(parsed.provinsi);
        if (parsed.negara && parsed.negara !== 'Indonesia') parts.push(parsed.negara);
        if (parts.length === 0) return parsed.detail || 'Indonesia';
        return parts.join(', ');
      }
    } catch (e) {
      // It's a plain string
      return String(domisiliInput);
    }

    return 'Indonesia';
  };

  // Sum total views across all author's articles
  const totalViews = articles.reduce((sum, art) => sum + (art.views || 0), 0);

  // Fallback avatar initial
  const initials = author?.name
    ? author.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
        : 'P';

  const isSubdomain = typeof window !== 'undefined' && (
    window.location.hostname.toLowerCase().startsWith('news.') ||
    window.location.hostname.toLowerCase().startsWith('yoikijatim.') ||
    window.location.hostname.toLowerCase().startsWith('lumajangtalks.') ||
    window.location.hostname.toLowerCase().startsWith('gummah.') ||
    window.location.hostname.toLowerCase().startsWith('g-ummah.') ||
    window.location.hostname.toLowerCase().startsWith('ummah.') ||
    window.location.hostname.toLowerCase().startsWith('finance.') ||
    window.location.hostname.toLowerCase().startsWith('lentera')
  );

  const routePrefix = isSubdomain
    ? ''
    : activePortal === 'yoikijatim' 
    ? '/yoikijatim' 
    : activePortal === 'lumajangtalks' 
    ? '/lumajangtalks' 
    : activePortal === 'gummah' 
    ? (typeof window !== 'undefined' && window.location.pathname.startsWith('/ummah') ? '/ummah' : '/gummah') 
    : activePortal.startsWith('lentera')
    ? `/${activePortal}`
    : '/news';

  const getArticleDetailUrl = (art: Article) => {
    const slug = art.id; // Usually matched via :categorySlug/:slug where slug is the id or unique slug
    // Let's build a safe detail URL structure
    const catSlug = 'berita';
    return `${routePrefix}/${catSlug}/${art.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
        <Navbar portal={activePortal} />
        <AuthorProfileSkeleton />
        <Footer portal={activePortal} />
      </div>
    );
  }

  if (errorMsg || !author) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-between">
        <Navbar portal={activePortal} />
        <main className="pt-24 md:pt-32 pb-24 flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-200 p-8 text-center shadow-xs">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-400">
              <Award size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">Penulis Tidak Ditemukan</h1>
            <p className="text-neutral-500 text-sm mb-6">
              Maaf, profil publik penulis dengan username <strong className="text-neutral-800">@{cleanUsername}</strong> tidak dapat ditemukan atau telah dinonaktifkan.
            </p>
            <button
              onClick={() => navigate(routePrefix || '/')}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <ArrowLeft size={16} /> Kembali ke Beranda
            </button>
          </div>
        </main>
        <Footer portal={activePortal} />
      </div>
    );
  }

  // Accent color mapping based on portal
  const accentColorClass = 
    activePortal === 'yoikijatim' ? 'bg-orange-600 text-white' :
    activePortal === 'lumajangtalks' ? 'bg-lumajang-400 text-neutral-950' :
    activePortal === 'gummah' ? 'bg-emerald-800 text-white' :
    'bg-red-600 text-white';

  const accentTextClass = 
    activePortal === 'yoikijatim' ? 'text-orange-600' :
    activePortal === 'lumajangtalks' ? 'text-lumajang-400' :
    activePortal === 'gummah' ? 'text-emerald-700' :
    'text-red-600';

  const accentBorderClass = 
    activePortal === 'yoikijatim' ? 'border-orange-200 focus:ring-orange-600' :
    activePortal === 'lumajangtalks' ? 'border-lumajang-200 focus:ring-lumajang-400' :
    activePortal === 'gummah' ? 'border-emerald-200 focus:ring-emerald-800' :
    'border-red-200 focus:ring-red-600';

  return (
    <div className="min-h-screen bg-neutral-50/40 relative flex flex-col justify-between">
      <SEO 
        title={`${author.name} | Profil Penulis - ${portalName}`}
        description={`Kumpulan hasil karya tulisan, jurnalisme, dan artikel berita yang diterbitkan oleh ${author.name} di portal ${portalName}.`}
        image="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&h=630&q=80"
        path={`/${author.username}`}
        type="profile"
      />

      <Navbar portal={activePortal} />

      <main className="pt-24 md:pt-32 pb-24 flex-1">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb Navigation */}
          <Breadcrumbs
            portal={activePortal}
            items={[
              { label: portalName, path: routePrefix || '/' },
              { label: 'Penulis' },
              { label: author.name, active: true }
            ]}
            className="mb-6"
          />

          {/* Author Profile Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-xs mb-10 overflow-hidden relative"
          >
            {/* Subtle premium background shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
              {/* Avatar Photo or Initial representation */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-neutral-900 text-white font-display font-bold flex items-center justify-center text-3xl shadow-md border-4 border-neutral-50 shrink-0 select-none">
                {initials}
              </div>

              {/* Bio details and stats */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-neutral-900 leading-none">
                    {author.name}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex self-center ${accentColorClass}`}>
                    {author.role}
                  </span>
                </div>

                <p className="text-sm text-neutral-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-1.5">
                  <MapPin size={15} className="text-neutral-400" />
                  Domisili: {getDomicileLabel(author.domisili)}
                </p>

                {/* Info summary or tagline block */}
                <p className="text-sm text-neutral-600 max-w-xl mb-6 leading-relaxed">
                  Penulis aktif jaringan <span className="font-bold text-neutral-800">{portalName}</span> berkomitmen menyajikan liputan informasi berimbang, mendalam, dan terpercaya bagi masyarakat.
                </p>

                {/* Social media communication channels */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {author.instagram_link && (
                    <a 
                      href={author.instagram_link.startsWith('http') ? author.instagram_link : `https://instagram.com/${author.instagram_link.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-bold transition-all inline-flex items-center gap-2"
                    >
                      <Instagram size={14} className="text-pink-600" /> 
                      {author.instagram_followers ? `${author.instagram_followers.toLocaleString()} Followers` : 'Instagram'}
                    </a>
                  )}

                  {author.email && (
                    <a 
                      href={`mailto:${author.email}`}
                      className="px-4 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-bold transition-all inline-flex items-center gap-2"
                    >
                      <Mail size={14} className="text-neutral-500" />
                      Email
                    </a>
                  )}

                  {author.whatsapp && (
                    <a 
                      href={`https://wa.me/${author.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-bold transition-all inline-flex items-center gap-2"
                    >
                      <MessageSquare size={14} className="text-emerald-600" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Stats Panel (Bento block) */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 shrink-0 w-full md:w-auto md:min-w-[180px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-neutral-100 md:pl-8">
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Total Karya</p>
                  <p className="text-3xl font-display font-black text-neutral-900 mt-1">{articles.length}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Artikel Terbit</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Pembaca</p>
                  <p className={`text-3xl font-display font-black mt-1 ${accentTextClass}`}>{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 font-medium">Kali Dilihat</p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Published Articles Feed Title */}
          <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
            <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
              <BookOpen size={18} className="text-neutral-500" />
              Karya Tulisan Diterbitkan
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${accentColorClass}`}>
                {articles.length}
              </span>
            </h2>
          </div>

          {/* Articles Grid or Feed */}
          {articles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-xl mx-auto">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                <BookOpen size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1">Belum Ada Artikel Terbit</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-normal">
                Karya-karya tulisan hasil liputan dari {author.name} saat ini sedang dalam proses review redaksi atau belum diterbitkan ke publik.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => {
                const itemImg = art.cover_image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80';
                return (
                  <motion.div
                    key={art.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group"
                  >
                    {/* Article Image Cover */}
                    <div className="w-full sm:w-44 h-48 sm:h-auto shrink-0 relative overflow-hidden bg-neutral-100">
                      <BlurImage
                        src={itemImg}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      
                      {/* Floating Category Tag for mobile */}
                      <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded sm:hidden">
                        {getCategoryName(art.categoryId)}
                      </span>
                    </div>

                    {/* Article Content Details */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Desktop category badge */}
                        <div className="hidden sm:flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${accentTextClass}`}>
                            {getCategoryName(art.categoryId)}
                          </span>
                          {art.sub_category && (
                            <>
                              <span className="text-neutral-300 text-xs">&bull;</span>
                              <span className="text-[10px] text-neutral-500 font-medium">
                                {art.sub_category}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-display font-bold text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-800 mb-2">
                          <Link to={getArticleDetailUrl(art)}>
                            {art.title}
                          </Link>
                        </h3>
                      </div>

                      {/* Footer/Meta row of the card */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-50 pt-3 mt-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={11} className="text-neutral-400" />
                            {art.date}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Eye size={11} className="text-neutral-400" />
                            {(art.views || 0).toLocaleString()}
                          </span>
                        </div>
                        
                        <Link 
                          to={getArticleDetailUrl(art)}
                          className={`flex items-center gap-0.5 font-bold uppercase tracking-wider text-[10px] ${accentTextClass} opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`}
                        >
                          Baca <ChevronRight size={12} />
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      <Footer portal={activePortal} />
    </div>
  );
}
