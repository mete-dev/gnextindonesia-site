import React from 'react';

interface LenteraLogoProps {
  portalName?: string;
  className?: string;
  variant?: 'full' | 'icon';
  darkMode?: boolean;
}

export function LenteraLogo({
  portalName = 'Lentera Bangsa',
  className = 'text-3xl',
  variant = 'full',
  darkMode = false,
}: LenteraLogoProps) {
  let suffix = '.Bangsa';
  if (portalName) {
    const clean = portalName.replace(/^lentera\s*/i, '').replace(/^\./, '').trim();
    if (clean && clean.toLowerCase() !== 'id' && clean.toLowerCase() !== 'bangsa') {
      const nameWithoutDki = clean.replace(/^dki\s+/i, '');
      const words = nameWithoutDki.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      suffix = '.' + words.join('');
    } else {
      suffix = '.Bangsa';
    }
  }

  const NAVY = darkMode ? '#FFFFFF' : '#03182E';
  const GOLD = '#D98319';

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        style={{ aspectRatio: '100/110' }}
      >
        {/* Golden corner wedge at bottom-left */}
        <path
          d="M 0 110 L 0 72 C 0 94 14 110 38 110 Z"
          fill={GOLD}
        />
        {/* Navy or White L mark */}
        <path
          d="M 0 0 L 22 0 L 22 70 C 22 80 30 88 48 88 L 92 88 C 97 88 100 92 100 96 C 100 102 96 110 88 110 L 38 110 C 14 110 0 94 0 72 Z"
          fill={NAVY}
        />
      </svg>
    );
  }

  return (
    <div
      className={`inline-flex items-baseline font-black tracking-tighter select-none ${className}`}
      style={{ fontFamily: '"Montserrat", "Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      <span className="inline-flex items-baseline leading-none">
        {/* Vector Stylized L */}
        <svg
          viewBox="0 0 100 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[1.12em] w-auto inline-block align-baseline shrink-0"
          style={{ verticalAlign: '-0.12em', marginRight: '-0.02em' }}
        >
          {/* Golden Corner Wedge at bottom-left */}
          <path
            d="M 0 110 L 0 72 C 0 94 14 110 38 110 Z"
            fill={GOLD}
          />
          {/* Main L shape */}
          <path
            d="M 0 0 L 22 0 L 22 70 C 22 80 30 88 48 88 L 92 88 C 97 88 100 92 100 96 C 100 102 96 110 88 110 L 38 110 C 14 110 0 94 0 72 Z"
            fill={NAVY}
          />
        </svg>

        {/* 'entera' text */}
        <span
          className="font-black tracking-[-0.04em] text-[1em] leading-none"
          style={{
            color: NAVY,
            fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
            fontWeight: 900,
          }}
        >
          entera
        </span>

        {/* suffix, e.g. '.id', '.jogja', '.aceh' */}
        <span
          className="font-black tracking-[-0.03em] text-[1em] leading-none ml-[0.01em]"
          style={{
            color: GOLD,
            fontFamily: '"Montserrat", "Plus Jakarta Sans", sans-serif',
            fontWeight: 900,
          }}
        >
          {suffix}
        </span>
      </span>
    </div>
  );
}



