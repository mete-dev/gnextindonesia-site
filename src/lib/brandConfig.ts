import { useState, useEffect } from 'react';

export type BrandId = 'gnext' | 'haloindonesia' | 'thejavanesetimes';

export interface BrandConfig {
  id: BrandId;
  name: string;
  nameUpper: string;
  shortName: string;
  legalGroup: string;
  legalEntity: string;
  domain: string;
  url: string;
  logo: string;
  logoMinimalis: string;
  favicon: string;
  tagline: string;
  editorialContact: string;
  description: string;
  isDedicatedNews?: boolean;
}

export const GNEXT_BRAND: BrandConfig = {
  id: 'gnext',
  name: 'Gnext Indonesia',
  nameUpper: 'GNEXT INDONESIA',
  shortName: 'Gnext',
  legalGroup: 'Gnext Media Group',
  legalEntity: 'PT Gnext Creative Studio',
  domain: 'gnextindonesia.site',
  url: 'https://www.gnextindonesia.site',
  logo: '/logo.svg',
  logoMinimalis: '/logo.svg',
  favicon: '/favicon.svg',
  tagline: 'Creative Media, Digital Publishing & Technology',
  editorialContact: 'redaksi@gnextindonesia.site',
  description: 'Gnext Indonesia adalah induk media digital dan creative studio yang berdedikasi untuk membangun ekosistem kreatif, adaptif, dan berdampak bagi publik.',
  isDedicatedNews: false
};

export const HALO_INDONESIA_BRAND: BrandConfig = {
  id: 'haloindonesia',
  name: 'Halo Indonesia',
  nameUpper: 'HALO INDONESIA',
  shortName: 'Halo Indonesia',
  legalGroup: 'Halo Indonesia Media Group',
  legalEntity: 'PT Halo Indonesia Media',
  domain: 'haloindonesia.gnn.web.id',
  url: 'https://haloindonesia.gnn.web.id',
  logo: '/Logo Minimalis Halo Indonesia.png',
  logoMinimalis: '/Logo Minimalis Halo Indonesia.png',
  favicon: '/Logo Minimalis Halo Indonesia.png',
  tagline: 'Portal Kabar Baik, Inspirasi & Suara Positif Nusantara',
  editorialContact: 'redaksi@haloindonesia.gnn.web.id',
  description: 'Halo Indonesia adalah jaringan media informasi dan kabar baik nusantara yang menyajikan berita positif, inspirasi, inovasi, dan suara masyarakat Indonesia secara akurat, terpercaya, dan berimbang.',
  isDedicatedNews: false
};

export const THE_JAVANESE_TIMES_BRAND: BrandConfig = {
  id: 'thejavanesetimes',
  name: 'The Javanese Times',
  nameUpper: 'THE JAVANESE TIMES',
  shortName: 'The Javanese Times',
  legalGroup: 'The Javanese Times Editorial Media',
  legalEntity: 'PT The Javanese Times Media',
  domain: 'thejavanesetimes.gnn.web.id',
  url: 'https://thejavanesetimes.gnn.web.id',
  logo: '/Logo Editorial The Javanese Times.png',
  logoMinimalis: '/logo-thejavanesetimes.png',
  favicon: '/logo-thejavanesetimes.png',
  tagline: 'Independent Journalistic Editorial & Truth Across Java and Beyond',
  editorialContact: 'editorial@thejavanesetimes.gnn.web.id',
  description: 'The Javanese Times adalah media jurnalisme independen dan portal berita terpercaya yang menyajikan liputan mendalam, investigasi, analisis sosial-budaya, politik, serta dinamika masyarakat Jawa dan Nusantara.',
  isDedicatedNews: true
};

export function detectBrandId(hostname?: string, search?: string): BrandId {
  if (typeof window === 'undefined' && !hostname) {
    return 'gnext';
  }

  const host = (hostname || (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
  const searchStr = search || (typeof window !== 'undefined' ? window.location.search : '');

  // 1. Cek query parameter brand (misal: ?brand=thejavanesetimes atau ?brand=javanese atau ?brand=haloindonesia)
  if (searchStr) {
    try {
      const params = new URLSearchParams(searchStr);
      const brandParam = (params.get('brand') || '').toLowerCase();
      if (brandParam === 'thejavanesetimes' || brandParam === 'javanesetimes' || brandParam === 'javanese' || brandParam === 'tjt') {
        return 'thejavanesetimes';
      }
      if (brandParam === 'haloindonesia' || brandParam === 'halo' || brandParam === 'hi') {
        return 'haloindonesia';
      }
      if (brandParam === 'gnext') {
        return 'gnext';
      }
    } catch {
      // ignore
    }
  }

  // 2. Cek domain hostname: thejavanesetimes.gnn.web.id
  if (
    host === 'thejavanesetimes.gnn.web.id' ||
    host.includes('thejavanesetimes') ||
    host.includes('javanesetimes') ||
    host.startsWith('thejavanesetimes.') ||
    host.startsWith('javanese.')
  ) {
    return 'thejavanesetimes';
  }

  // 3. Cek domain hostname: haloindonesia.gnn.web.id atau subdomain yang memuat haloindonesia
  if (
    host === 'haloindonesia.gnn.web.id' ||
    host.includes('haloindonesia') ||
    host.startsWith('halo-indonesia.') ||
    host.startsWith('halo.')
  ) {
    return 'haloindonesia';
  }

  return 'gnext';
}

export function getBrandConfig(brandIdOrHost?: string): BrandConfig {
  if (!brandIdOrHost) {
    const detected = detectBrandId();
    if (detected === 'thejavanesetimes') return THE_JAVANESE_TIMES_BRAND;
    if (detected === 'haloindonesia') return HALO_INDONESIA_BRAND;
    return GNEXT_BRAND;
  }
  if (brandIdOrHost === 'thejavanesetimes' || brandIdOrHost.includes('thejavanesetimes') || brandIdOrHost.includes('javanesetimes')) {
    return THE_JAVANESE_TIMES_BRAND;
  }
  if (brandIdOrHost === 'haloindonesia' || brandIdOrHost.includes('haloindonesia')) {
    return HALO_INDONESIA_BRAND;
  }
  if (brandIdOrHost === 'gnext') {
    return GNEXT_BRAND;
  }
  const detected = detectBrandId(brandIdOrHost);
  if (detected === 'thejavanesetimes') return THE_JAVANESE_TIMES_BRAND;
  if (detected === 'haloindonesia') return HALO_INDONESIA_BRAND;
  return GNEXT_BRAND;
}

export function replaceBrandText(text: string, brand: BrandConfig = getBrandConfig()): string {
  if (!text || brand.id === 'gnext') {
    return text;
  }

  return text
    // Exact names
    .replace(/Gnext\s+Indonesia/g, brand.name)
    .replace(/GNEXT\s+INDONESIA/g, brand.nameUpper)
    .replace(/gnext\s+indonesia/g, brand.name.toLowerCase())
    // Corporate entities
    .replace(/Gnext\s+Media\s+Group/g, brand.legalGroup)
    .replace(/PT\s+Gnext\s+Creative\s+Studio/g, brand.legalEntity)
    .replace(/Gnext\s+Creative\s+Studio/g, brand.name)
    // News names
    .replace(/Gnext\s+News\s+Network/gi, brand.name + ' News Network')
    .replace(/GNEXT\s+NEWS/g, brand.nameUpper)
    .replace(/Gnext\s+News/g, brand.name)
    .replace(/gnext\s+news/g, brand.name.toLowerCase())
    // Domains
    .replace(/gnextindonesia\.site/g, brand.domain)
    .replace(/www\.gnextindonesia\.site/g, brand.domain)
    // Standalone "Gnext"
    .replace(/\bGnext\b/g, brand.name)
    .replace(/\bGNEXT\b/g, brand.nameUpper);
}

export function useBrand(): { brand: BrandConfig; isHaloIndonesia: boolean; isTheJavaneseTimes: boolean } {
  const [brand, setBrand] = useState<BrandConfig>(() => getBrandConfig());

  useEffect(() => {
    const updateBrand = () => {
      setBrand(getBrandConfig());
    };

    updateBrand();
    window.addEventListener('popstate', updateBrand);
    return () => window.removeEventListener('popstate', updateBrand);
  }, []);

  return {
    brand,
    isHaloIndonesia: brand.id === 'haloindonesia',
    isTheJavaneseTimes: brand.id === 'thejavanesetimes'
  };
}
