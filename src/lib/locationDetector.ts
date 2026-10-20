/**
 * Smart Location & City Detector for News Articles
 * Extracts the exact city or region from article content/title while correctly distinguishing
 * between central editorial wire datelines (e.g. Jakarta news desk) and genuine regional event locations.
 */

const SPECIFIC_JAKARTA_TOKENS = [
  'jakarta pusat', 'jakarta selatan', 'jakarta barat', 'jakarta timur', 'jakarta utara',
  'bundaran hi', 'monumen selamat datang', 'monas', 'balai kota dki', 'dki jakarta', 'pemprov dki', 
  'polda metro jaya', 'senayan', 'gbk', 'gelora bung karno', 'kemayoran', 'ancol', 'ragunan',
  'kawasan bundaran'
];

const INDONESIA_CITIES_AND_REGIONS: string[] = [
  // DKI Jakarta (specific regencies/cities first)
  'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
  
  // Bodetabek & Banten
  'Tangerang Selatan', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Serang', 'Cilegon', 'Lebak', 'Pandeglang',
  
  // Jawa Timur
  'Surabaya', 'Malang', 'Banyuwangi', 'Lumajang', 'Jember', 'Sidoarjo', 'Gresik', 'Pasuruan', 
  'Probolinggo', 'Kediri', 'Blitar', 'Madiun', 'Batu', 'Tuban', 'Lamongan', 'Bojonegoro', 
  'Ponorogo', 'Pacitan', 'Situbondo', 'Bondowoso', 'Mojokerto', 'Magetan', 'Ngawi', 'Nganjuk', 
  'Trenggalek', 'Tulungagung', 'Sumenep', 'Pamekasan', 'Sampang', 'Bangkalan', 'Madura',
  
  // Jawa Barat
  'Bandung', 'Cirebon', 'Sukabumi', 'Tasikmalaya', 'Cimahi', 'Garut', 'Subang', 'Karawang', 
  'Purwakarta', 'Indramayu', 'Majalengka', 'Kuningan', 'Ciamis', 'Banjar', 'Pangandaran',
  
  // Jawa Tengah & DIY
  'Semarang', 'Solo', 'Surakarta', 'Yogyakarta', 'Jogja', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul',
  'Magelang', 'Salatiga', 'Tegal', 'Pekalongan', 'Kudus', 'Cilacap', 'Purwokerto', 'Banyumas', 
  'Klaten', 'Boyolali', 'Sukoharjo', 'Wonogiri', 'Karanganyar', 'Sragen', 'Grobogan', 'Blora', 
  'Rembang', 'Pati', 'Jepara', 'Demak', 'Temanggung', 'Wonosobo', 'Purworejo', 'Kebumen', 
  'Banjarnegara', 'Purbalingga', 'Batang', 'Kendal', 'Pemalang', 'Brebes',
  
  // Bali & Nusa Tenggara
  'Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Buleleng', 'Karangasem', 'Klungkung', 'Bangli', 'Jembrana', 'Bali',
  'Lombok', 'Mandalika', 'Mataram', 'Sumbawa', 'Bima', 'Kupang', 'Labuan Bajo', 'Flores', 'Sumba',
  
  // Sumatera
  'Banda Aceh', 'Aceh', 'Medan', 'Deli Serdang', 'Binjai', 'Pematangsiantar', 'Padang', 'Bukittinggi', 
  'Pekanbaru', 'Dumai', 'Riau', 'Batam', 'Tanjungpinang', 'Jambi', 'Palembang', 'Bengkulu', 
  'Bandar Lampung', 'Lampung', 'Pangkalpinang', 'Bangka', 'Belitung',
  
  // Kalimantan & IKN
  'IKN', 'Balikpapan', 'Samarinda', 'Banjarmasin', 'Banjarbaru', 'Pontianak', 'Singkawang', 
  'Palangkaraya', 'Tarakan', 'Kutai Kartanegara', 'Penajam Paser Utara', 'Kalimantan',
  
  // Sulawesi
  'Makassar', 'Gowa', 'Maros', 'Manado', 'Bitung', 'Tomohon', 'Palu', 'Kendari', 'Gorontalo', 'Mamuju',
  
  // Maluku & Papua
  'Ambon', 'Ternate', 'Jayapura', 'Sorong', 'Merauke', 'Timika', 'Manokwari'
];

/**
 * Detects the most accurate city or region name from an article's content and title.
 * 
 * @param content The article body text or HTML
 * @param title Optional article title
 * @param fallback Default fallback if no specific city is detected (default: 'Nasional')
 * @returns Detected city or region name (e.g. 'Jakarta Pusat', 'Lumajang', 'Mandalika', 'Nasional')
 */
export function detectArticleLocation(content?: string, title?: string, fallback: string = 'Nasional'): string {
  if (!content && !title) return fallback;

  let body = (content || '').replace(/<[^>]+>/g, ' ').trim();
  const rawTitle = (title || '').trim();

  // 1. Check for wire dateline lead at the start: e.g. "LUMAJANG, GNN —" or "JAKARTA, GNN —"
  let leadCity: string | null = null;
  const leadMatch = body.match(/^([A-Za-z\s]{3,25}),\s*(?:GNN|ANTARA|KOMPAS|[A-Za-z]+)\s*[-—–]\s*/i);
  if (leadMatch) {
    leadCity = leadMatch[1].trim();
    body = body.substring(leadMatch[0].length).trim();
  }

  // 2. Combine title and first 400 characters of clean body
  const sample = `${rawTitle} ${body.substring(0, 400)}`;

  // 3. If leadCity is a specific regional bureau OUTSIDE of Jakarta (e.g. LUMAJANG, MANDALIKA, MANADO, PONTIANAK, MOJOKERTO)
  if (leadCity && !['JAKARTA', 'INDONESIA', 'NASIONAL', 'UPDATE', 'TERKINI'].includes(leadCity.toUpperCase())) {
    const matchedCity = INDONESIA_CITIES_AND_REGIONS.find(c => c.toLowerCase() === leadCity?.toLowerCase());
    if (matchedCity) return matchedCity;
    return leadCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // 4. Scan sample for specific regional cities (excluding generic "Jakarta")
  for (const city of INDONESIA_CITIES_AND_REGIONS) {
    const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(sample)) {
      return city;
    }
  }

  // 5. Pattern like "Kota [Nama]" or "Kabupaten [Nama]"
  const adminMatch = sample.match(/\b(?:Kota|Kabupaten|Kab\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
  if (adminMatch && adminMatch[1]) {
    const adminCity = adminMatch[1].trim();
    if (adminCity.length > 2 && adminCity.length < 25) {
      return adminCity;
    }
  }

  // 6. Handle Jakarta: Only tag as Jakarta if the event/topic is genuinely in Jakarta
  // (e.g. Bundaran HI, Monas, Jakarta Pusat, DKI Jakarta), not merely because it was dispatched by the central wire desk
  const isGenuineJakartaEvent = SPECIFIC_JAKARTA_TOKENS.some(token => {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(sample);
  });

  if (isGenuineJakartaEvent) {
    const specificJakarta = ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'].find(j => {
      return new RegExp(`\\b${j}\\b`, 'i').test(sample);
    });
    return specificJakarta || 'Jakarta';
  }

  // 7. General national/policy/feature/historical news -> fallback to 'Nasional'
  return fallback;
}
