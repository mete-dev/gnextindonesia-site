export const lenteraNetworks = [
  { id: 'lenterabangsa', name: 'Lentera Bangsa' },
  { id: 'lenteraaceh', name: 'Lentera Aceh' },
  { id: 'lenterasumut', name: 'Lentera Sumut' },
  { id: 'lenterasumbar', name: 'Lentera Sumbar' },
  { id: 'lenterariau', name: 'Lentera Riau' },
  { id: 'lenterakepri', name: 'Lentera Kepri' },
  { id: 'lenterajambi', name: 'Lentera Jambi' },
  { id: 'lenterasumsel', name: 'Lentera Sumsel' },
  { id: 'lenterababel', name: 'Lentera Babel' },
  { id: 'lenterabengkulu', name: 'Lentera Bengkulu' },
  { id: 'lenteralampung', name: 'Lentera Lampung' },
  { id: 'lenterajakarta', name: 'Lentera Jakarta' },
  { id: 'lenterajabar', name: 'Lentera Jabar' },
  { id: 'lenterajateng', name: 'Lentera Jateng' },
  { id: 'lenterajogja', name: 'Lentera Jogja' },
  { id: 'lenterajatim', name: 'Lentera Jatim' },
  { id: 'lenterabanten', name: 'Lentera Banten' },
  { id: 'lenterabali', name: 'Lentera Bali' },
  { id: 'lenterantb', name: 'Lentera NTB' },
  { id: 'lenterantt', name: 'Lentera NTT' },
  { id: 'lenterakalbar', name: 'Lentera Kalbar' },
  { id: 'lenterakalteng', name: 'Lentera Kalteng' },
  { id: 'lenterakalsel', name: 'Lentera Kalsel' },
  { id: 'lenterakaltim', name: 'Lentera Kaltim' },
  { id: 'lenterakaltara', name: 'Lentera Kaltara' },
  { id: 'lenterasulut', name: 'Lentera Sulut' },
  { id: 'lenteragorontalo', name: 'Lentera Gorontalo' },
  { id: 'lenterasulteng', name: 'Lentera Sulteng' },
  { id: 'lenterasulbar', name: 'Lentera Sulbar' },
  { id: 'lenterasulsel', name: 'Lentera Sulsel' },
  { id: 'lenterasultra', name: 'Lentera Sultra' },
  { id: 'lenteramaluku', name: 'Lentera Maluku' },
  { id: 'lenteramalut', name: 'Lentera Malut' },
  { id: 'lenterapapua', name: 'Lentera Papua' }
];

export const ALL_PORTALS = [
  { id: 'gnext', name: 'Gnext Indonesia' },
  ...lenteraNetworks
];

export const getPortalById = (id: string) => {
  if (id === 'lenteraindonesia' || id === 'lentera') {
    return ALL_PORTALS.find(p => p.id === 'lenterabangsa') || ALL_PORTALS[0];
  }
  if (id === 'lenteradkijakarta' || id === 'lenteradki') {
    return ALL_PORTALS.find(p => p.id === 'lenterajakarta') || ALL_PORTALS[0];
  }
  if (id === 'lenteradiy') {
    return ALL_PORTALS.find(p => p.id === 'lenterajogja') || ALL_PORTALS[0];
  }
  if (id === 'lenterapapuabarat') {
    return ALL_PORTALS.find(p => p.id === 'lenterapapua') || ALL_PORTALS[0];
  }
  return ALL_PORTALS.find(p => p.id === id) || ALL_PORTALS[0];
};

export const detectPortal = (hostname: string, path: string = '') => {
  const lowerHost = hostname.toLowerCase();
  
  // 1. Check path first
  if (path) {
    const pathParts = path.split('/');
    if (pathParts.length > 1 && pathParts[1]) {
      const rawPath = pathParts[1].toLowerCase();
      const normalizedPath = rawPath.replace(/-/g, '');
      
      if (
        rawPath === 'lentera' ||
        rawPath === 'lenteraindonesia' ||
        rawPath === 'lenterabangsa'
      ) {
        return ALL_PORTALS.find(p => p.id === 'lenterabangsa') || null;
      }
      if (rawPath === 'lenteradkijakarta' || rawPath === 'lenteradki') {
        return ALL_PORTALS.find(p => p.id === 'lenterajakarta') || null;
      }
      if (rawPath === 'lenteradiy') {
        return ALL_PORTALS.find(p => p.id === 'lenterajogja') || null;
      }
      if (rawPath === 'lenterapapuabarat') {
        return ALL_PORTALS.find(p => p.id === 'lenterapapua') || null;
      }
      
      const foundInPath = ALL_PORTALS.find(
        p => (p.id === rawPath || p.id === normalizedPath) && p.id !== 'gnext'
      );
      if (foundInPath) return foundInPath;
    }
  }

  // 2. Check hostname subdomains
  if (
    lowerHost.startsWith('lenterabangsa.') ||
    lowerHost.startsWith('lenteraindonesia.') ||
    lowerHost.startsWith('lentera-bangsa.') ||
    lowerHost.startsWith('lentera-indonesia.')
  ) {
    return ALL_PORTALS.find(p => p.id === 'lenterabangsa') || null;
  }
  if (lowerHost.startsWith('lenteradkijakarta.') || lowerHost.startsWith('lenteradki.')) {
    return ALL_PORTALS.find(p => p.id === 'lenterajakarta') || null;
  }
  if (lowerHost.startsWith('lenteradiy.')) {
    return ALL_PORTALS.find(p => p.id === 'lenterajogja') || null;
  }
  if (lowerHost.startsWith('lenterapapuabarat.')) {
    return ALL_PORTALS.find(p => p.id === 'lenterapapua') || null;
  }

  for (const portal of ALL_PORTALS) {
    if (portal.id === 'gnext') continue;
    const hyphenatedId = portal.id.replace(/^lentera/, 'lentera-');
    if (
      lowerHost.startsWith(`${portal.id}.`) ||
      lowerHost.startsWith(`${hyphenatedId}.`)
    ) {
      return portal;
    }
  }

  if (lowerHost.startsWith('news.') || (path && path.startsWith('/news'))) {
    return ALL_PORTALS.find(p => p.id === 'gnext') || null;
  }

  // Default for main domain (gnextindonesia.site / www.gnextindonesia.site / app)
  return ALL_PORTALS.find(p => p.id === 'gnext') || ALL_PORTALS[0];
};
