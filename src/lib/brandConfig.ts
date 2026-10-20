import { useState, useEffect } from 'react';

export type BrandId = 'gnext' | 'haloindonesia';

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
  description: 'Gnext Indonesia adalah induk media digital dan creative studio yang berdedikasi untuk membangun ekosistem kreatif, adaptif, dan berdampak bagi publik.'
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
  description: 'Halo Indonesia adalah jaringan media informasi dan kabar baik nusantara yang menyajikan berita positif, inspirasi, inovasi, dan suara masyarakat Indonesia secara akurat, terpercaya, dan berimbang.'
};

export function detectBrandId(hostname?: string, search?: string): BrandId {
  if (typeof window === 'undefined' && !hostname) {
    return 'gnext';
  }

  const host = (hostname || (typeof window !== 'undefined' ? window.location.hostname : '')).toLowerCase();
  const searchStr = search || (typeof window !== 'undefined' ? window.location.search : '');

  // 1. Cek query parameter brand (misal: ?brand=haloindonesia atau ?brand=halo untuk pengujian lokal)
  if (searchStr) {
    try {
      const params = new URLSearchParams(searchStr);
      const brandParam = (params.get('brand') || '').toLowerCase();
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

  // 2. Cek domain hostname: haloindonesia.gnn.web.id atau subdomain yang memuat haloindonesia
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
    return detectBrandId() === 'haloindonesia' ? HALO_INDONESIA_BRAND : GNEXT_BRAND;
  }
  if (brandIdOrHost === 'haloindonesia' || brandIdOrHost.includes('haloindonesia')) {
    return HALO_INDONESIA_BRAND;
  }
  if (brandIdOrHost === 'gnext') {
    return GNEXT_BRAND;
  }
  return detectBrandId(brandIdOrHost) === 'haloindonesia' ? HALO_INDONESIA_BRAND : GNEXT_BRAND;
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
    .replace(/Gnext\s+Creative\s+Studio/g, brand.name + ' Studio')
    // News names
    .replace(/Gnext\s+News\s+Network/gi, brand.name + ' News Network')
    .replace(/GNEXT\s+NEWS/g, brand.nameUpper + ' NEWS')
    .replace(/Gnext\s+News/g, brand.name + ' News')
    .replace(/gnext\s+news/g, brand.name.toLowerCase() + ' news')
    // Domains
    .replace(/gnextindonesia\.site/g, brand.domain)
    .replace(/www\.gnextindonesia\.site/g, brand.domain)
    // Standalone "Gnext"
    .replace(/\bGnext\b/g, brand.name)
    .replace(/\bGNEXT\b/g, brand.nameUpper);
}

export function useBrand(): { brand: BrandConfig; isHaloIndonesia: boolean } {
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
    isHaloIndonesia: brand.id === 'haloindonesia'
  };
}
