import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  excerpt?: string;
  coverImage?: string;
  url?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ShareButtons({ title, excerpt, url, className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const cleanExcerpt = excerpt ? excerpt.trim() : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: cleanExcerpt ? `${title}\n\n"${cleanExcerpt}"` : title,
          url: currentUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareTextWhatsApp = encodeURIComponent(
    `*${title}*` + (cleanExcerpt ? `\n\n_"${cleanExcerpt}"_` : '') + `\n\n${currentUrl}`
  );

  const shareTextX = encodeURIComponent(
    `${title}` + (cleanExcerpt ? `\n\n"${cleanExcerpt}"` : '')
  );

  const shareTextTelegram = encodeURIComponent(
    `*${title}*` + (cleanExcerpt ? `\n\n"${cleanExcerpt}"` : '')
  );

  const encodedUrl = encodeURIComponent(currentUrl);

  const shareLinks = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${shareTextWhatsApp}`,
      bg: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.129 1.226 4.86 1.226h.004c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.038-5.176-2.926-7.062C17.189 3.038 14.68 2 12.012 2zM12.016 20.155h-.003c-1.493 0-2.958-.401-4.237-1.159l-.304-.18-3.148.825.84-3.067-.198-.314a8.307 8.307 0 01-1.272-4.442c0-4.582 3.728-8.31 8.312-8.31 2.218 0 4.303.865 5.871 2.435a8.26 8.26 0 012.432 5.869c0 4.583-3.729 8.313-8.313 8.313zm4.557-6.223c-.25-.125-1.477-.729-1.706-.812-.229-.083-.396-.125-.563.125-.166.25-.646.812-.792.979-.146.166-.292.187-.542.062-.25-.125-1.056-.389-2.011-1.241-.743-.663-1.245-1.48-1.391-1.73-.146-.25-.016-.385.109-.509.113-.112.25-.292.375-.438.125-.146.166-.25.25-.417.083-.166.042-.312-.021-.438-.063-.125-.563-1.354-.771-1.854-.203-.487-.411-.421-.563-.429-.146-.007-.313-.009-.479-.009s-.438.062-.667.312c-.229.25-.875.854-.875 2.083 0 1.229.896 2.417 1.021 2.583.125.166 1.762 2.69 4.27 3.772.597.257 1.064.411 1.428.527.6.19 1.146.163 1.577.099.48-.071 1.477-.604 1.686-1.188.208-.583.208-1.083.146-1.188-.063-.104-.229-.166-.479-.291z" />
        </svg>
      ),
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?text=${shareTextX}&url=${encodedUrl}`,
      bg: 'bg-neutral-900 hover:bg-neutral-800 text-white',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-[#0A66C2] hover:bg-[#09519a] text-white',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${shareTextTelegram}`,
      bg: 'bg-[#229ED9] hover:bg-[#1d8cb0] text-white',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap no-scrollbar max-w-full py-1 ${className}`}>
      {/* Label */}
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 shrink-0 flex items-center gap-1 pr-1">
        <Share2 size={13} className="text-neutral-400" />
        <span className="hidden sm:inline">Bagikan:</span>
      </span>

      {/* Social Icons (Circular, Single Row) */}
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Bagikan ke ${link.name}`}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all transform hover:scale-105 shadow-sm ${link.bg}`}
        >
          {link.icon}
        </a>
      ))}

      {/* Copy Link Button (Compact Pill) */}
      <button
        onClick={handleCopyLink}
        title={copied ? 'Tautan Disalin!' : 'Salin Tautan'}
        className={`h-8 rounded-full text-xs font-semibold transition-all border flex items-center justify-center shrink-0 px-2.5 shadow-sm ${
          copied
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300'
        }`}
      >
        {copied ? (
          <Check size={14} className="text-white animate-pulse shrink-0" />
        ) : (
          <LinkIcon size={13} className="shrink-0 text-neutral-600" />
        )}
        <span className="ml-1 text-[11px] font-medium hidden sm:inline">
          {copied ? 'Disalin' : 'Salin'}
        </span>
      </button>

      {/* Native Share Button (Lainnya) */}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          onClick={handleNativeShare}
          title="Opsi Bagikan Lainnya"
          className="h-8 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm flex items-center justify-center shrink-0 px-2.5"
        >
          <Share2 size={13} className="shrink-0" />
          <span className="ml-1 text-[11px] font-medium hidden sm:inline">Lainnya</span>
        </button>
      )}
    </div>
  );
}

