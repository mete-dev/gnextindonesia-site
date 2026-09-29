import React, { useState, useEffect, useRef } from 'react';
import { X, Download, RefreshCw, Image as ImageIcon, Sparkles, Check, Share2, Eye, Layout, Type, Palette } from 'lucide-react';
import { ALL_PORTALS, getPortalById } from '../../lib/portals';

interface SocialCardExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title?: string;
    content?: string;
    cover_image?: string;
    news_location?: string;
    date?: string;
    created_at?: string;
    portal?: string;
    categoryName?: string;
    sub_category?: string;
  };
}

type AspectRatio = '4:5' | '9:16';
type ThemePreset = 'editorial_dark' | 'modern_light' | 'bold_accent' | 'minimal_quote';

export const SocialCardExporterModal: React.FC<SocialCardExporterModalProps> = ({
  isOpen,
  onClose,
  article
}) => {
  const [ratio, setRatio] = useState<AspectRatio>('4:5');
  const [theme, setTheme] = useState<ThemePreset>('editorial_dark');
  const [showExcerpt, setShowExcerpt] = useState(true);
  const [customBadgeText, setCustomBadgeText] = useState('BERITA UTAMA');
  const [customLocation, setCustomLocation] = useState(article.news_location || 'Nasional');
  const [customTitle, setCustomTitle] = useState(article.title || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to extract clean excerpt text
  const getExcerpt = (rawContent?: string, maxChars: number = 130) => {
    if (!rawContent) return '';
    const clean = rawContent
      .replace(/#+\s?|[\*\_]{1,3}|\[([^\]]+)\]\([^\)]+\)|`{1,3}.*?`{1,3}|^\s*[\-\*]\s+/gm, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (clean.length <= maxChars) return clean;
    return clean.slice(0, maxChars) + '...';
  };

  const customExcerpt = getExcerpt(article.content, ratio === '9:16' ? 180 : 130);

  // Helper to draw wrapped text on HTML5 Canvas
  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 4
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        linesCount++;
        if (linesCount >= maxLines) {
          ctx.fillText(line.trim() + '...', x, currentY);
          return currentY + lineHeight;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  // Helper to draw rounded rectangle on canvas
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Render canvas
  const renderGraphicCanvas = async () => {
    setIsGenerating(true);

    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = ratio === '4:5' ? 1350 : 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill base background
    ctx.fillStyle = '#0F0F11';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Cover Image if available
    const coverSrc = article.cover_image;
    if (coverSrc) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // resolve anyway to avoid hanging
          img.src = coverSrc;
        });

        if (img.width && img.height) {
          // Object-fit cover calculation
          if (theme === 'modern_light') {
            // Light theme: Image occupies top 55% height
            const imgTargetH = height * 0.58;
            const imgAspect = img.width / img.height;
            const targetAspect = width / imgTargetH;
            let renderW = width;
            let renderH = imgTargetH;
            let offsetX = 0;
            let offsetY = 0;

            if (imgAspect > targetAspect) {
              renderW = imgTargetH * imgAspect;
              offsetX = (width - renderW) / 2;
            } else {
              renderH = width / imgAspect;
              offsetY = (imgTargetH - renderH) / 2;
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, width, imgTargetH);
            ctx.clip();
            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
            ctx.restore();
          } else {
            // Dark themes: Cover image occupies full canvas background
            const imgAspect = img.width / img.height;
            const targetAspect = width / height;
            let renderW = width;
            let renderH = height;
            let offsetX = 0;
            let offsetY = 0;

            if (imgAspect > targetAspect) {
              renderW = height * imgAspect;
              offsetX = (width - renderW) / 2;
            } else {
              renderH = width / imgAspect;
              offsetY = (height - renderH) / 2;
            }
            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
          }
        }
      } catch (err) {
        console.warn('Canvas image render notice:', err);
      }
    }

    // 2. Apply Theme Gradient & Overlay
    if (theme === 'editorial_dark') {
      // Deep dark gradient overlay for maximum readability
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(10, 10, 15, 0.65)');
      gradient.addColorStop(0.35, 'rgba(10, 10, 15, 0.45)');
      gradient.addColorStop(0.65, 'rgba(10, 10, 15, 0.90)');
      gradient.addColorStop(1, 'rgba(10, 10, 15, 0.98)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else if (theme === 'bold_accent') {
      // Crimson / Ruby high-impact gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(150, 10, 20, 0.70)');
      gradient.addColorStop(0.4, 'rgba(15, 10, 15, 0.60)');
      gradient.addColorStop(0.75, 'rgba(15, 10, 15, 0.95)');
      gradient.addColorStop(1, 'rgba(15, 10, 15, 0.99)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else if (theme === 'modern_light') {
      // Top image shadow + Bottom white card
      const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.58);
      topGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
      topGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
      topGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, width, height * 0.58);

      // White bottom card surface
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, height * 0.52, width, height * 0.48);

      // Subtle shadow line
      const cardGrad = ctx.createLinearGradient(0, height * 0.50, 0, height * 0.52);
      cardGrad.addColorStop(0, 'rgba(0,0,0,0)');
      cardGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = cardGrad;
      ctx.fillRect(0, height * 0.50, width, height * 0.02);
    } else if (theme === 'minimal_quote') {
      // Sleek charcoal minimalist backdrop
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(20, 22, 28, 0.85)');
      gradient.addColorStop(1, 'rgba(12, 14, 18, 0.98)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Draw Header Branding (Portal Name & Verified Badge)
    const portalId = article.portal || 'gnext';
    const portalInfo = getPortalById(portalId);
    const portalName = portalInfo ? portalInfo.name.toUpperCase() : 'GNEXT INDONESIA';

    const paddingX = 72;
    const topMargin = ratio === '9:16' ? 120 : 80;

    // Header Portal Badge Pill
    ctx.fillStyle = theme === 'modern_light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)';
    drawRoundedRect(ctx, paddingX, topMargin, 260, 48, 14);
    ctx.fill();

    ctx.fillStyle = theme === 'modern_light' ? '#111' : '#FFF';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('🔴 ' + portalName.slice(0, 16), paddingX + 16, topMargin + 31);

    // Decorative Right Header Label
    ctx.fillStyle = theme === 'modern_light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('OFFICIAL NEWSROOM', width - paddingX, topMargin + 31);
    ctx.textAlign = 'left'; // reset text align

    // 4. Content Block Positioning
    const isLight = theme === 'modern_light';
    const textColor = isLight ? '#111827' : '#FFFFFF';
    const subTextColor = isLight ? '#4B5563' : '#D1D5DB';
    const accentColor = theme === 'bold_accent' ? '#DC2626' : (isLight ? '#2563EB' : '#E11D48');

    let startY = ratio === '9:16' 
      ? (isLight ? height * 0.56 : height * 0.50) 
      : (isLight ? height * 0.55 : height * 0.42);

    // Category Pill + Badge Pill
    const badgeText = (customBadgeText || 'BERITA UTAMA').toUpperCase();
    const catText = (article.categoryName || 'BERITA').toUpperCase();

    // Draw Category Badge
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + 36;
    
    ctx.fillStyle = theme === 'bold_accent' ? '#DC2626' : '#E11D48';
    drawRoundedRect(ctx, paddingX, startY, badgeWidth, 42, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(badgeText, paddingX + 18, startY + 27);

    // Draw Sub-Category / Category Tag
    if (catText) {
      const catWidth = ctx.measureText(catText).width + 32;
      ctx.fillStyle = isLight ? '#F3F4F6' : 'rgba(255,255,255,0.18)';
      drawRoundedRect(ctx, paddingX + badgeWidth + 14, startY, catWidth, 42, 10);
      ctx.fill();

      ctx.fillStyle = isLight ? '#374151' : '#FFFFFF';
      ctx.fillText(catText, paddingX + badgeWidth + 30, startY + 27);
    }

    startY += 76;

    // Location & Dateline Pin
    const locText = `📍 ${(customLocation || 'NASIONAL').toUpperCase()} • ${article.date ? new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'LONG', year: 'NUMERIC' }).toUpperCase() : '30 SEPTEMBER 2026'}`;
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme === 'bold_accent' ? '#FCA5A5' : (isLight ? '#2563EB' : '#F43F5E');
    ctx.fillText(locText, paddingX, startY);

    startY += 48;

    // Article Main Title (Bold Display Font)
    const titleTextToDraw = customTitle || article.title || 'Judul Berita Utama';
    ctx.font = ratio === '9:16' 
      ? 'bold 50px Inter, system-ui, -apple-system, sans-serif'
      : 'bold 46px Inter, system-ui, -apple-system, sans-serif';
    ctx.fillStyle = textColor;
    
    // Add text shadow for dark themes to boost legibility
    if (!isLight) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
    }

    const titleEndY = drawWrappedText(
      ctx,
      titleTextToDraw,
      paddingX,
      startY,
      width - (paddingX * 2),
      ratio === '9:16' ? 66 : 60,
      ratio === '9:16' ? 5 : 4
    );

    ctx.shadowColor = 'transparent'; // reset shadow

    // Excerpt Block (if enabled)
    if (showExcerpt && customExcerpt) {
      const excerptY = titleEndY + 24;
      ctx.font = '400 24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = subTextColor;
      drawWrappedText(
        ctx,
        customExcerpt,
        paddingX,
        excerptY,
        width - (paddingX * 2),
        36,
        ratio === '9:16' ? 4 : 3
      );
    }

    // 5. Bottom Footer Branding Bar
    const footerY = height - (ratio === '9:16' ? 100 : 80);
    
    // Footer Divider Line
    ctx.strokeStyle = isLight ? '#E5E7EB' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingX, footerY - 24);
    ctx.lineTo(width - paddingX, footerY - 24);
    ctx.stroke();

    // Footer Text
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = isLight ? '#111827' : '#FFFFFF';
    ctx.fillText('www.gnextindonesia.com', paddingX, footerY + 10);

    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = isLight ? '#6B7280' : 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.fillText('Scan / Baca Selengkapnya ➔', width - paddingX, footerY + 10);
    ctx.textAlign = 'left';

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    setPreviewDataUrl(dataUrl);
    setIsGenerating(false);
  };

  useEffect(() => {
    if (isOpen) {
      renderGraphicCanvas();
    }
  }, [isOpen, ratio, theme, showExcerpt, customBadgeText, customLocation, customTitle]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    const safeSlug = (customTitle || 'berita')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40);
    const ratioStr = ratio.replace(':', 'x');
    link.download = `gnext-${safeSlug}-${ratioStr}.png`;
    link.href = previewDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold">
                Generator Kartu Gambar Sosial Media
              </h3>
              <p className="text-xs text-neutral-400">
                Render grafis berita resolusi tinggi untuk Instagram Post (4:5) & Story/TikTok (9:16)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-neutral-50/60">
          {/* Left Panel: Preview Container */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-neutral-950/90 rounded-2xl p-4 sm:p-6 border border-neutral-800 min-h-[380px] relative shadow-inner">
            {isGenerating && (
              <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-20 text-white rounded-2xl">
                <div className="flex items-center gap-3 bg-neutral-900 px-5 py-3 rounded-2xl border border-neutral-800 shadow-xl">
                  <RefreshCw size={18} className="animate-spin text-red-500" />
                  <span className="text-xs font-bold">Mengarsir Grafis HD...</span>
                </div>
              </div>
            )}

            {previewDataUrl ? (
              <div
                className={`relative shadow-2xl rounded-2xl overflow-hidden border border-neutral-700/80 transition-all ${
                  ratio === '4:5' ? 'max-w-[340px] aspect-[4/5]' : 'max-w-[280px] aspect-[9/16]'
                }`}
              >
                <img
                  src={previewDataUrl}
                  alt="Rendered Social Card Preview"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
            ) : (
              <div className="text-center text-neutral-500 text-xs">
                <ImageIcon size={32} className="mx-auto mb-2 text-neutral-600" />
                <span>Menyiapkan pratinjau kartu...</span>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-400 font-medium bg-neutral-900/80 px-3 py-1.5 rounded-lg border border-neutral-800">
              <Eye size={13} className="text-emerald-400" />
              <span>Resolusi HD Canvas (1080px {ratio === '4:5' ? 'x 1350px' : 'x 1920px'})</span>
            </div>
          </div>

          {/* Right Panel: Customization Options */}
          <div className="lg:col-span-5 space-y-5 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs overflow-y-auto">
            {/* 1. Ratio Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                <Layout size={14} className="text-red-600" /> 1. Pilih Rasio Gambar
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRatio('4:5')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    ratio === '4:5'
                      ? 'border-neutral-900 bg-neutral-900 text-white font-bold shadow-sm'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className={`w-6 h-8 rounded border-2 ${ratio === '4:5' ? 'border-white bg-white/20' : 'border-neutral-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Rasio 4:5</div>
                    <div className={`text-[10px] ${ratio === '4:5' ? 'text-neutral-300' : 'text-neutral-500'}`}>Instagram Feed / Post</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRatio('9:16')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    ratio === '9:16'
                      ? 'border-neutral-900 bg-neutral-900 text-white font-bold shadow-sm'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className={`w-5 h-9 rounded border-2 ${ratio === '9:16' ? 'border-white bg-white/20' : 'border-neutral-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Rasio 9:16</div>
                    <div className={`text-[10px] ${ratio === '9:16' ? 'text-neutral-300' : 'text-neutral-500'}`}>Story / Reels / TikTok</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Theme Preset Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 flex items-center gap-1.5">
                <Palette size={14} className="text-red-600" /> 2. Pilih Tema Desain
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'editorial_dark', name: 'Editorial Dark', desc: 'Gradien Gelap Elegan' },
                  { id: 'bold_accent', name: 'Ruby Bold', desc: 'Merah Kontras Berita' },
                  { id: 'modern_light', name: 'Modern Light', desc: 'Kartu Putih Bersih' },
                  { id: 'minimal_quote', name: 'Minimal Charcoal', desc: 'Desain Minimalis' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as ThemePreset)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      theme === t.id
                        ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-2 ring-red-600/20'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.name}</div>
                    <div className="text-[10px] text-neutral-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Text Customization */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Type size={14} className="text-red-600" /> 3. Penyesuaian Teks
              </label>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Badge Kategori Utama</label>
                <input
                  type="text"
                  value={customBadgeText}
                  onChange={(e) => setCustomBadgeText(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="BERITA UTAMA"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Lokasi Kejadian Berita</label>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Nasional / Jakarta"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">Judul Berita yang Rendernya Tampil</label>
                <textarea
                  rows={2}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  placeholder="Tulis judul berita..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="toggleExcerpt"
                  checked={showExcerpt}
                  onChange={(e) => setShowExcerpt(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-neutral-300"
                />
                <label htmlFor="toggleExcerpt" className="text-xs text-neutral-700 font-medium cursor-pointer">
                  Tampilkan Ringkasan Berita (Excerpt)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!previewDataUrl || isGenerating}
            className="px-7 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
          >
            <Download size={16} />
            <span>Unduh Gambar PNG ({ratio})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
