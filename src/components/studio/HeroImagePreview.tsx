import React, { useState } from 'react';
import { Camera, Image as ImageIcon, X, CheckCircle2, AlertCircle, Maximize2, Sparkles } from 'lucide-react';
import { getDataUrlByteSize, formatByteSize } from '../../lib/imageCompressor';

interface HeroImagePreviewProps {
  coverImage?: string;
  caption?: string;
  credit?: string;
  title?: string;
  categoryName?: string;
  portal?: string;
  onFileSelect: (file: File) => void;
  onOpenGallery: () => void;
  onRemove: () => void;
  onCaptionChange: (caption: string) => void;
  onCreditChange: (credit: string) => void;
}

export const HeroImagePreview: React.FC<HeroImagePreviewProps> = ({
  coverImage,
  caption = '',
  credit = '',
  title = '',
  categoryName = 'Berita',
  portal = 'Gnext',
  onFileSelect,
  onOpenGallery,
  onRemove,
  onCaptionChange,
  onCreditChange
}) => {
  const [viewMode, setViewMode] = useState<'normal' | 'card_preview'>('normal');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-4">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">3</span>
          <span>Pratinjau Hero Image (Foto Sampul Utama) *</span>
        </h3>
        
        <div className="flex items-center gap-2">
          {coverImage ? (
            <>
              <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Hero Image Siap</span>
              </span>
              {coverImage.startsWith('data:') && (
                <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  Kompresi: {formatByteSize(getDataUrlByteSize(coverImage))} (Maks 20 KB)
                </span>
              )}
            </>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-rose-600" />
              <span>Foto Sampul Wajib</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Thumbnail Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-3">
          {coverImage ? (
            <div className="relative group rounded-2xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-900 aspect-[16/9] transition-all">
              {/* Image element */}
              <img
                src={coverImage}
                alt="Hero Image Preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 opacity-90 transition-opacity" />

              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-white/20 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" />
                  Hero Image Thumbnail
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-md transition-all border border-white/20"
                    title="Perbesar Pratinjau Foto"
                  >
                    <Maximize2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md transition-all shadow-sm"
                    title="Hapus Hero Image"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Card Overlay Mode Content */}
              {viewMode === 'card_preview' ? (
                <div className="absolute bottom-3 left-3 right-3 z-10 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-extrabold uppercase">
                      {portal.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">
                      {categoryName}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                    {title.trim() || 'Judul artikel berita akan tampil elegan di sini...'}
                  </h4>
                </div>
              ) : (
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2">
                  <div className="text-[11px] text-white/90 font-medium line-clamp-1 max-w-[80%]">
                    {caption ? `📷 ${caption}` : 'Belum ada keterangan foto'}
                  </div>
                  <span className="text-[10px] text-white/70 font-mono bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    16:9 HD
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[16/9] bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 p-6 text-center space-y-2 hover:border-neutral-400 transition-all">
              <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-500">
                <Camera size={32} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-800 block">Belum Ada Hero Image</span>
                <span className="text-[11px] text-neutral-500 mt-0.5 block max-w-xs">
                  Unggah foto beresolusi tinggi atau pilih dari galeri sampul berita untuk ditampilkan sebagai thumbnail utama.
                </span>
              </div>
            </div>
          )}

          {/* View Mode Toggle Controls */}
          {coverImage && (
            <div className="flex items-center justify-between px-1 text-xs text-neutral-600">
              <span className="text-[11px] font-medium text-neutral-500">
                Mode Pratinjau Thumbnail:
              </span>
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
                <button
                  type="button"
                  onClick={() => setViewMode('normal')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'normal'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Foto Bersih
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('card_preview')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'card_preview'
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Overlay Kartu Berita
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Actions & Controls */}
        <div className="space-y-3">
          <label className="w-full px-4 py-3.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800 transition-all shadow-sm">
            <Camera size={16} />
            <span>{coverImage ? 'Ganti Hero Image' : 'Unggah Hero Image'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />
          </label>

          <button
            type="button"
            onClick={onOpenGallery}
            className="w-full px-4 py-3.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-3xs"
          >
            <ImageIcon size={16} className="text-neutral-600" />
            <span>Pilih dari Galeri</span>
          </button>

          {coverImage && (
            <button
              type="button"
              onClick={onRemove}
              className="w-full px-4 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Hapus Hero Image
            </button>
          )}
        </div>
      </div>

      {/* Caption & Credit Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5 border-t border-neutral-100">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Keterangan Foto (Caption)
          </label>
          <input
            type="text"
            placeholder="Keterangan singkat konteks hero image..."
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-neutral-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
            Kredit Foto (Credit / Sumber)
          </label>
          <input
            type="text"
            placeholder="Contoh: Humas Redaksi / Dokumen Antara"
            value={credit}
            onChange={(e) => onCreditChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-neutral-900 outline-none"
          />
        </div>
      </div>

      {/* Lightbox Fullview Modal */}
      {lightboxOpen && coverImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 p-2 space-y-3">
            <div className="flex items-center justify-between p-3 border-b border-neutral-800 text-white">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-amber-400" />
                <span className="text-xs font-bold">Pratinjau Resolusi Penuh Hero Image</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-[70vh] flex items-center justify-center bg-black rounded-2xl overflow-hidden p-2">
              <img
                src={coverImage}
                alt="Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-3 bg-neutral-950 rounded-2xl text-xs text-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-white block">{caption || 'Tanpa Keterangan'}</span>
                <span className="text-[11px] text-neutral-400">Kredit: {credit || 'Redaksi'}</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="px-4 py-2 bg-white text-neutral-900 font-bold rounded-xl text-xs hover:bg-neutral-200"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
