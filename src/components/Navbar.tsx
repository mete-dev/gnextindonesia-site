import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, ChevronDown, Radio, Clock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { detectPortal, getPortalById } from '../lib/portals';
import { LenteraLogo } from './LenteraLogo';
import { slugify } from '../data/news';
import { Article } from '../pages/studio/types';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { useBrand } from '../lib/brandConfig';

interface NavbarSearchBarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activePortalId: string;
  accentRingClass: string;
  placeholder?: string;
  autoFocus?: boolean;
}

function NavbarSearchBar({
  searchQuery = '',
  onSearchChange,
  activePortalId,
  accentRingClass,
  placeholder = 'Cari berita...',
  autoFocus = false,
}: NavbarSearchBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalQuery, setInternalQuery] = useState(searchQuery || '');

  useEffect(() => {
    setInternalQuery(searchQuery || '');
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = internalQuery.trim();
    if (!trimmed) return;

    if (onSearchChange) {
      onSearchChange(trimmed);
    }

    let targetPath = '/news';
    if (activePortalId.startsWith('lentera')) targetPath = `/${activePortalId}`;

    if (location.pathname !== targetPath || !location.search.includes('search=')) {
      navigate(`${targetPath}?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleClear = () => {
    setInternalQuery('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-36 sm:w-44 md:w-48 lg:w-60 shrink-0">
      <Search size={14} className="absolute left-3 text-neutral-400 pointer-events-none shrink-0" />
      <input
        type="text"
        value={internalQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full pl-8 pr-7 py-1.5 bg-neutral-100 hover:bg-neutral-100/90 focus:bg-white border border-neutral-200/80 rounded-full text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 ${accentRingClass} transition-all shadow-2xs`}
      />
      {internalQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 p-0.5 text-neutral-400 hover:text-neutral-700 transition-colors rounded-full"
          title="Hapus pencarian"
        >
          <X size={12} />
        </button>
      )}
    </form>
  );
}

interface NavItemProps {
  cat: string;
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  activePortalId: string;
  activeColorClass: string;
  hoverColorClass: string;
  badgeBgClass?: string;
}

function CategoryNavItem({
  cat,
  activeCategory,
  onSelectCategory,
  activeColorClass,
  hoverColorClass,
}: NavItemProps) {
  const isActive = activeCategory === cat || (!activeCategory && (cat === 'Semua' || cat === 'Semua Berita'));

  return (
    <button
      onClick={() => {
        if (onSelectCategory) {
          onSelectCategory(cat);
        }
      }}
      className={`text-[11px] lg:text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
        isActive ? activeColorClass : hoverColorClass
      }`}
    >
      {cat}
    </button>
  );
}

function MobileCategoryNavItem({
  cat,
  activeCategory,
  onSelectCategory,
  setMobileMenuOpen,
  activeColorClass,
  hoverColorClass
}: {
  cat: string;
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  activePortalId?: string;
  setMobileMenuOpen: (open: boolean) => void;
  activeColorClass: string;
  hoverColorClass: string;
}) {
  return (
    <button
      onClick={() => {
        if (onSelectCategory) onSelectCategory(cat);
        setMobileMenuOpen(false);
      }}
      className={`text-base font-display font-bold uppercase transition-colors py-1 ${
        activeCategory === cat ? activeColorClass : hoverColorClass
      }`}
    >
      {cat}
    </button>
  );
}

interface NavbarProps {
  portal?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  categories?: string[];
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  tickerArticles?: Article[];
  todayFormatted?: string;
  getCategoryName?: (catId: string) => string;
  getBasePath?: () => string;
}

export default function Navbar({
  portal,
  searchQuery,
  onSearchChange,
  categories,
  activeCategory,
  onSelectCategory,
  tickerArticles,
  todayFormatted,
  getCategoryName,
  getBasePath
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const location = useLocation();

  const [internalTicker, setInternalTicker] = useState<Article[]>([]);
  const [internalCategories, setInternalCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!tickerArticles || tickerArticles.length === 0) {
      fetchPublishedArticlesAndMetadata().then(data => {
        if (data && data.articles && data.articles.length > 0) {
          const published = data.articles.filter((a: any) => a.status === 'published');
          setInternalTicker(published.slice(0, 10));
        }
        if (data && data.categories) {
          setInternalCategories(data.categories);
        }
      }).catch(() => {});
    }
  }, [tickerArticles]);

  const activeTickerArticles = (tickerArticles && tickerArticles.length > 0) ? tickerArticles : internalTicker;
  const { brand } = useBrand();

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const detected = detectPortal(hostname, location.pathname);
  
  const activePortalId = portal || (detected ? detected.id : 'gnext');
  const activePortal = getPortalById(activePortalId);
  const isLentera = activePortalId.startsWith('lentera');

  const isNewsDomain = hostname.toLowerCase().startsWith('news.') || 
                        hostname.toLowerCase().startsWith('lentera');

  const isCorporateRoute = ['/about', '/work', '/platform', '/katalog', '/studio', '/loginstudio'].some(r => location.pathname.startsWith(r)) || 
                           ((location.pathname === '/' || location.pathname.startsWith('/news')) && !portal);

  const isNewsPage = Boolean(portal) || isNewsDomain || !isCorporateRoute;

  const getHomeHref = () => {
    if (isNewsDomain || (detected && detected.id !== 'gnext' && !location.pathname.startsWith('/' + activePortalId))) return '/';
    if (activePortalId === 'gnext') return '/news';
    if (isLentera) return `/${activePortalId}`;
    return '/lenterabangsa';
  };

  // 1. GNEXT NEWS DEDICATED NAVBAR (Nonaktif: Halaman /news dan detail artikel kini menggunakan Header resmi Gnext Indonesia)
  if (false && isNewsPage && activePortalId === 'gnext') {
    const homeHref = getHomeHref();
    
    // Primary visible categories on the black bar
    const primaryCats = [
      'Ekonomi & Bisnis',
      'Kreatif & Media',
      'Teknologi',
      'Hukum',
      'Pendidikan',
      'Lingkungan',
      'Gaya Hidup'
    ];

    const extraCats = [
      'Sosial',
      'Budaya'
    ];

    const basePath = getBasePath ? getBasePath() : '/news';
    const resolveCatName = getCategoryName || ((id: string) => {
      const found = internalCategories.find(c => c.id === id);
      return found ? found.name : 'berita';
    });

    return (
      <header id="news-navbar" className="fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="w-full bg-neutral-950">
          <div className="w-full max-w-7xl mx-auto flex items-stretch">
            
            {/* Logo Solid Red Block - Spans full height across both Row 1 and Row 2 */}
            <Link
              to={homeHref}
              onClick={() => { if(onSelectCategory) onSelectCategory('Semua'); }}
              className="bg-red-600 hover:bg-red-700 text-white px-3.5 sm:px-5 flex flex-col justify-center items-center shrink-0 select-none transition-colors group z-20 border-r border-red-700"
            >
              <div className="flex flex-col items-stretch w-full text-center group-hover:scale-105 transition-transform">
                <span className="text-xl sm:text-2xl md:text-3xl font-serif italic font-black tracking-tight leading-none">
                  GNEXT
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-sans font-black tracking-[0.24em] sm:tracking-[0.27em] md:tracking-[0.3em] uppercase text-white leading-none mt-1 pl-[0.24em] sm:pl-[0.27em] md:pl-[0.3em] text-center">
                  INDONESIA
                </span>
              </div>
            </Link>

            {/* Right Column: 2 Stacked Rows */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Baris 1: Background Hitam (Navigasi Kategori + Search) */}
              <div className="w-full bg-neutral-950 border-b border-neutral-800 text-white h-11 sm:h-12 px-3 sm:px-4 flex items-center justify-between gap-3">
                <nav className="flex items-center gap-2 sm:gap-3.5 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
                  <button
                    onClick={() => { if(onSelectCategory) onSelectCategory('Semua'); }}
                    className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                      activeCategory === 'Semua' ? 'bg-neutral-800 text-white border border-neutral-700 font-black' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    Untuk Anda
                  </button>

                  {primaryCats.map(cat => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          if (onSelectCategory) {
                            onSelectCategory(cat);
                          }
                        }}
                        className={`text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                          isActive ? 'text-red-500 font-black border-b-2 border-red-500 pb-0.5' : 'text-neutral-200 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}

                  {/* Dropdown RAGAM */}
                  <div className="relative group py-1">
                    <button className="text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer">
                      <span>RAGAM</span>
                      <ChevronDown size={12} className="transition-transform duration-200 group-hover:rotate-180 opacity-70" />
                    </button>
                    <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 min-w-[170px] space-y-1 backdrop-blur-md">
                        <div className="px-2.5 py-1 text-[10px] font-black uppercase text-neutral-400 tracking-wider border-b border-neutral-800">
                          Kategori Lainnya
                        </div>
                        {extraCats.map(extra => (
                          <button
                            key={extra}
                            onClick={() => {
                              if (onSelectCategory) {
                                onSelectCategory(extra);
                              }
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                              activeCategory === extra
                                ? "bg-red-600 text-white font-bold"
                                : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                            }`}
                          >
                            <span>{extra}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </nav>

                {/* Search & Mobile Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden md:block shrink-0">
                    <NavbarSearchBar
                      searchQuery={searchQuery}
                      onSearchChange={onSearchChange}
                      activePortalId={activePortalId}
                      accentRingClass="focus:ring-red-600 focus:border-red-600"
                      placeholder="Cari berita..."
                    />
                  </div>

                  <button 
                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)} 
                    className={`p-1.5 rounded-lg transition-colors md:hidden ${
                      mobileSearchOpen || searchQuery ? 'text-red-500 bg-neutral-800' : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                    aria-label="Cari Berita"
                  >
                    <Search size={16} />
                  </button>

                  <button className="md:hidden z-50 p-1.5 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </div>
              </div>

              {/* Baris 2: Background Putih (Trending Ticker) */}
              <div className="w-full bg-white border-b border-neutral-200/90 shadow-2xs h-7 sm:h-7.5 px-3 sm:px-4 flex items-center overflow-hidden">
                <div className="flex items-center gap-1.5 text-red-600 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 mr-3">
                  <span>TRENDING</span>
                </div>

                <div className="flex-1 overflow-hidden relative text-xs text-neutral-800">
                  {activeTickerArticles && activeTickerArticles.length > 0 ? (
                    <div className="whitespace-nowrap inline-block animate-marquee">
                      {[...activeTickerArticles, ...activeTickerArticles, ...activeTickerArticles].map((a, i) => (
                        <span key={`${a.id || 'art'}-${i}`} className="inline-flex items-center mx-3">
                          <Link
                            to={`${basePath}/${slugify(resolveCatName(a.categoryId))}/${slugify(a.title)}`}
                            className="hover:text-red-600 transition-colors text-neutral-800 font-normal hover:underline"
                          >
                            {a.title}
                          </Link>
                          <span className="ml-3 text-neutral-300 font-normal select-none">|</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-xs">Menampilkan berita terkini dan terhangat nusantara...</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-900 border-t border-b border-neutral-800 px-4 py-2.5 md:hidden"
            >
              <NavbarSearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                activePortalId={activePortalId}
                accentRingClass="focus:ring-red-600 focus:border-red-600"
                placeholder="Cari berita atau topik..."
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-0 left-0 right-0 h-screen bg-neutral-950 text-white px-6 pt-20 pb-12 flex flex-col md:hidden z-40"
            >
              <nav className="flex flex-col gap-4 text-center w-full max-w-xs mx-auto overflow-y-auto max-h-[80vh] py-2">
                {[...primaryCats, ...extraCats].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(cat);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`text-base font-display font-bold uppercase transition-colors py-1 ${
                      activeCategory === cat ? 'text-red-500 font-extrabold' : 'text-neutral-200 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

    // 4. LENTERA DEDICATED NAVBAR (2-TIER STACK)
  if (isLentera) {
    const homeHref = getHomeHref();
    const navCats = categories && categories.length > 1 ? categories : ['Semua', 'Politik', 'Ekonomi', 'Olahraga', 'Gaya Hidup'];
    const visibleCats = navCats.filter(cat => cat.toLowerCase() !== 'semua' && cat.toLowerCase() !== 'semua berita');
    const primaryCats = visibleCats.slice(0, 6);
    const extraCats = visibleCats.slice(6);
    const basePath = getBasePath ? getBasePath() : `/${activePortalId}`;
    const resolveCatName = getCategoryName || ((id: string) => id);

    return (
      <header id="lentera-navbar" className="fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="w-full bg-neutral-950">
          <div className="w-full max-w-7xl mx-auto flex items-stretch">
            
            {/* Logo Solid Block - Spans full height across both Row 1 and Row 2 */}
            <Link
              to={homeHref}
              onClick={() => { if(onSelectCategory) onSelectCategory('Semua'); }}
              className="bg-[#8C4A21] hover:bg-[#A05527] text-white px-3.5 sm:px-5 flex flex-col justify-center items-center shrink-0 select-none transition-colors group z-20 border-r border-[#6f3715]"
            >
              <LenteraLogo portalName={activePortal.name} className="h-6 sm:h-7 filter brightness-0 invert group-hover:scale-105 transition-transform" />
            </Link>

            {/* Right Column: 2 Stacked Rows */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Baris 1: Background Hitam (Navigasi Kategori + Search) */}
              <div className="w-full bg-neutral-950 border-b border-neutral-800 text-white h-11 sm:h-12 px-3 sm:px-4 flex items-center justify-between gap-3">
                <nav className="flex items-center gap-2 sm:gap-3.5 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
                  <button
                    onClick={() => { if(onSelectCategory) onSelectCategory('Semua'); }}
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                      activeCategory === 'Semua' ? 'bg-neutral-800 text-white border border-neutral-700 font-black' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    Untuk Anda
                  </button>

                  {primaryCats.map(cat => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          if (onSelectCategory) {
                            onSelectCategory(cat);
                          }
                        }}
                        className={`text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                          isActive ? 'text-[#D98319] font-black border-b-2 border-[#D98319] pb-0.5' : 'text-neutral-200 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}

                  {/* Dropdown RAGAM if extra cats exist */}
                  {extraCats.length > 0 && (
                    <div className="relative group py-1">
                      <button className="text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer">
                        <span>RAGAM</span>
                        <ChevronDown size={12} className="transition-transform duration-200 group-hover:rotate-180 opacity-70" />
                      </button>
                      <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 min-w-[170px] space-y-1 backdrop-blur-md">
                          <div className="px-2.5 py-1 text-[10px] font-black uppercase text-neutral-400 tracking-wider border-b border-neutral-800">
                            Kategori Lainnya
                          </div>
                          {extraCats.map(extra => (
                            <button
                              key={extra}
                              onClick={() => {
                                if (onSelectCategory) {
                                  onSelectCategory(extra);
                                }
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                                activeCategory === extra
                                  ? "bg-[#8C4A21] text-white font-bold"
                                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                              }`}
                            >
                              <span>{extra}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </nav>

                {/* Search & Mobile Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden md:block shrink-0">
                    <NavbarSearchBar
                      searchQuery={searchQuery}
                      onSearchChange={onSearchChange}
                      activePortalId={activePortalId}
                      accentRingClass="focus:ring-[#8C4A21] focus:border-[#8C4A21]"
                      placeholder="Cari berita..."
                    />
                  </div>

                  <button 
                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)} 
                    className={`p-1.5 rounded-lg transition-colors md:hidden ${
                      mobileSearchOpen || searchQuery ? 'text-[#D98319] bg-neutral-800' : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                    aria-label="Cari Berita"
                  >
                    <Search size={16} />
                  </button>

                  <button className="md:hidden z-50 p-1.5 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                  </button>
                </div>
              </div>

              {/* Baris 2: Background Putih (Trending Ticker) */}
              <div className="w-full bg-white border-b border-neutral-200/90 shadow-2xs h-7 sm:h-7.5 px-3 sm:px-4 flex items-center overflow-hidden">
                <div className="flex items-center gap-1.5 text-[#8C4A21] text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 mr-3">
                  <span>TRENDING</span>
                </div>

                <div className="flex-1 overflow-hidden relative text-xs text-neutral-800">
                  {activeTickerArticles && activeTickerArticles.length > 0 ? (
                    <div className="whitespace-nowrap inline-block animate-marquee">
                      {[...activeTickerArticles, ...activeTickerArticles, ...activeTickerArticles].map((a, i) => (
                        <span key={`${a.id || 'art'}-${i}`} className="inline-flex items-center mx-3">
                          <Link
                            to={`${basePath}/${slugify(resolveCatName(a.categoryId))}/${slugify(a.title)}`}
                            className="hover:text-[#8C4A21] transition-colors text-neutral-800 font-normal hover:underline"
                          >
                            {a.title}
                          </Link>
                          <span className="ml-3 text-neutral-300 font-normal select-none">|</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-xs">Menampilkan kabar berita terkini nusantara...</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-900 border-t border-b border-neutral-800 px-4 py-2.5 md:hidden"
            >
              <NavbarSearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                activePortalId={activePortalId}
                accentRingClass="focus:ring-[#8C4A21] focus:border-[#8C4A21]"
                placeholder="Cari berita..."
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 h-screen bg-neutral-950 text-white px-6 pt-20 pb-12 flex flex-col md:hidden z-40"
            >
              <div className="px-4 py-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                {[...primaryCats, ...extraCats].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(cat);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`text-base font-display font-bold uppercase transition-colors py-1 ${
                      activeCategory === cat ? 'text-[#D98319] font-extrabold' : 'text-neutral-200 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  // CORPORATE (GNEXT INDONESIA) NAVBAR - Portal Berita points purely to /news
  const navLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Work', href: '/work' },
    { name: 'Platform', href: '/platform' },
    { name: 'Katalog', href: '/katalog' },
    { name: 'News', href: '/news' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-50/95 backdrop-blur-md py-3.5 border-b border-neutral-200 shadow-sm'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-lg sm:text-xl md:text-2xl font-display font-extrabold tracking-tighter uppercase z-50 group whitespace-nowrap shrink-0">
          <img 
            src={brand.logo} 
            alt={`${brand.name} Logo`} 
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform" 
          />
          <span>{brand.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-medium hover:text-neutral-900 transition-colors ${
                location.pathname === link.href ? 'text-neutral-900 font-semibold' : 'text-neutral-500'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <a
            href="https://wa.me/6285852488293"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-neutral-900 text-neutral-50 text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
          >
            Let's Talk
          </a>
        </nav>

        <button
          className="md:hidden z-50 p-2 -mr-2 text-neutral-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 h-screen bg-neutral-50 px-6 pt-24 pb-12 flex flex-col md:hidden"
          >
            <nav className="flex flex-col gap-6 text-center mt-12 overflow-y-auto max-h-[75vh] no-scrollbar">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-4xl font-display font-bold uppercase tracking-tight text-neutral-900 hover:text-neutral-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <a
                href="https://wa.me/6285852488293"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 px-8 py-4 bg-neutral-900 text-neutral-50 text-xl font-medium rounded-full mx-auto inline-block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Let's Talk
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

