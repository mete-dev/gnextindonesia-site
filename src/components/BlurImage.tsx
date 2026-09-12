import React, { useState, useEffect, useRef } from 'react';

// Lightweight tiny blurred base64 placeholder SVG
export const BLUR_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23171717'/%3E%3C/svg%3E";

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
}

export const BlurImage: React.FC<BlurImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  style,
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Instantly resolve cached images to prevent any visual delay or stuck blur
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-neutral-900 ${containerClassName}`}>
      {/* Low-resolution base64 blur placeholder + backdrop-filter overlay */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-neutral-900 z-10 transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundImage: `url("${BLUR_PLACEHOLDER}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="w-full h-full bg-gradient-to-tr from-neutral-900/80 via-neutral-800/40 to-neutral-900/80 animate-pulse" />
        </div>
      )}

      {/* Main image with blur-up animation */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        className={`w-full h-full object-cover transition-all duration-700 ${
          isLoaded
            ? 'opacity-100 scale-100 blur-0'
            : 'opacity-0 scale-105 blur-md'
        } ${className}`}
        style={style}
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
};

export default BlurImage;
