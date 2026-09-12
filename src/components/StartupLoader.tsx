import React from 'react';
import { Radio, Globe } from 'lucide-react';

interface StartupLoaderProps {
  portalName?: string;
  subdomain?: string | null;
}

export const StartupLoader: React.FC<StartupLoaderProps> = ({ portalName, subdomain }) => {
  const getSubdomainLabel = () => {
    if (subdomain === 'studio') return 'Gnext Studio Redaksi';
    if (subdomain === 'yoikijatim') return 'YO IKI JATIM';
    if (subdomain === 'lumajangtalks') return 'LUMAJANG TALKS';
    if (subdomain === 'gummah') return 'GNEXT UMMAH';
    if (subdomain === 'finance') return 'GNEXT FINANCE';
    if (subdomain === 'lentera') return 'LENTERA NUSANTARA';
    if (subdomain === 'news') return 'GNEXT NEWSROOM';
    return portalName || 'GNEXT INDONESIA';
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center p-6 text-white select-none animate-in fade-in duration-200">
      {/* Background Subtle Gradient Orb */}
      <div className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -top-10 -left-10" />
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* Animated Brand Badge / Emblem */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center relative group">
            <span className="font-display font-extrabold text-2xl text-white tracking-tighter">
              GN<span className="text-red-500">.</span>
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Portal Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-neutral-300 backdrop-blur-md">
            <Radio size={12} className="text-red-500 animate-pulse" />
            <span>Memuat Portal Berita</span>
          </div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            {getSubdomainLabel()}
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Menghubungkan jaringan portal berita digital...
          </p>
        </div>

        {/* Subtle Loading Progress Bar */}
        <div className="w-48 h-1 bg-neutral-800 rounded-full overflow-hidden relative border border-white/5">
          <div className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 rounded-full w-2/3 animate-pulse" />
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest font-mono pt-4">
          <Globe size={12} className="text-neutral-600" />
          <span>gnextindonesia.site</span>
        </div>
      </div>
    </div>
  );
};
