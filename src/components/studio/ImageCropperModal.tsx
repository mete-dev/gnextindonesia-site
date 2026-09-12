import React, { useState, useRef, useEffect } from 'react';
import { Crop, Move, ZoomIn, ZoomOut, RotateCcw, X, Check, Image as ImageIcon } from 'lucide-react';

interface ImageCropperModalProps {
  imageFile: File | null;
  imageUrl?: string; // fallback if dataUrl/url is already available
  onCropComplete: (croppedDataUrl: string, file: File) => void;
  onCancel: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageFile,
  imageUrl,
  onCropComplete,
  onCancel,
}) => {
  const [src, setSrc] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '4/3'>('16/9');
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load file as data URL
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setSrc(reader.result as string);
        }
      };
      reader.readAsDataURL(imageFile);
    } else if (imageUrl) {
      setSrc(imageUrl);
    }
  }, [imageFile, imageUrl]);

  // Reset offset and zoom when aspect ratio changes
  const resetAdjustments = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    resetAdjustments();
  }, [aspectRatio]);

  // Handle Image Load to get natural size
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  // Dragging / Panning handlers (Mouse)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Dragging / Panning handlers (Touch)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - offset.x,
      y: touch.clientY - offset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Canvas Crop Execution
  const handleCrop = () => {
    if (!naturalSize.width || !naturalSize.height || isCropping) return;
    setIsCropping(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Create canvas at high resolution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCropping(false);
        return;
      }

      // Target canvas dimensions
      const targetWidth = 1200;
      const targetHeight = aspectRatio === '16/9' ? 675 : 900; // 1200x675 (16:9) or 1200x900 (4:3)

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Base dimension scaling (object-fit: cover behavior)
      const scaleX = targetWidth / naturalSize.width;
      const scaleY = targetHeight / naturalSize.height;
      const baseScale = Math.max(scaleX, scaleY);

      const baseWidth = naturalSize.width * baseScale;
      const baseHeight = naturalSize.height * baseScale;

      // Panning offset scaling from screen box to target canvas
      const boxWidth = containerRef.current?.clientWidth || 400;
      const boxHeight = containerRef.current?.clientHeight || 225;
      const scaleFactorX = targetWidth / boxWidth;
      const scaleFactorY = targetHeight / boxHeight;

      const canvasOffsetX = offset.x * scaleFactorX;
      const canvasOffsetY = offset.y * scaleFactorY;

      // Apply zoom
      const finalWidth = baseWidth * zoom;
      const finalHeight = baseHeight * zoom;

      // Draw centered with user-adjusted zoom and pan offsets
      const centerX = targetWidth / 2 + canvasOffsetX;
      const centerY = targetHeight / 2 + canvasOffsetY;

      const drawX = centerX - finalWidth / 2;
      const drawY = centerY - finalHeight / 2;

      // Clear & Draw
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, drawX, drawY, finalWidth, finalHeight);

      // Convert canvas to base64 Data URL and back to a file
      const croppedDataUrl = canvas.toDataURL('image/webp', 0.9);
      
      // Try to construct a cropped File object if possible
      let croppedFile = imageFile || new File([], 'cropped.webp');
      try {
        const binStr = atob(croppedDataUrl.split(',')[1]);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }
        const blob = new Blob([arr], { type: 'image/webp' });
        croppedFile = new File([blob], imageFile?.name ? imageFile.name.replace(/\.[^/.]+$/, "") + "_cropped.webp" : "cropped_image.webp", {
          type: 'image/webp',
          lastModified: Date.now()
        });
      } catch (e) {
        console.error('Error creating cropped File object, using fallback', e);
      }

      onCropComplete(croppedDataUrl, croppedFile);
      setIsCropping(false);
    };
    img.onerror = () => {
      alert('Gagal membaca data gambar untuk dipangkas.');
      setIsCropping(false);
    };
    img.src = src;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-150 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 text-neutral-900 rounded-xl">
              <Crop size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Atur & Pangkas Gambar</h3>
              <p className="text-[11px] text-neutral-500 font-medium">Format wajib berukuran 16:9 atau 4:3</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Container */}
        <div className="p-6 bg-neutral-50 flex-1 overflow-y-auto space-y-5">
          
          {/* Visual Aspect Ratio Chooser */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">Pilih Rasio Dimensi</span>
            <div className="flex items-center gap-1.5 bg-neutral-200/60 p-1 rounded-xl border border-neutral-300/40">
              <button
                type="button"
                onClick={() => setAspectRatio('16/9')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
                  aspectRatio === '16/9'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>16 : 9</span>
                <span className="text-[9px] px-1 py-0.5 bg-neutral-700 text-white rounded font-mono">Cover</span>
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('4/3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase flex items-center gap-1.5 cursor-pointer ${
                  aspectRatio === '4/3'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>4 : 3</span>
                <span className="text-[9px] px-1 py-0.5 bg-neutral-700 text-white rounded font-mono">Standard</span>
              </button>
            </div>
          </div>

          {/* Interactive Crop Box Viewport */}
          <div className="relative">
            {/* Aspect Ratio Box Wrapper */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
              className={`w-full bg-neutral-900 rounded-2xl overflow-hidden relative shadow-inner border border-neutral-300 select-none cursor-move flex items-center justify-center transition-all duration-300 ${
                aspectRatio === '16/9' ? 'aspect-[16/9]' : 'aspect-[4/3]'
              }`}
            >
              {src ? (
                <img
                  ref={imageRef}
                  src={src}
                  alt="Crop Target"
                  onLoad={handleImageLoad}
                  className="absolute pointer-events-none transition-transform duration-75 select-none"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-neutral-500 flex flex-col items-center gap-1.5">
                  <ImageIcon size={32} className="animate-pulse" />
                  <span className="text-xs">Memuat file gambar...</span>
                </div>
              )}

              {/* Crop Grid Helpers Overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-neutral-200/40 rounded-2xl flex items-center justify-center">
                {/* Center circle */}
                <div className="w-10 h-10 border border-dashed border-white/30 rounded-full" />
                {/* Thirds Grid lines */}
                <div className="absolute inset-x-0 h-px bg-white/20 top-1/3" />
                <div className="absolute inset-x-0 h-px bg-white/20 top-2/3" />
                <div className="absolute inset-y-0 w-px bg-white/20 left-1/3" />
                <div className="absolute inset-y-0 w-px bg-white/20 left-2/3" />
              </div>

              {/* Helper badge */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-neutral-300 uppercase tracking-widest font-bold pointer-events-none flex items-center gap-1">
                <Move size={10} />
                <span>Seret Gambar</span>
              </div>
            </div>
          </div>

          {/* Interactive Zoom Controls */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              <span>Perbesar / Perkecil (Zoom)</span>
              <span className="font-mono text-neutral-900 bg-neutral-200/80 px-2 py-0.5 rounded-md">
                {zoom.toFixed(2)}x
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}
                className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-neutral-900 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                className="p-2 text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Extra tools / Reset */}
          <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-100 p-3 rounded-2xl border border-neutral-200">
            <span className="leading-snug">
              💡 <strong>Tips:</strong> Gunakan slider untuk memperbesar bagian foto, lalu klik/sentuh dan seret gambar untuk memposisikan pangkasan dengan sempurna.
            </span>
            <button
              type="button"
              onClick={resetAdjustments}
              className="p-1.5 ml-2 hover:bg-white text-neutral-600 hover:text-neutral-900 rounded-xl border border-neutral-200/60 transition-all flex items-center gap-1 font-bold shrink-0 shadow-3xs"
              title="Atur Ulang"
            >
              <RotateCcw size={13} />
              <span className="text-[10px] uppercase">Reset</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4.5 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCropping}
            className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-transparent rounded-xl hover:bg-neutral-150 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={isCropping}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isCropping ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Pangkas & Simpan</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
