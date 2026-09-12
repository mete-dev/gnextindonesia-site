import React, { useEffect, useState } from 'react';
import { Instagram, Linkedin, Youtube, Twitter, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { detectPortal, getPortalById } from '../lib/portals';
import { LenteraLogo } from './LenteraLogo';
import { supabase } from '../lib/supabase';
import { PageSetting } from '../pages/studio/types';

interface FooterProps {
  portal?: string;
}

export default function Footer({ portal }: FooterProps) {
  const [footerSetting, setFooterSetting] = useState<PageSetting | null>(null);

  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  const detectedPortal = detectPortal(hostname, pathname);

  const getActivePortal = (): string => {
    if (portal) {
      if (portal === 'news' || portal === 'gnextnews') return 'gnext';
      if (portal === 'company' || portal === 'corporate' || portal === 'studio') return 'company';
      return portal;
    }

    const isNewsDomain = hostname.startsWith('news.') || 
                          hostname.startsWith('yoikijatim.') || 
                          hostname.startsWith('lumajangtalks.') || 
                          hostname.startsWith('gummah.') || 
                          hostname.startsWith('g-ummah.') || 
                          hostname.startsWith('ummah.') || 
                          hostname.startsWith('finance.') || 
                          hostname.startsWith('lentera');

    const isNewsPath = pathname.startsWith('/news') || 
                       pathname.startsWith('/yoikijatim') || 
                       pathname.startsWith('/lumajangtalks') || 
                       pathname.startsWith('/gummah') || 
                       pathname.startsWith('/g-ummah') || 
                       pathname.startsWith('/ummah') || 
                       pathname.startsWith('/finance') || 
                       pathname.startsWith('/lentera');

    if (isNewsDomain || isNewsPath) {
      const detected = detectPortal(hostname, pathname);
      return detected ? detected.id : 'gnext';
    }

    return 'company';
  };

  const activePortal = getActivePortal();
  const portalData = getPortalById(activePortal);
  const sub = detectedPortal && detectedPortal.id !== 'gnext' ? detectedPortal.id : null;

  // Fetch brand-specific footer content settings from database if available
  useEffect(() => {
    let isMounted = true;
    const fetchFooterSetting = async () => {
      try {
        const { data } = await supabase
          .from('web_settings')
          .select('*')
          .or(`path.eq./footer,path.eq.footer,path.eq./footer-${activePortal}`)
          .maybeSingle();

        if (data && isMounted) {
          setFooterSetting(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic footer setting:', err);
      }
    };

    fetchFooterSetting();
    return () => { isMounted = false; };
  }, [activePortal]);

  const getHomeHref = (p: string) => {
    if (sub) return '/';
    if (p === 'gnext') return '/news';
    if (p === 'gummah') {
      if (hostname.toLowerCase().startsWith('gummah.') || hostname.toLowerCase().startsWith('g-ummah.') || hostname.toLowerCase().startsWith('ummah.')) {
        return '/';
      }
      if (pathname.startsWith('/ummah')) return '/ummah';
      return '/gummah';
    }
    return `/${p}`;
  };

  // Helper for portal specific styling accents while retaining Gnext Indonesia branding
  const getPortalTheme = (p: string) => {
    switch (p) {
      case 'yoikijatim':
        return {
          accentText: 'text-orange-500',
          hoverAccentText: 'hover:text-orange-500',
          borderTop: 'border-orange-900/30',
          buttonBg: 'bg-orange-600',
          buttonHoverBg: 'hover:bg-orange-700',
          badgeDot: 'bg-orange-500'
        };
      case 'gummah':
        return {
          accentText: 'text-emerald-500',
          hoverAccentText: 'hover:text-emerald-500',
          borderTop: 'border-emerald-900/30',
          buttonBg: 'bg-emerald-600',
          buttonHoverBg: 'hover:bg-emerald-700',
          badgeDot: 'bg-emerald-500'
        };
      case 'lumajangtalks':
        return {
          accentText: 'text-lumajang-400',
          hoverAccentText: 'hover:text-lumajang-400',
          borderTop: 'border-lumajang-900/30',
          buttonBg: 'bg-orange-600',
          buttonHoverBg: 'hover:bg-orange-700',
          badgeDot: 'bg-lumajang-400'
        };
      case 'finance':
        return {
          accentText: 'text-finance-500',
          hoverAccentText: 'hover:text-finance-500',
          borderTop: 'border-finance-900/30',
          buttonBg: 'bg-finance-600',
          buttonHoverBg: 'hover:bg-finance-700',
          badgeDot: 'bg-finance-500'
        };
      default:
        if (p.startsWith('lentera')) {
          return {
            accentText: 'text-blue-500',
            hoverAccentText: 'hover:text-blue-500',
            borderTop: 'border-blue-900/30',
            buttonBg: 'bg-blue-600',
            buttonHoverBg: 'hover:bg-blue-700',
            badgeDot: 'bg-blue-500'
          };
        }
        return {
          accentText: 'text-red-500',
          hoverAccentText: 'hover:text-red-500',
          borderTop: 'border-red-900/30',
          buttonBg: 'bg-red-600',
          buttonHoverBg: 'hover:bg-red-700',
          badgeDot: 'bg-red-500'
        };
    }
  };

  // 1. CORPORATE SITE FOOTER (Gnext Creative Studio)
  if (activePortal === 'company') {
    return (
      <footer id="contact" className="bg-accent text-neutral-900 pt-24 pb-8 overflow-hidden rounded-t-[3rem] -mt-10 relative z-20">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row justify-between gap-16 mb-24">
            <div className="max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] mb-8"
              >
                Mari <br/>
                berkarya <br/>
                <span className="italic font-light text-neutral-700">bersama.</span>
              </motion.h2>
              <a 
                href="mailto:halo@gnextindonesia.site"
                className="inline-block text-2xl md:text-4xl font-medium border-b-2 border-neutral-900 pb-2 hover:text-neutral-600 hover:border-neutral-600 transition-colors"
              >
                halo@gnextindonesia.site
              </a>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-12 lg:gap-24">
              <div>
                <h4 className="font-display font-bold text-xl mb-6">Navigation</h4>
                <ul className="flex flex-col gap-4">
                  <li><Link to="/about" className="hover:font-medium transition-all">About Us</Link></li>
                  <li><Link to="/work" className="hover:font-medium transition-all">Work</Link></li>
                  <li><Link to="/platform" className="hover:font-medium transition-all">Platform</Link></li>
                  <li><Link to="/news" className="hover:font-medium transition-all font-semibold text-red-600">News & Insights</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-bold text-xl mb-6">Socials</h4>
                <ul className="flex flex-col gap-4">
                  <li><a href="https://instagram.com/gnextindonesiacom" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:font-medium transition-all"><Instagram size={20} /> Instagram</a></li>
                  <li><a href="https://youtube.com/@gnextindonesia" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:font-medium transition-all"><Youtube size={20} /> YouTube</a></li>
                  <li><a href="#" className="flex items-center gap-2 hover:font-medium transition-all"><Linkedin size={20} /> LinkedIn</a></li>
                  <li><a href="#" className="flex items-center gap-2 hover:font-medium transition-all"><Twitter size={20} /> Twitter</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-neutral-900/20 text-sm font-medium">
            <p>© {new Date().getFullYear()} Gnext Creative Studio. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // 2. UNIFIED BRAND-SPECIFIC GNEXT INDONESIA FOOTER ACROSS ALL NEWS PORTALS
  const theme = getPortalTheme(activePortal);
  const homeHref = getHomeHref(activePortal);
  const baseNav = homeHref === '/' ? '' : homeHref;

  const footerDescription = footerSetting?.description || 
    'Portal berita resmi dan jaringan media digital terpercaya di bawah naungan GNEXT INDONESIA, menyajikan berita nasional, informasi daerah, bisnis, teknologi, dan inovasi publik secara akurat, berimbang, dan independen.';

  return (
    <footer className={`bg-neutral-950 text-white pt-16 pb-8 border-t ${theme.borderTop} relative z-20`}>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Header & Brand Info */}
          <div className="md:col-span-5">
            <Link to={homeHref} className="flex flex-col justify-center mb-4 text-white leading-none group">
              <div className="text-xl sm:text-2xl font-display font-black tracking-tighter uppercase leading-none">
                <span className="font-serif italic font-black tracking-normal text-white">
                  GNEXT <span className={`${theme.accentText} font-sans not-italic font-black`}>INDONESIA</span>
                </span>
              </div>
              <div className="w-[155px] sm:w-[178px] text-[9.5px] tracking-tight text-neutral-400 uppercase font-sans font-bold mt-1 flex justify-between">
                <span>M</span><span>E</span><span>D</span><span>I</span><span>A</span><span>&nbsp;</span><span>N</span><span>E</span><span>T</span><span>W</span><span>O</span><span>R</span><span>K</span>
              </div>
            </Link>

            {portalData && activePortal !== 'gnext' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-4 shadow-sm">
                <span className={`w-2 h-2 rounded-full ${theme.badgeDot}`}></span>
                <span>Saluran Jaringan: <strong className="text-white font-bold">{portalData.name}</strong></span>
              </div>
            )}

            <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-md">
              {footerDescription}
            </p>

            <div className="flex flex-wrap gap-3">
              <a 
                href="https://instagram.com/gnextindonesiacom" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 ${theme.hoverAccentText} hover:bg-neutral-800 transition-colors`} 
                title="Instagram @gnextindonesiacom"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://tiktok.com/@gnextindonesia" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 ${theme.hoverAccentText} hover:bg-neutral-800 transition-colors`} 
                title="TikTok @gnextindonesia"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com/@gnextindonesia" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 ${theme.hoverAccentText} hover:bg-neutral-800 transition-colors`} 
                title="YouTube @gnextindonesia"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          {/* Navigasi Portal & Jaringan */}
          <div className="md:col-span-3">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-neutral-300 mb-6">
              Navigasi Berita
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm text-neutral-400">
              <li>
                <Link to={homeHref} className={`${theme.hoverAccentText} transition-colors font-medium`}>
                  Utama ({portalData?.name || 'Gnext'})
                </Link>
              </li>
              <li>
                <Link to={`${baseNav}?category=teknologi`} className={`${theme.hoverAccentText} transition-colors`}>
                  Teknologi & Inovasi
                </Link>
              </li>
              <li>
                <Link to={`${baseNav}?category=kreatif`} className={`${theme.hoverAccentText} transition-colors`}>
                  Kreatif & Media
                </Link>
              </li>
              <li>
                <Link to={`${baseNav}?category=bisnis`} className={`${theme.hoverAccentText} transition-colors`}>
                  Bisnis & Keuangan
                </Link></li>
              <li>
                <Link to="/about" className={`${theme.hoverAccentText} transition-colors`}>
                  Tentang Gnext Indonesia
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Hubungi Redaksi Gnext Indonesia */}
          <div className="md:col-span-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-neutral-300 mb-6">
              Hubungi Redaksi Gnext Indonesia
            </h4>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4">
              Punya aspirasi, opini, rilis pers, atau informasi liputan? Kirimkan tulisan Anda langsung ke tim redaksi pusat GNEXT INDONESIA.
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <a 
                href="mailto:info.gnextindonesia@gmail.com" 
                className={`flex items-center gap-2 ${theme.hoverAccentText} transition-colors`}
              >
                <Mail size={16} className={theme.accentText} />
                <span>info.gnextindonesia@gmail.com</span>
              </a>
              <div className="flex items-center gap-2">
                <Phone size={16} className={theme.accentText} />
                <span>0858-5248-8293</span>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                to={`/register?portal=${activePortal}`} 
                className={`inline-block px-4 py-2 ${theme.buttonBg} ${theme.buttonHoverBg} text-white text-xs font-bold rounded transition-colors shadow-sm`}
              >
                Daftar Penulis Pers
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-neutral-900 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} GNEXT INDONESIA. Suara Publik Indonesia. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 mt-4 sm:mt-0">
            <Link to="/about" className="hover:text-neutral-300 transition-colors">Tentang Kami</Link>
            <Link to={sub ? "/privacy" : "/news/privacy"} className="hover:text-neutral-300 transition-colors">Kebijakan Privasi</Link>
            <Link to={sub ? "/terms" : "/news/terms"} className="hover:text-neutral-300 transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
