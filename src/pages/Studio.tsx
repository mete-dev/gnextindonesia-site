import ErrorBoundary from '../components/ErrorBoundary';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Settings, FileText, LogOut, Tags, Users, Activity, Briefcase, Users2, Menu, X, BarChart2, Image as ImageIcon, Database, Globe, Sliders } from 'lucide-react';
import { User } from './studio/types';
import NewsManager from './studio/NewsManager';
import CategoryManager from './studio/CategoryManager';
import GalleryManager from './studio/GalleryManager';
import WebSettings from './studio/WebSettings';
import UserManager from './studio/UserManager';
import AuditLogs from './studio/AuditLogs';
import WorkManager from './studio/WorkManager';
import PartnerManager from './studio/PartnerManager';
import { SEO } from '../components/SEO';
import { getPortalById } from '../lib/portals';

export default function Studio() {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (pathname: string): 'news' | 'categories' | 'gallery' | 'settings' | 'users' | 'audit' | 'works' | 'partners' | 'backup' | 'seo' => {
    const cleanPath = pathname.toLowerCase().replace(/\/$/, '');
    if (cleanPath.endsWith('/categories')) return 'categories';
    if (cleanPath.endsWith('/works')) return 'works';
    if (cleanPath.endsWith('/partners')) return 'partners';
    if (cleanPath.endsWith('/settings')) return 'settings';
    if (cleanPath.endsWith('/backup')) return 'backup';
    if (cleanPath.endsWith('/seo')) return 'seo';
    if (cleanPath.endsWith('/users')) return 'users';
    if (cleanPath.endsWith('/audit')) return 'audit';
    if (cleanPath.endsWith('/gallery')) return 'gallery';
    return 'news';
  };

  const activeTab = getTabFromPath(location.pathname);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [bloggerOpen, setBloggerOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem('studio_user');
      if (!userJson) {
        navigate('/loginstudio');
      } else {
        setCurrentUser(JSON.parse(userJson));
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
      navigate('/loginstudio');
    }
  }, [navigate]);

  // Keep correct menu open based on active tab
  useEffect(() => {
    if (['settings', 'audit', 'backup', 'seo'].includes(activeTab)) {
      setSettingsOpen(true);
      setBloggerOpen(false);
      setWebsiteOpen(false);
    } else if (['works', 'partners'].includes(activeTab)) {
      setWebsiteOpen(true);
      setBloggerOpen(false);
      setSettingsOpen(false);
    } else if (['news', 'categories', 'gallery'].includes(activeTab)) {
      setBloggerOpen(true);
      setWebsiteOpen(false);
      setSettingsOpen(false);
    }
  }, [activeTab]);

  const handleLogout = () => {
    try { localStorage.removeItem('studio_user'); } catch(e) {};
    navigate('/loginstudio');
  };

  if (!currentUser) return null;

  const selectTab = (tab: 'news' | 'categories' | 'gallery' | 'settings' | 'users' | 'audit' | 'works' | 'partners' | 'backup' | 'seo') => {
    const isStudioSubdomain = typeof window !== 'undefined' && window.location.hostname.toLowerCase().startsWith('studio.');
    
    let targetPath = '/studio';
    if (isStudioSubdomain && !location.pathname.startsWith('/studio')) {
      targetPath = tab === 'news' ? '/' : `/${tab}`;
    } else {
      targetPath = `/studio/${tab}`;
    }

    navigate(targetPath);
    setIsMobileMenuOpen(false);
  };

  const tabLabels: Record<string, string> = {
    news: 'Blog & News',
    categories: 'Kategori News',
    gallery: 'Galeri Media',
    works: 'Katalog Karya',
    partners: 'Data Partner',
    settings: 'Settings / Halaman',
    seo: 'SEO & Sitemaps',
    backup: 'Backup & Restore',
    users: 'Pengguna & SDM',
    audit: 'Audit Logs',
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      <SEO 
        title={`${tabLabels[activeTab] || 'Studio Dashboard'} | Gnext Creative Studio`} 
        description="Gnext Creative Studio Control Panel - Sistem manajemen konten (CMS) dan analitik statistik portal berita multimedia untuk jaringan penerbitan Gnext Indonesia." 
        keywords="gnext studio, control panel studio, cms gnext, dashboard redaksi, manajemen portal berita, analitik media, gnext news"
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80"
        path={location.pathname} 
        type="website"
      />
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div>
            <h1 className="text-base font-display font-bold leading-tight">Studio Dashboard</h1>
            <p className="text-xs text-neutral-500">{tabLabels[activeTab] || activeTab}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-semibold mb-0.5">
            {currentUser.role}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
            currentUser.role === 'Administrator'
              ? 'bg-neutral-900 text-white border-neutral-950'
              : currentUser.portal === 'yoikijatim'
              ? 'bg-orange-50 text-orange-600 border-orange-200'
              : currentUser.portal === 'lumajangtalks'
              ? 'bg-lumajang-50 text-lumajang-400 border-lumajang-200'
              : currentUser.portal === 'gummah'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : currentUser.portal?.startsWith('lentera')
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {currentUser.role === 'Administrator' ? 'SEMUA' : getPortalById(currentUser.portal || 'gnext').name.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Backdrop for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar / Mobile Drawer */}
      <aside className={`
        fixed md:sticky md:top-0 inset-y-0 left-0 z-50 w-52 md:w-44 h-screen bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out shadow-xs
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="px-3 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shadow-sm font-display shrink-0">
              GS
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-display font-bold leading-tight text-neutral-900 truncate">Studio Dashboard</h1>
              <p className="text-[10px] text-neutral-500 font-medium truncate">Gnext Publishing</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-2.5 space-y-1 overflow-y-auto">
          {/* Blogger Menu with Submenus */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                if (!bloggerOpen) {
                  setBloggerOpen(true);
                  setWebsiteOpen(false);
                  setSettingsOpen(false);
                } else {
                  setBloggerOpen(false);
                }
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-100/90 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-neutral-800" />
                <span className="text-xs font-bold tracking-wide">BLOGGER</span>
              </div>
              <span className={`transform transition-transform text-[9px] text-neutral-400 ${bloggerOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {bloggerOpen && (
              <div className="pl-2 space-y-0.5 border-l-2 border-neutral-200 ml-4 my-1">
                <button
                  onClick={() => selectTab('news')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                    activeTab === 'news' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                  }`}
                >
                  <FileText size={14} />
                  <span>Artikel Berita</span>
                </button>

                {(currentUser.role === 'Administrator' || currentUser.role === 'Manajer Pers') && (
                  <button
                    onClick={() => selectTab('categories')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      activeTab === 'categories' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                    }`}
                  >
                    <Tags size={14} />
                    <span>Kategori</span>
                  </button>
                )}

                <button
                  onClick={() => selectTab('gallery')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                    activeTab === 'gallery' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>Galeri Media</span>
                </button>
              </div>
            )}
          </div>

          {/* Website Menu with Submenus */}
          {currentUser.role === 'Administrator' && (
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  if (!websiteOpen) {
                    setWebsiteOpen(true);
                    setBloggerOpen(false);
                    setSettingsOpen(false);
                  } else {
                    setWebsiteOpen(false);
                  }
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-100/90 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-neutral-800" />
                  <span className="text-xs font-bold tracking-wide">WEBSITE</span>
                </div>
                <span className={`transform transition-transform text-[9px] text-neutral-400 ${websiteOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {websiteOpen && (
                <div className="pl-2 space-y-0.5 border-l-2 border-neutral-200 ml-4 my-1">
                  <button
                    onClick={() => selectTab('works')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      activeTab === 'works' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                    }`}
                  >
                    <Briefcase size={14} />
                    <span>Katalog Karya</span>
                  </button>
                  
                  <button
                    onClick={() => selectTab('partners')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      activeTab === 'partners' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                    }`}
                  >
                    <Users2 size={14} />
                    <span>Data Partner</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SDM Menu */}
          {currentUser.role === 'Administrator' && (
            <button
              onClick={() => selectTab('users')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                activeTab === 'users' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-700 hover:bg-neutral-100/90'
              }`}
            >
              <Users size={16} />
              <span>SDM & Akses</span>
            </button>
          )}

          {/* Settings Menu with Submenus (auditlogs, Backup & Restore, SEO & sitemaps) */}
          {currentUser.role === 'Administrator' && (
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  if (!settingsOpen) {
                    setSettingsOpen(true);
                    setBloggerOpen(false);
                    setWebsiteOpen(false);
                  } else {
                    setSettingsOpen(false);
                  }
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-100/90 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-neutral-800" />
                  <span className="text-xs font-bold tracking-wide">SETTINGS</span>
                </div>
                <span className={`transform transition-transform text-[9px] text-neutral-400 ${settingsOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {settingsOpen && (
                <div className="pl-2 space-y-0.5 border-l-2 border-neutral-200 ml-4 my-1">
                  <button
                    onClick={() => selectTab('settings')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      activeTab === 'settings' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                    }`}
                  >
                    <Sliders size={14} />
                    <span>Halaman & Wilayah</span>
                  </button>

                  <button
                    onClick={() => selectTab('seo')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      activeTab === 'seo' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                    }`}
                  >
                    <Globe size={14} />
                    <span>SEO & Sitemaps</span>
                  </button>

                  <button
                    onClick={() => selectTab('backup')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      activeTab === 'backup' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                    }`}
                  >
                    <Database size={14} />
                    <span>Backup & Restore</span>
                  </button>

                  <button
                    onClick={() => selectTab('audit')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                      activeTab === 'audit' ? 'bg-neutral-900 text-white font-semibold shadow-xs' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                    }`}
                  >
                    <Activity size={14} />
                    <span>Audit Logs</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User profile & logout footer stickied at bottom */}
        <div className="p-2.5 border-t border-neutral-200/80 bg-neutral-50 shrink-0 mt-auto">
          <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-neutral-200/80 shadow-3xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shadow-2xs font-display">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-900 truncate leading-tight" title={currentUser.name}>
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-neutral-500 truncate leading-tight mt-0.5 font-medium">
                  {currentUser.role === 'Administrator' ? 'Administrator' : getPortalById(currentUser.portal || 'gnext').name}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari Studio"
              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0 flex items-center justify-center"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-auto p-2 sm:p-2.5 md:p-3">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-full"
        >
          {activeTab === 'news' && <NewsManager currentUser={currentUser} />}
          {activeTab === 'categories' && <CategoryManager currentUser={currentUser} />}
          {activeTab === 'gallery' && <GalleryManager currentUser={currentUser} />}
          {activeTab === 'works' && <WorkManager currentUser={currentUser} />}
          {activeTab === 'partners' && <PartnerManager currentUser={currentUser} />}
          {activeTab === 'settings' && <WebSettings currentUser={currentUser} activeSection="general" />}
          {activeTab === 'seo' && <WebSettings currentUser={currentUser} activeSection="seo" />}
          {activeTab === 'backup' && <WebSettings currentUser={currentUser} activeSection="backup" />}
          {activeTab === 'users' && <UserManager currentUser={currentUser} />}
          {activeTab === 'audit' && <AuditLogs currentUser={currentUser} />}
        </motion.div>
      </main>
    </div>
  );
}

