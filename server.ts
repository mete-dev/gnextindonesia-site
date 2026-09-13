import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { makeSafeSupabaseClient } from "./src/lib/supabase-safe";
import dotenv from "dotenv";

let __filename = '';
let __dirname = '';

try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  __dirname = process.cwd();
  __filename = path.join(__dirname, 'server.js');
}

dotenv.config();

const app = express();
const PORT = 3000;

// Enable HTTP Gzip/Brotli compression for web requests
app.use(compression({
  threshold: 512,
  level: 6
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global Cache-Control middleware to leverage Cached Egress and reduce main Egress usage
app.use((req, res, next) => {
  if (req.method === 'GET') {
    const p = req.path.toLowerCase();
    if (p.startsWith('/api/images/') || p.startsWith('/api/article-image/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400');
    } else if (p.startsWith('/sitemap') || p === '/robots.txt') {
      res.setHeader('Cache-Control', 'public, max-age=14400, s-maxage=86400, stale-while-revalidate=3600');
    } else if (p.startsWith('/api/') && !p.includes('/track.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600');
    }
  }
  next();
});

// Set up Supabase client
const DEFAULT_SUPABASE_URL = 'https://bqzcgwpyjanuvaqivpeo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_PJY02yK96tsrbpINNdAQoA_w_7CMN8Q';

const rawUrl = process.env.VITE_SUPABASE_URL;
const rawKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && !rawUrl.includes('wdaqfxmgonkbstqxhcns') && !rawUrl.includes('placeholder'))
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = (rawKey && !rawKey.includes('u1nCrJDLp5yUbbNTR89WGA') && !rawKey.includes('placeholder'))
  ? rawKey
  : DEFAULT_SUPABASE_ANON_KEY;
let supabase: any;
try {
  const rawSupabase = createClient(supabaseUrl, supabaseAnonKey);
  supabase = makeSafeSupabaseClient(rawSupabase);
} catch (e: any) {
  console.error("Gagal melakukan inisialisasi Supabase client di tingkat atas:", e);
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => ({ 
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
        single: () => Promise.resolve({ data: null, error: null }) 
      }),
    })
  };
}

const BASE_URL = 'https://www.gnextindonesia.site';

const staticPages = [
  '/',
  '/about',
  '/work',
  '/platform',
  '/news',
  '/privacy',
  '/terms'
];

// Helper to slugify
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
};

// Sitemap helpers
const formatDateForSitemap = (dateStr?: string) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  try {
    const parts = dateStr.trim().split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const monthMap: Record<string, string> = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', Mei: '05', May: '05',
        Jun: '06', Jul: '07', Agu: '08', Aug: '08', Sep: '09', Okt: '10', Oct: '10', Nov: '11', Des: '12', Dec: '12'
      };
      const month = monthMap[parts[1]] || '01';
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // fallback
  }
  return new Date().toISOString().split('T')[0];
};

const getCategorySlug = (categoryId: string, categories: any[] = []) => {
  const found = categories.find((c: any) => c.id === categoryId);
  if (found) return slugify(found.name);
  if (typeof categoryId === 'string') {
    if (categoryId === 'cat-sosial') return 'sosial';
    if (categoryId === 'cat-pendidikan') return 'pendidikan';
    if (categoryId === 'cat-keuangan') return 'keuangan';
    if (categoryId === 'cat-lingkungan') return 'lingkungan';
    if (categoryId.includes('wisata')) return 'wisata-budaya';
    if (categoryId.includes('ekonomi')) return 'ekonomi-bisnis';
    if (categoryId.includes('kreatif') || categoryId.includes('pemuda')) return 'kreatif-media';
    if (categoryId === 'cat-teknologi') return 'teknologi';
    if (categoryId.includes('Marketing')) return 'marketing-strategy';
    if (categoryId.includes('Content')) return 'content-creation';
    if (categoryId.includes('Platform')) return 'platform-production';
    if (categoryId.trim()) return slugify(categoryId);
  }
  return 'berita';
};

const LENTERA_NETWORKS_LIST = [
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

const ALL_PORTALS_CONFIG = [
  { id: 'gnext', name: 'GNEXT NEWS', hostPrefix: 'news' },
  { id: 'yoikijatim', name: 'YO IKI JATIM', hostPrefix: 'yoikijatim' },
  { id: 'lumajangtalks', name: 'LUMAJANG TALKS', hostPrefix: 'lumajangtalks' },
  { id: 'gummah', name: 'G-UMMAH', hostPrefix: 'gummah' },
  ...LENTERA_NETWORKS_LIST.map(l => ({ id: l.id, name: l.name, hostPrefix: l.id }))
];

const getPublicationName = (portalId: string) => {
  const found = ALL_PORTALS_CONFIG.find(p => p.id === portalId);
  return found ? found.name : 'GNEXT NEWS';
};

const getArticlePortal = (article: any): string => {
  const p = (article.portal || '').toLowerCase();
  if (p === 'gummah' || p === 'ummah') return 'gummah';
  if (p === 'yoikijatim') return 'yoikijatim';
  if (p === 'lumajangtalks' || p === 'lumajangtaks') return 'lumajangtalks';

  const idStr = article.id?.toString().toLowerCase() || '';
  if (idStr.startsWith('yoiki-')) return 'yoikijatim';
  if (idStr.startsWith('lumajang-') || idStr.startsWith('lumajangtaks-')) return 'lumajangtalks';
  if (idStr.startsWith('gummah-') || idStr.startsWith('ummah-')) return 'gummah';
  if (idStr.startsWith('lentera-') || idStr.startsWith('lenterabangsa-')) return 'lenterabangsa';

  for (const l of LENTERA_NETWORKS_LIST) {
    if (idStr.startsWith(`${l.id}-`)) return l.id;
  }

  const subCat = (article.sub_category || article.subCategory || '').toLowerCase();
  if (subCat.includes('ummah') || subCat.includes('islam') || subCat.includes('kalam')) return 'gummah';

  const loc = (article.news_location || '').toLowerCase();
  if (loc.includes('lumajang') || loc.includes('ranui') || loc.includes('pasrujambe') || loc.includes('senduro') || loc.includes('pronojiwo')) {
    return 'lumajangtalks';
  }
  if (loc.includes('surabaya') || loc.includes('malang') || loc.includes('banyuwangi') || loc.includes('jawa timur') || loc.includes('jatim')) {
    return 'yoikijatim';
  }
  if (loc.includes('jakarta') || loc.includes('dki')) return 'lenterajakarta';
  if (loc.includes('jogja') || loc.includes('yogyakarta') || loc.includes('diy')) return 'lenterajogja';
  if (loc.includes('papua')) return 'lenterapapua';
  if (loc.includes('medan') || loc.includes('sumut')) return 'lenterasumut';
  if (loc.includes('makassar') || loc.includes('sulsel')) return 'lenterasulsel';
  if (loc.includes('bali')) return 'lenterabali';
  if (loc.includes('bandung') || loc.includes('jabar')) return 'lenterajabar';
  if (loc.includes('semarang') || loc.includes('jateng')) return 'lenterajateng';

  return 'gnext';
};

const generateSitemapIndexXml = (baseUrl = 'https://www.gnextindonesia.site') => {
  const todayStr = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Main corporate site sitemap
  xml += `  <sitemap>\n`;
  xml += `    <loc>${baseUrl}/sitemap-main.xml</loc>\n`;
  xml += `    <lastmod>${todayStr}</lastmod>\n`;
  xml += `  </sitemap>\n`;

  // Regional portals sitemaps
  for (const portal of ALL_PORTALS_CONFIG) {
    let loc = `${baseUrl}/sitemap-${portal.id}.xml`;
    if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1') && !baseUrl.includes('run.app')) {
      loc = `https://${portal.hostPrefix}.gnextindonesia.site/sitemap-${portal.id}.xml`;
    }
    xml += `  <sitemap>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${todayStr}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>`;
  return xml;
};

const generateSitemapXml = async (reqHost = '', reqPath = '') => {
  const lowerHost = reqHost.toLowerCase();
  const lowerPath = reqPath.toLowerCase();

  // Determine requested portal or sitemap type
  let requestedPortal: string | null = null;
  if (lowerPath.includes('/sitemap-news.xml') || lowerHost.startsWith('news.')) {
    requestedPortal = 'gnext';
  } else if (lowerPath.includes('/sitemap-yoikijatim.xml') || lowerHost.startsWith('yoikijatim.')) {
    requestedPortal = 'yoikijatim';
  } else if (lowerPath.includes('/sitemap-lumajangtalks.xml') || lowerPath.includes('/sitemap-lumajangtaks.xml') || lowerHost.startsWith('lumajangtalks.') || lowerHost.startsWith('lumajangtaks.')) {
    requestedPortal = 'lumajangtalks';
  } else if (lowerPath.includes('/sitemap-gummah.xml') || lowerPath.includes('/sitemap-ummah.xml') || lowerHost.startsWith('gummah.') || lowerHost.startsWith('ummah.')) {
    requestedPortal = 'gummah';
  } else {
    // Check if path or host matches any lentera network
    for (const portal of ALL_PORTALS_CONFIG) {
      const hyphenated = portal.id.replace(/^lentera/, 'lentera-');
      if (
        lowerPath.includes(`/sitemap-${portal.id}.xml`) ||
        lowerPath.includes(`/sitemap-${hyphenated}.xml`) ||
        lowerHost.startsWith(`${portal.id}.`) ||
        lowerHost.startsWith(`${hyphenated}.`)
      ) {
        requestedPortal = portal.id;
        break;
      }
    }
  }

  const isMain = lowerPath.includes('/sitemap-main.xml');

  // Fetch published articles and categories from Supabase with timeout
  let dbArticles: any[] = [];
  let dbCategories: any[] = [];
  try {
    const fetchPromise = Promise.all([
      supabase.from('articles').select('*').order('date', { ascending: false }),
      supabase.from('categories').select('*')
    ]);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Sitemap DB Timeout')), 3000));
    const [artRes, catRes] = await Promise.race([fetchPromise, timeoutPromise]) as any;
    if (artRes && artRes.data) dbArticles = artRes.data.filter((a: any) => !a.status || a.status === 'published');
    if (catRes && catRes.data) dbCategories = catRes.data;
  } catch (err) {
    console.error('Sitemap DB fetch error or timeout:', err);
  }

  const allArticles: any[] = [...dbArticles];
  const existingSlugs = new Set(allArticles.map(a => slugify(a.title)));

  const fallbackItems = [
    // Gnext News fallbacks
    { title: 'Strategi Pemasaran Digital di Tahun 2024', category: 'Marketing Strategy', date: '2023-10-12', portal: 'gnext', image: 'https://images.unsplash.com/photo-1432828684207-6b4510008518' },
    { title: 'Membangun Komunitas Kreatif Melalui Konten', category: 'Content Creation', date: '2023-09-28', portal: 'gnext', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f' },
    { title: 'Pentingnya Platform Digital untuk Brand Lokal', category: 'Platform Production', date: '2023-09-15', portal: 'gnext', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f' },
    { title: 'Tren Desain Visual Terkini dalam Iklan Digital', category: 'Content Creation', date: '2023-09-02', portal: 'gnext', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5' },

    // Yo Iki Jatim fallbacks
    { title: 'Festival Wisata Bromo Tengger Semeru 2026 Resmi Dibuka: Targetkan 2 Juta Wisatawan Jatim', category: 'Wisata & Budaya', date: '2026-07-31', portal: 'yoikijatim', image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272' },
    { title: 'Surabaya Kembangkan Sistem Bus Listrik Otonom di Koridor Utama Kota', category: 'Ekonomi & Bisnis', date: '2026-07-30', portal: 'yoikijatim', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0' },
    { title: 'Malang Creative Center Jadi Hub Inovasi Gim & Animasi Terbesar di Indonesia Timur', category: 'Kreatif & Media', date: '2026-07-29', portal: 'yoikijatim', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c' },

    // Lumajang Talks fallbacks
    { title: 'Festival Pisang Kirana Lumajang 2026 Siap Digelar: Tampilkan Kuliner & Olahan Kreatif Lokal', category: 'Ekonomi & Bisnis', date: '2026-07-31', portal: 'lumajangtalks', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919' },
    { title: 'Wisata Danau Ranu Pani & Ranu Regulo Semeru Alami Peningkatan Wisatawan Mancanegara', category: 'Wisata & Budaya', date: '2026-07-30', portal: 'lumajangtalks', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd' },

    // Lentera Networks fallbacks
    { title: 'Pemerintah Dorong Akselerasi Digitalisasi UMKM Daerah di 38 Provinsi', category: 'Ekonomi & Bisnis', date: '2026-08-01', portal: 'lenterabangsa', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
    { title: 'Pemprov DKI Jakarta Uji Coba Koridor Baru TransJakarta Ramah Lingkungan', category: 'Politik & Pemerintahan', date: '2026-08-02', portal: 'lenterajakarta', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0' },
    { title: 'Festival Kebudayaan Yogyakarta 2026 Tampilkan Mahakarya Seni Karawitan & Tari', category: 'Wisata & Budaya', date: '2026-08-03', portal: 'lenterajogja', image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272' },
    { title: 'Pengembangan Sentra Kopi Organik Wamena Raih Sertifikasi Ekspor Internasional', category: 'Ekonomi & Bisnis', date: '2026-08-04', portal: 'lenterapapua', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' }
  ];

  for (const fb of fallbackItems) {
    const slug = slugify(fb.title);
    if (!existingSlugs.has(slug)) {
      allArticles.push(fb);
      existingSlugs.add(slug);
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  const addedUrls = new Set<string>();
  let counts = { gnext: 0, yoikijatim: 0, lumajangtalks: 0, lentera: 0, categories: 0, total: 0 };

  const addUrlEntry = (url: string, lastmod: string, changefreq: string, priority: string, newsInfo?: { title: string; publicationName: string; pubDate: string }, imageUrl?: string) => {
    if (addedUrls.has(url)) return;
    addedUrls.add(url);
    counts.total++;

    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    if (newsInfo) {
      const cleanTitle = newsInfo.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>${newsInfo.publicationName}</news:name>\n`;
      xml += `        <news:language>id</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${newsInfo.pubDate}</news:publication_date>\n`;
      xml += `      <news:title>${cleanTitle}</news:title>\n`;
      xml += `    </news:news>\n`;
    }

    if (imageUrl) {
      const cleanImg = imageUrl.replace(/&/g, '&amp;');
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${cleanImg}</image:loc>\n`;
      xml += `    </image:image>\n`;
    }

    xml += `  </url>\n`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getPortalBaseUrl = (pId: string) => {
    if (reqHost && (reqHost.includes('localhost') || reqHost.includes('127.0.0.1') || reqHost.includes('run.app'))) {
      const protocol = reqHost.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${reqHost}`;
    }
    const config = ALL_PORTALS_CONFIG.find(p => p.id === pId);
    const prefix = config ? config.hostPrefix : pId;
    return `https://${prefix}.gnextindonesia.site`;
  };

  const defaultCategoriesList = [
    'ekonomi-bisnis',
    'wisata-budaya',
    'kreatif-media',
    'politik',
    'sosial',
    'pendidikan',
    'teknologi',
    'keuangan',
    'lingkungan',
    'marketing-strategy',
    'content-creation',
    'platform-production'
  ];

  const portalCategoriesMap = new Map<string, Set<string>>();

  const getPortalCatSet = (pId: string) => {
    if (!portalCategoriesMap.has(pId)) {
      const set = new Set<string>(defaultCategoriesList);
      dbCategories.forEach((c: any) => {
        if (c.slug) set.add(c.slug);
        if (c.name) set.add(slugify(c.name));
      });
      portalCategoriesMap.set(pId, set);
    }
    return portalCategoriesMap.get(pId)!;
  };

  if (isMain) {
    // Corporate site sitemap only
    const mainBase = reqHost && (reqHost.includes('localhost') || reqHost.includes('127.0.0.1') || reqHost.includes('run.app'))
      ? `http://${reqHost}`
      : 'https://www.gnextindonesia.site';

    for (const page of ['/', '/about', '/work', '/platform', '/privacy', '/terms']) {
      addUrlEntry(`${mainBase}${page}`, todayStr, page === '/' ? 'daily' : 'weekly', page === '/' ? '1.0' : '0.8');
    }
  } else if (requestedPortal) {
    // Single regional portal sitemap requested
    const baseUrl = getPortalBaseUrl(requestedPortal);
    const pubName = getPublicationName(requestedPortal);

    // Root and Static pages
    addUrlEntry(`${baseUrl}/`, todayStr, 'daily', '1.0');
    addUrlEntry(`${baseUrl}/privacy`, todayStr, 'monthly', '0.5');
    addUrlEntry(`${baseUrl}/terms`, todayStr, 'monthly', '0.5');

    // News Categories for this portal
    const catSet = getPortalCatSet(requestedPortal);
    catSet.forEach(catSlug => {
      counts.categories++;
      addUrlEntry(`${baseUrl}/${catSlug}`, todayStr, 'daily', '0.9');
    });

    // News Articles for this portal
    for (const art of allArticles) {
      const portal = getArticlePortal(art);
      if (portal === requestedPortal) {
        if (portal === 'gnext') counts.gnext++;
        else if (portal === 'yoikijatim') counts.yoikijatim++;
        else if (portal === 'lumajangtalks') counts.lumajangtalks++;
        else counts.lentera++;

        const catSlug = getCategorySlug(art.category_id || art.categoryId || art.category, dbCategories);
        const artSlug = slugify(art.title);
        const formattedDate = formatDateForSitemap(art.date || art.created_at);

        addUrlEntry(
          `${baseUrl}/${catSlug}/${artSlug}`,
          formattedDate,
          'weekly',
          '0.8',
          { title: art.title, publicationName: pubName, pubDate: formattedDate },
          art.cover_image || art.image
        );
      }
    }
  } else {
    // Combined / Master Sitemap (All portals & subdomains)
    const isLocalOrPreview = reqHost.includes('localhost') || reqHost.includes('127.0.0.1') || reqHost.includes('run.app');
    const mainBase = isLocalOrPreview ? `http://${reqHost}` : 'https://www.gnextindonesia.site';

    // Corporate main site pages
    for (const page of ['/', '/about', '/work', '/platform', '/privacy', '/terms']) {
      addUrlEntry(`${mainBase}${page}`, todayStr, page === '/' ? 'daily' : 'weekly', page === '/' ? '1.0' : '0.8');
    }

    // Process all portals
    for (const portalConfig of ALL_PORTALS_CONFIG) {
      const pId = portalConfig.id;
      const baseUrl = isLocalOrPreview ? mainBase : `https://${portalConfig.hostPrefix}.gnextindonesia.site`;
      const pubName = portalConfig.name;

      addUrlEntry(`${baseUrl}/`, todayStr, 'daily', '1.0');
      addUrlEntry(`${baseUrl}/privacy`, todayStr, 'monthly', '0.5');
      addUrlEntry(`${baseUrl}/terms`, todayStr, 'monthly', '0.5');

      // Categories
      const catSet = getPortalCatSet(pId);
      catSet.forEach(catSlug => {
        counts.categories++;
        addUrlEntry(`${baseUrl}/${catSlug}`, todayStr, 'daily', '0.9');
      });

      // Articles
      for (const art of allArticles) {
        const portal = getArticlePortal(art);
        if (portal === pId) {
          if (portal === 'gnext') counts.gnext++;
          else if (portal === 'yoikijatim') counts.yoikijatim++;
          else if (portal === 'lumajangtalks') counts.lumajangtalks++;
          else counts.lentera++;

          const catSlug = getCategorySlug(art.category_id || art.categoryId || art.category, dbCategories);
          const artSlug = slugify(art.title);
          const formattedDate = formatDateForSitemap(art.date || art.created_at);

          addUrlEntry(
            `${baseUrl}/${catSlug}/${artSlug}`,
            formattedDate,
            'weekly',
            '0.8',
            { title: art.title, publicationName: pubName, pubDate: formattedDate },
            art.cover_image || art.image
          );
        }
      }
    }
  }

  xml += `</urlset>`;
  return { xml, counts };
};

// API routes FIRST
app.get('/sitemap-index.xml', (req, res) => {
  const host = (req.headers.host as string) || 'www.gnextindonesia.site';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const baseUrl = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('run.app')
    ? `${protocol}://${host}`
    : 'https://www.gnextindonesia.site';

  const xml = generateSitemapIndexXml(baseUrl);
  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(xml);
});

app.get(['/sitemap.xml', '/sitemap-main.xml', '/sitemap-all.xml', '/sitemap-:portal.xml'], async (req, res) => {
  try {
    const host = (req.headers.host as string) || '';
    const { xml } = await generateSitemapXml(host, req.path);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(xml);
  } catch (error: any) {
    console.error('Failed to generate dynamic sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
  }
});

app.get('/robots.txt', (req, res) => {
  const host = (req.headers.host as string) || 'www.gnextindonesia.site';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const baseUrl = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('run.app')
    ? `${protocol}://${host}`
    : `https://${host}`;

  const robots = `User-agent: *
Allow: /
Allow: /api/article-image/
Allow: /api/images/
Disallow: /studio/
Disallow: /loginstudio
Disallow: /api/upload-image
Disallow: /api/update-sitemap
Disallow: /api/indexing/
Disallow: /api/track.gif

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml
`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(robots);
});

app.post("/api/upload-image", async (req, res) => {
  try {
    const { filename, data } = req.body;
    
    if (!filename || !data) {
      return res.status(400).json({ success: false, error: 'Filename and data are required' });
    }

    const { data: insertedData, error } = await supabase
      .from('uploaded_images')
      .insert([{ filename, data }])
      .select('id')
      .single();

    if (error) throw error;

    res.json({ success: true, url: `/api/images/${insertedData.id}` });
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/images/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('uploaded_images')
      .select('data')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).send('Not found');
    }

    const base64Data = data.data.replace(/^data:image\/\w+;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/webp',
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
  } catch (error: any) {
    res.status(500).send('Error');
  }
});

// Prayer times proxy endpoints (EQuran.id & Kemenag / jadwalsholat.org data source)
app.get("/api/v2/shalat/provinsi", async (req, res) => {
  try {
    const response = await fetch("https://equran.id/api/v2/shalat/provinsi");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
});

app.get("/api/v2/shalat/kabkota", async (req, res) => {
  try {
    const response = await fetch("https://equran.id/api/v2/shalat/kabkota");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch kabkota" });
  }
});

app.post("/api/v2/shalat/kabkota", async (req, res) => {
  try {
    const { provinsi } = req.body || {};
    const equranRes = await fetch("https://equran.id/api/v2/shalat/kabkota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provinsi })
    });
    const equranJson = await equranRes.json();
    if (equranJson && equranJson.data) {
      return res.json(equranJson);
    }

    const response = await fetch("https://api.myquran.com/v1/sholat/kota/semua");
    const cities = await response.json();
    
    let kabkotaList = Array.isArray(cities) ? cities.map((c: any) => c.lokasi) : [];
    res.json({
      code: 200,
      message: `Daftar kabupaten/kota${provinsi ? ` di ${provinsi}` : ''}`,
      data: kabkotaList.length > 0 ? kabkotaList : ["Kota Jakarta", "Kota Surabaya", "Kota Bandung", "Kab. Bandung", "Kota Bogor", "Kab. Bogor"]
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: "Failed to fetch kabkota", data: [] });
  }
});

app.post("/api/v2/shalat", async (req, res) => {
  try {
    const body = req.body || {};
    const equranRes = await fetch("https://equran.id/api/v2/shalat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const equranJson = await equranRes.json();
    if (equranJson && equranJson.data) {
      return res.json(equranJson);
    }

    const { provinsi = "Jawa Barat", kabkota = "Kota Bogor", bulan = new Date().getMonth() + 1, tahun = new Date().getFullYear() } = body;
    
    const citiesRes = await fetch("https://api.myquran.com/v1/sholat/kota/semua");
    const cities = await citiesRes.json();
    
    let cityId = "1301";
    if (Array.isArray(cities)) {
      const found = cities.find((c: any) => c.lokasi && c.lokasi.toUpperCase().includes(kabkota.toUpperCase().replace('KOTA ', '').replace('KAB. ', '')));
      if (found) {
        cityId = found.id;
      }
    }

    const monthNum = Number(bulan) || (new Date().getMonth() + 1);
    const yearNum = Number(tahun) || new Date().getFullYear();
    const mStr = String(monthNum).padStart(2, '0');

    const scheduleRes = await fetch(`https://api.myquran.com/v1/sholat/jadwal/${cityId}/${yearNum}/${mStr}`);
    const scheduleJson = await scheduleRes.json();

    const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    let jadwalData = [];
    if (scheduleJson && scheduleJson.status && scheduleJson.data && scheduleJson.data.jadwal) {
      jadwalData = scheduleJson.data.jadwal.map((j: any, index: number) => ({
        tanggal: index + 1,
        tanggal_lengkap: j.date || `${yearNum}-${mStr}-${String(index + 1).padStart(2, '0')}`,
        hari: j.day || "Senin",
        imsak: j.imsak,
        subuh: j.subuh,
        terbit: j.terbit,
        dhuha: j.dhuha || "06:15",
        dzuhur: j.dzuhur,
        ashar: j.ashar,
        maghrib: j.maghrib,
        isya: j.isya
      }));
    }

    res.json({
      code: 200,
      message: "Jadwal shalat berhasil diambil",
      data: {
        provinsi,
        kabkota,
        bulan: monthNum,
        tahun: yearNum,
        bulan_nama: monthNames[monthNum] || "Januari",
        jadwal: jadwalData
      }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Gagal mengambil jadwal shalat",
      data: null
    });
  }
});

app.get("/api/prayer/cities", async (req, res) => {
  try {
    // Try EQuran.id first, fallback to MyQuran
    const equranRes = await fetch("https://equran.id/api/v2/shalat/kabkota");
    const equranData = await equranRes.json();
    if (equranData && (equranData.data || Array.isArray(equranData))) {
      return res.json(equranData);
    }
    const response = await fetch("https://api.myquran.com/v1/sholat/kota/semua");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    try {
      const response = await fetch("https://api.myquran.com/v1/sholat/kota/semua");
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch cities" });
    }
  }
});

app.get("/api/prayer/schedule/:cityId/:year/:month/:day", async (req, res) => {
  try {
    const { cityId, year, month, day } = req.params;
    const response = await fetch(`https://api.myquran.com/v1/sholat/jadwal/${cityId}/${year}/${month}/${day}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prayer schedule" });
  }
});

app.get("/api/article-image/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slugify(decodeURIComponent(slug));
    
    // Fetch all articles from Supabase
    const { data: articles } = await supabase.from('articles').select('*');
    
    let article = null;
    if (articles && articles.length > 0) {
      article = articles.find((a: any) => {
        if (!a.title) return false;
        const aSlug = slugify(a.title);
        return aSlug === slug || aSlug === cleanSlug || a.id?.toString() === slug;
      });

      if (article) {
        const imgData = article.cover_image || article.image;
        if (imgData && imgData.startsWith('data:image')) {
          const match = imgData.match(/^data:image\/(\w+);base64,/);
          const ext = match ? match[1] : 'jpeg';
          const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
          const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
          const imgBuffer = Buffer.from(base64Data, 'base64');
          
          res.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': imgBuffer.length,
            'Cache-Control': 'public, max-age=86400'
          });
          return res.end(imgBuffer);
        } else if (imgData) {
          return res.redirect(302, imgData);
        }
      }
    }

    // Fallback to static/preset items if not found in DB
    const staticItems = [
      { title: 'Festival Wisata Bromo Tengger Semeru 2026 Resmi Dibuka: Targetkan 2 Juta Wisatawan Jatim', image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272' },
      { title: 'Surabaya Kembangkan Sistem Bus Listrik Otonom di Koridor Utama Kota', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0' },
      { title: 'Malang Creative Center Jadi Hub Inovasi Gim & Animasi Terbesar di Indonesia Timur', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c' },
      { title: 'Pekan Batik Gandrung Banyuwangi Hadirkan 500 Pengrajin Lokal Terbaik', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
      { title: 'Jalan Tol Probolinggo - Banyuwangi Siap Dioperasikan Penuh Akhir Tahun Ini', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2' },
      { title: 'Festival Pisang Kirana Lumajang 2026 Siap Digelar: Tampilkan Kuliner & Olahan Kreatif Lokal', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919' },
      { title: 'Wisata Danau Ranu Pani & Ranu Regulo Semeru Alami Peningkatan Wisatawan Mancanegara', image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd' },
      { title: 'Kopi Pasrujambe Lumajang Raih Penghargaan Kopi Organik Terbaik Tingkat Nasional', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93' },
      { title: 'Pemuda Lumajang Inovasikan Pengolahan Limbah Kayu Jadi Kerajinan Mebel Kelas Dunia', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
      { title: 'Air Terjun Tumpak Sewu Lumajang Masuk 10 Destinasi Air Terjun Terindah di Asia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' }
    ];

    const foundFb = staticItems.find(item => slugify(item.title) === slug || slugify(item.title) === cleanSlug);
    if (foundFb && foundFb.image) {
      return res.redirect(302, foundFb.image);
    }

    res.status(404).send('Image not found');
  } catch (error: any) {
    res.status(500).send('Error loading image');
  }
});

app.post("/api/update-sitemap", async (req, res) => {
  try {
    const host = (req.headers.host as string) || '';
    const { xml, counts } = await generateSitemapXml(host, '/sitemap-all.xml');

    res.json({ 
      success: true, 
      message: 'Sitemaps are served 100% dynamically on-the-fly to ensure precise multi-subdomain and custom-domain routing.', 
      counts 
    });
  } catch (error: any) {
    console.error('Failed to update sitemap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/indexing/publish", async (req, res) => {
  try {
    const { title, portal, categoryId } = req.body;
    if (!title || !portal || !categoryId) {
      return res.status(400).json({ success: false, error: "Title, portal, and categoryId are required" });
    }

    const host = (req.headers.host as string) || '';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('run.app') ? 'https' : 'http';
    
    // Resolve dynamic sitemap database categories to find accurate category slug
    let dbCategories: any[] = [];
    try {
      const catRes = await supabase.from('categories').select('*');
      if (catRes.data) dbCategories = catRes.data;
    } catch (err) {
      console.warn("Failed to retrieve categories for indexing URL resolution:", err);
    }

    const getPortalBaseUrl = (pId: string) => {
      if (host && (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('run.app'))) {
        const p = host.includes('localhost') ? 'http' : 'https';
        return `${p}://${host}`;
      }
      const config = ALL_PORTALS_CONFIG.find(p => p.id === pId);
      const prefix = config ? config.hostPrefix : pId;
      return `https://${prefix}.gnextindonesia.site`;
    };

    const catSlug = getCategorySlug(categoryId, dbCategories);
    const artSlug = slugify(title);
    const baseUrl = getPortalBaseUrl(portal);
    const articleUrl = `${baseUrl}/${catSlug}/${artSlug}`;

    const credentialsString = process.env.GOOGLE_INDEXING_CREDENTIALS;

    if (!credentialsString) {
      console.log(`[Google Indexing API] Simulated update for: ${articleUrl} (Credentials not configured yet)`);
      return res.json({
        success: true,
        simulated: true,
        url: articleUrl,
        message: "Google Indexing API simulated successfully. To enable live indexing, please add the 'GOOGLE_INDEXING_CREDENTIALS' secret in your settings."
      });
    }

    // Lazy load the JWT client from google-auth-library as required by dependency rules
    const { JWT } = await import('google-auth-library');
    
    let keys: any;
    try {
      keys = JSON.parse(credentialsString);
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        error: `Failed to parse GOOGLE_INDEXING_CREDENTIALS: ${e.message}. Ensure it is a valid JSON service account key string.`
      });
    }

    const jwtClient = new JWT({
      email: keys.client_email,
      key: keys.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    console.log(`[Google Indexing API] Sending URL publish request to Googlebot for: ${articleUrl}`);
    const googleResponse = await jwtClient.request({
      url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
      method: 'POST',
      data: {
        url: articleUrl,
        type: 'URL_UPDATED'
      }
    });

    res.json({
      success: true,
      simulated: false,
      url: articleUrl,
      googleResponse: googleResponse.data
    });

  } catch (error: any) {
    console.error('Failed to publish to Google Indexing API:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to submit article URL to Google Indexing API' 
    });
  }
});

const cleanExcerptText = (content: string, maxLength = 160) => {
  if (!content) return '';
  const plain = content
    .replace(/!\[.*?\]\((.*?)\)/g, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~`]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLength ? plain.substring(0, maxLength) + '...' : plain;
};

const extractFirstImage = (content?: string): string | null => {
  if (!content) return null;
  const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (mdMatch && mdMatch[1]?.trim()) return mdMatch[1].trim();
  const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/i);
  if (htmlMatch && htmlMatch[1]?.trim()) return htmlMatch[1].trim();
  return null;
};

const unslugifyTitle = (slug: string): string => {
  if (!slug) return '';
  return slug
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const staticFallbackArticles = [
  { title: 'Festival Wisata Bromo Tengger Semeru 2026 Resmi Dibuka: Targetkan 2 Juta Wisatawan Jatim', content: 'Pemerintah Provinsi Jawa Timur bersama Dinas Kebudayaan dan Pariwisata resmi meluncurkan rangkaian Festival Wisata Bromo Tengger Semeru 2026.', cover_image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Surabaya Kembangkan Sistem Bus Listrik Otonom di Koridor Utama Kota', content: 'Pemerintah Kota Surabaya memperluas transportasi publik modern dengan menghadirkan armada bus listrik otonom ramah lingkungan.', cover_image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Malang Creative Center Jadi Hub Inovasi Gim & Animasi Terbesar di Indonesia Timur', content: 'Gedung Malang Creative Center (MCC) mencatatkan pertumbuhan pesat ratusan studio animasi dan gim lokal.', cover_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Pekan Batik Gandrung Banyuwangi Hadirkan 500 Pengrajin Lokal Terbaik', content: 'Pagelaran batik khas Banyuwangi memukau ribuan pengunjung.', cover_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Jalan Tol Probolinggo - Banyuwangi Siap Dioperasikan Penuh Akhir Tahun Ini', content: 'Infrastruktur Tol Trans Jawa tahap akhir menghubungkan ujung timur pulau Jawa.', cover_image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Festival Pisang Kirana Lumajang 2026 Siap Digelar: Tampilkan Kuliner & Olahan Kreatif Lokal', content: 'Pemerintah Kabupaten Lumajang bersama komoditas petani lokal siap menghelat Festival Pisang Kirana 2026.', cover_image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Wisata Danau Ranu Pani & Ranu Regulo Semeru Alami Peningkatan Wisatawan Mancanegara', content: 'Kawasan konservasi Ranu Pani di lereng Gunung Semeru Lumajang menjadi destinasi favorit wisatawan.', cover_image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Kopi Pasrujambe Lumajang Raih Penghargaan Kopi Organik Terbaik Tingkat Nasional', content: 'Petani kopi organik kawasan Pasrujambe Lumajang berhasil meraih juara nasional.', cover_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Pemuda Lumajang Inovasikan Pengolahan Limbah Kayu Jadi Kerajinan Mebel Kelas Dunia', content: 'Komunitas kreatif pemuda Lumajang memanfaatkan limbah kayu olahan.', cover_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Air Terjun Tumpak Sewu Lumajang Masuk 10 Destinasi Air Terjun Terindah di Asia', content: 'Keindahan tirai air terjun Tumpak Sewu yang memukau di perbatasan Lumajang.', cover_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' }
];

app.get("/api/article-image/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = slugify(decodeURIComponent(slug));
    const normalizedSlug = cleanSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80';

    // Fetch articles from Supabase
    const { data: articles } = await supabase.from('articles').select('*');
    
    let article: any = null;
    if (articles && articles.length > 0) {
      article = articles.find((a: any) => {
        if (!a.title) return false;
        const aSlug = slugify(a.title);
        const normTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return aSlug === slug || aSlug === cleanSlug || a.id?.toString() === slug || normTitle === normalizedSlug;
      });
    }

    if (!article) {
      article = staticFallbackArticles.find(item => {
        const itemSlug = slugify(item.title);
        const normTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemSlug === slug || itemSlug === cleanSlug || normTitle === normalizedSlug;
      });
    }

    if (article) {
      const imgData = article.cover_image || article.image || extractFirstImage(article.content);
      if (imgData && imgData.startsWith('data:image')) {
        const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
        const rawBuffer = Buffer.from(base64Data, 'base64');
        
        try {
          const sharp = (await import('sharp')).default;
          const compressedBuffer = await sharp(rawBuffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();

          res.writeHead(200, {
            'Content-Type': 'image/webp',
            'Content-Length': compressedBuffer.length,
            'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable'
          });
          return res.end(compressedBuffer);
        } catch (e) {
          const match = imgData.match(/^data:image\/(\w+);base64,/);
          const ext = match ? match[1] : 'jpeg';
          const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
          res.writeHead(200, {
            'Content-Type': mimeType,
            'Content-Length': rawBuffer.length,
            'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable'
          });
          return res.end(rawBuffer);
        }
      } else if (imgData) {
        return res.redirect(302, imgData);
      }
    }

    // Default fallback
    return res.redirect(302, DEFAULT_NEWS_IMAGE);
  } catch (error: any) {
    return res.redirect(302, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80');
  }
});

const injectMetaTags = async (reqUrl: string, html: string, host = '') => {
  const lowerHost = host.toLowerCase();
  const urlPath = reqUrl.split('?')[0].split('#')[0];
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
  const defaultHost = host || 'www.gnextindonesia.site';
  const baseUrl = `${protocol}://${defaultHost}`;

  // Default Portal Branding based on Domain/Host & Path
  let siteName = 'Gnext Indonesia';
  let defaultTitle = 'Gnext Indonesia - Creative Studio';
  let defaultDescription = 'Ruang tumbuh bagi kreator muda untuk mengubah ide menjadi karya, dan karya menjadi kontribusi nyata.';
  let defaultFavicon = '/favicon.svg';
  let defaultOgImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80';

  if (lowerHost.startsWith('lumajangtalks.') || urlPath.startsWith('/lumajangtalks')) {
    siteName = 'LUMAJANG TALKS';
    defaultTitle = 'LUMAJANG TALKS - Portal Berita & Suara Kota Pisang';
    defaultDescription = 'Portal berita & suara warga Lumajang, informasi terkini seputar Gunung Semeru, kuliner, dan komunitas lokal Lumajang.';
    defaultFavicon = '/favicon-lt.svg';
    defaultOgImage = 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&h=630&q=80';
  } else if (lowerHost.startsWith('yoikijatim.') || urlPath.startsWith('/yoikijatim')) {
    siteName = 'YO IKI JATIM';
    defaultTitle = 'YO IKI JATIM - Portal Berita & Informasi Terdepan Jawa Timur';
    defaultDescription = 'Portal berita & informasi terkini seputar Surabaya, Malang, Banyuwangi, Madura, ekonomi, dan budaya Jawa Timur.';
    defaultFavicon = '/favicon-yj.svg';
    defaultOgImage = 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&h=630&q=80';
  } else if (lowerHost.startsWith('news.') || urlPath.startsWith('/news')) {
    siteName = 'GNEXT NEWS';
    defaultTitle = 'GNEXT NEWS - Portal Berita Kreatif & Ekonomi Nusantara';
    defaultDescription = 'Portal berita multimedia terkini, mendalam, independen, dan terpercaya dari Gnext News Network.';
    defaultFavicon = '/favicon-news.svg';
    defaultOgImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&h=630&q=80';
  } else if (lowerHost.startsWith('finance.') || urlPath.startsWith('/finance') || urlPath.startsWith('/gnextfinance')) {
    siteName = 'GNEXT FINANCE';
    defaultTitle = 'Gnext Finance - Berita Ekonomi, Bisnis, Perbankan & UMKM Terkini';
    defaultDescription = 'Portal berita seputar ekonomi makro, investasi, perbankan, fintech, bursa, saham, aset kripto, serta informasi bisnis dan pengembangan UMKM.';
    defaultFavicon = '/favicon-finance.svg';
    defaultOgImage = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&h=630&q=80';
  } else {
    // Detect specific Lentera regional network
    let detectedLentera: { id: string; name: string } | null = null;
    if (lowerHost.startsWith('lenterabangsa.') || urlPath.startsWith('/lenterabangsa')) {
      detectedLentera = { id: 'lenterabangsa', name: 'Lentera Bangsa' };
    } else {
      for (const l of LENTERA_NETWORKS_LIST) {
        const hyphenated = l.id.replace(/^lentera/, 'lentera-');
        if (
          lowerHost.startsWith(`${l.id}.`) ||
          lowerHost.startsWith(`${hyphenated}.`) ||
          urlPath.startsWith(`/${l.id}`) ||
          urlPath.startsWith(`/${hyphenated}`)
        ) {
          detectedLentera = l;
          break;
        }
      }
    }

    if (detectedLentera || lowerHost.startsWith('lentera') || urlPath.startsWith('/lentera')) {
      const pName = detectedLentera ? detectedLentera.name : 'Lentera Bangsa';
      siteName = pName;
      defaultTitle = `${pName} - Portal Berita & Kabar Daerah Nusantara`;
      defaultDescription = `Portal berita resmi, informasi terkini, dan kabar daerah berimbang dari ${pName}.`;
      defaultFavicon = '/favicon-lentera.svg';
      defaultOgImage = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&h=630&q=80';
    }
  }

  let title = defaultTitle;
  let description = defaultDescription;
  let image = defaultOgImage;
  let favicon = defaultFavicon;
  let isArticle = false;

  if (urlPath === '/' || urlPath === '') {
    // Uses default branding
  } else if (urlPath.endsWith('/privacy')) {
    title = `Kebijakan Privasi - ${siteName}`;
    description = `Kebijakan privasi dan perlindungan data pembaca ${siteName}.`;
  } else if (urlPath.endsWith('/terms')) {
    title = `Syarat & Ketentuan & Pedoman Siber - ${siteName}`;
    description = `Syarat, ketentuan layanan, dan pedoman pemberitaan media siber ${siteName}.`;
  } else if (urlPath === '/studio') {
    title = 'Studio Dashboard | Gnext Creative Studio';
    description = 'Manajemen web dan konten Gnext Creative Studio.';
  } else {
    // Extract candidate slug from path
    const pathParts = urlPath.split('/').filter(Boolean);
    const ignoredParts = new Set(['api', 'src', 'node_modules', '@vite', 'studio', 'loginstudio', 'privacy', 'terms', 'about', 'work', 'platform']);

    if (pathParts.length >= 1 && !ignoredParts.has(pathParts[0])) {
      const candidateSlug = pathParts[pathParts.length - 1];
      const decodedCandidate = decodeURIComponent(candidateSlug);
      const normalizedCandidate = candidateSlug.toLowerCase().replace(/[^a-z0-9]/g, '');

      try {
        const { data: articles } = await supabase.from('articles').select('*');
        let found: any = null;

        if (articles && articles.length > 0) {
          found = articles.find((a: any) => {
            if (!a.title) return false;
            const aSlug = slugify(a.title);
            const normTitle = a.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            return (
              aSlug === candidateSlug ||
              aSlug === slugify(decodedCandidate) ||
              a.id?.toString() === candidateSlug ||
              normTitle === normalizedCandidate ||
              (normalizedCandidate.length > 10 && normTitle.includes(normalizedCandidate))
            );
          });
        }

        if (!found) {
          found = staticFallbackArticles.find(fb => {
            const fbSlug = slugify(fb.title);
            const normTitle = fb.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            return (
              fbSlug === candidateSlug ||
              fbSlug === slugify(decodedCandidate) ||
              normTitle === normalizedCandidate
            );
          });
        }

        if (found) {
          isArticle = true;
          title = `${found.title} - ${siteName}`;
          description = cleanExcerptText(found.content || found.excerpt || '', 160);

          const extractedImg = found.cover_image || found.image || extractFirstImage(found.content);
          if (extractedImg && extractedImg.startsWith('data:image')) {
            image = `${baseUrl}/api/article-image/${encodeURIComponent(slugify(found.title))}`;
          } else if (extractedImg) {
            image = extractedImg;
          } else {
            image = defaultOgImage;
          }
        } else if (candidateSlug.length > 5) {
          // Dynamic unslugified fallback title for shareable URLs
          isArticle = true;
          const formattedTitle = unslugifyTitle(decodedCandidate);
          title = `${formattedTitle} - ${siteName}`;
          description = `Baca berita & kabar terkini mengenai ${formattedTitle} di ${siteName}.`;
          image = defaultOgImage;
        }
      } catch (e) {
        console.error('Error fetching article for meta tags:', e);
      }
    }
  }

  // Check web_settings override (only for main domain or explicit paths)
  try {
    const { data: dbSetting } = await supabase.from('web_settings').select('*').eq('path', urlPath).single();
    if (dbSetting) {
      if (dbSetting.title && siteName === 'Gnext Indonesia') title = dbSetting.title;
      if (dbSetting.description && siteName === 'Gnext Indonesia') description = dbSetting.description;
    }
  } catch (e) {
    // Ignore error
  }

  // Build clean meta strings
  const cleanTitle = title.replace(/"/g, '&quot;');
  const cleanDesc = description.replace(/"/g, '&quot;').replace(/\n+/g, ' ');
  const absoluteImageUrl = image.startsWith('http')
    ? image
    : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  const fullUrl = `${baseUrl}${urlPath}`;

  let newHtml = html;

  // Title
  if (newHtml.includes('<title>')) {
    newHtml = newHtml.replace(/<title>.*?<\/title>/i, `<title>${cleanTitle}</title>`);
  } else {
    newHtml = newHtml.replace('</head>', `<title>${cleanTitle}</title>\n</head>`);
  }

  const setMetaProperty = (prop: string, content: string) => {
    const regex = new RegExp(`<meta\\s+property="${prop}"\\s+content="[^"]*"\\s*\\/?>`, 'gi');
    if (regex.test(newHtml)) {
      newHtml = newHtml.replace(regex, `<meta property="${prop}" content="${content}" />`);
    } else {
      newHtml = newHtml.replace('</head>', `<meta property="${prop}" content="${content}" />\n</head>`);
    }
  };

  const setMetaName = (name: string, content: string) => {
    const regex = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*\\/?>`, 'gi');
    if (regex.test(newHtml)) {
      newHtml = newHtml.replace(regex, `<meta name="${name}" content="${content}" />`);
    } else {
      newHtml = newHtml.replace('</head>', `<meta name="${name}" content="${content}" />\n</head>`);
    }
  };

  setMetaName('description', cleanDesc);
  setMetaProperty('og:site_name', siteName);
  setMetaProperty('og:type', isArticle ? 'article' : 'website');
  setMetaProperty('og:url', fullUrl);
  setMetaProperty('og:title', cleanTitle);
  setMetaProperty('og:description', cleanDesc);
  setMetaProperty('og:image', absoluteImageUrl);
  setMetaProperty('og:image:secure_url', absoluteImageUrl);
  setMetaProperty('og:image:width', '1200');
  setMetaProperty('og:image:height', '630');
  setMetaProperty('og:image:alt', cleanTitle);
  setMetaProperty('og:locale', 'id_ID');

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:site', '@gnextindonesia');
  setMetaName('twitter:title', cleanTitle);
  setMetaName('twitter:description', cleanDesc);
  setMetaName('twitter:image', absoluteImageUrl);

  // Favicon
  if (favicon) {
    if (/<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="[^"]*"\s*\/?>/i.test(newHtml)) {
      newHtml = newHtml.replace(/<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="[^"]*"\s*\/?>/i, `<link rel="icon" type="image/svg+xml" href="${favicon}" />`);
    } else {
      newHtml = newHtml.replace('</head>', `<link rel="icon" type="image/svg+xml" href="${favicon}" />\n</head>`);
    }
    newHtml = newHtml.replace(/<link\s+rel="icon"\s+type="image\/png"\s+sizes="32x32"\s+href="[^"]*"\s*\/?>/i, `<link rel="icon" type="image/png" href="${favicon}" />`);
    newHtml = newHtml.replace(/<link\s+rel="apple-touch-icon"\s+sizes="180x180"\s+href="[^"]*"\s*\/?>/i, `<link rel="apple-touch-icon" href="${favicon}" />`);
    newHtml = newHtml.replace(/<link\s+rel="shortcut icon"\s+href="[^"]*"\s*\/?>/i, `<link rel="shortcut icon" href="${favicon}" />`);
  }

  // Inject Dynamic JSON-LD structured data for Google Site Name & Organization Logo
  let siteUrl = baseUrl;
  let siteLogo = `${baseUrl}/logo.png`;
  let siteAlternateName = siteName;

  if (siteName === 'LUMAJANG TALKS') {
    siteAlternateName = 'Portal Berita & Suara Kota Pisang Lumajang';
    siteUrl = 'https://lumajangtalks.gnextindonesia.site';
    siteLogo = 'https://lumajangtalks.gnextindonesia.site/favicon-lt.svg';
  } else if (siteName === 'YO IKI JATIM') {
    siteAlternateName = 'Portal Berita & Informasi Terdepan Jawa Timur';
    siteUrl = 'https://yoikijatim.gnextindonesia.site';
    siteLogo = 'https://yoikijatim.gnextindonesia.site/favicon-yj.svg';
  } else if (siteName === 'GNEXT NEWS') {
    siteAlternateName = 'Portal Berita Kreatif & Ekonomi Nusantara';
    siteUrl = 'https://news.gnextindonesia.site';
    siteLogo = 'https://news.gnextindonesia.site/favicon-news.svg';
  } else if (siteName.startsWith('Lentera')) {
    siteAlternateName = `Portal Berita ${siteName}`;
    siteUrl = baseUrl;
    siteLogo = `${baseUrl}/favicon-lentera.svg`;
  }

  const jsonLdContent = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "alternateName": [siteAlternateName, `${siteName} News`, `Portal Berita ${siteName}`],
      "url": `${siteUrl}/`
    },
    {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      "name": siteName,
      "alternateName": siteAlternateName,
      "url": `${siteUrl}/`,
      "logo": {
        "@type": "ImageObject",
        "url": siteLogo
      }
    }
  ], null, 2);

  newHtml = newHtml.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">\n${jsonLdContent}\n</script>`
  );

  // Inject Google Site Verification specifically for Gnext Finance
  if (siteName === 'GNEXT FINANCE') {
    newHtml = newHtml.replace('</head>', '<meta name="google-site-verification" content="GGm3xEh1hv79_Y0ngEwqj3Z6tEi2d4syBZbXF9JjXY0" />\n</head>');
  }

  return newHtml;
};

const getTemplatePath = () => {
  const possibleFiles = ['template.html', 'index.html'];
  const possibleDirs = [
    path.join(process.cwd(), 'dist'),
    process.cwd(),
    path.join(__dirname, 'dist'),
    path.join(__dirname, '..', 'dist'),
    path.join(__dirname, '..'),
    __dirname,
  ];
  
  for (const dir of possibleDirs) {
    for (const file of possibleFiles) {
      const p = path.join(dir, file);
      if (fs.existsSync(p)) {
        return p;
      }
    }
  }
  
  // Return standard default path if none exists to avoid crash during compile/lint but handles gracefully at runtime
  return path.join(process.cwd(), 'dist', 'template.html');
};

const getDistPath = () => {
  const possibleDirs = [
    path.join(process.cwd(), 'dist'),
    path.join(__dirname, 'dist'),
    path.join(__dirname, '..', 'dist'),
  ];
  
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return path.join(process.cwd(), 'dist');
};

async function startServer() {
  app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase();
    const url = req.originalUrl;
    
    // Only redirect if accessed from main corporate domain or www
    const isMainDomain = host === 'gnextindonesia.site' || host === 'www.gnextindonesia.site' || host.startsWith('www.');
    
    if (isMainDomain) {
      if (url.startsWith('/news')) {
        const newUrl = url.replace(/^\/news/, '');
        return res.redirect(301, `https://news.gnextindonesia.site${newUrl || '/'}`);
      }
      if (url.startsWith('/yoikijatim')) {
        const newUrl = url.replace(/^\/yoikijatim/, '');
        return res.redirect(301, `https://yoikijatim.gnextindonesia.site${newUrl || '/'}`);
      }
      if (url.startsWith('/lumajangtalks')) {
        const newUrl = url.replace(/^\/lumajangtalks/, '');
        return res.redirect(301, `https://lumajangtalks.gnextindonesia.site${newUrl || '/'}`);
      }
    }
    next();
  });

  
  // Tracking Pixel Route
  app.get('/api/track.gif', async (req, res) => {
    try {
      const { id } = req.query;
      if (id) {
        // Increment views directly in Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const trackUrl = supabaseUrl;
        const trackKey = supabaseAnonKey;
        if (trackUrl && trackKey) {
          const supabase = createClient(trackUrl, trackKey);
          
          // First get current views
          const { data } = await supabase.from('articles').select('views').eq('id', id).single();
          const currentViews = data ? (data.views || 0) : 0;
          
          // Update
          await supabase.from('articles').update({ views: currentViews + 1 }).eq('id', id);
        }
      }
    } catch (e) {
      console.error('Tracking error:', e);
    }
    
    // Return a 1x1 transparent GIF
    const buf = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': buf.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    res.end(buf);
  });

  console.log('DEBUG inside startServer:', { NODE_ENV: process.env.NODE_ENV, VERCEL: process.env.VERCEL });
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const viteModuleName = 'vite';
    const { createServer: createViteServer } = await import(viteModuleName);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        template = await injectMetaTags(url, template, (req.headers.host as string) || '');
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = getDistPath();
    app.use(express.static(distPath, { 
      index: false,
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff2?|ttf|eot)$/i)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
        }
      }
    }));
    
    app.get('*', async (req, res) => {
      try {
        const templatePath = getTemplatePath();
        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template file not found at: ${templatePath}`);
        }
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await injectMetaTags(req.path, template, (req.headers.host as string) || '');
        res.status(200).set({ 'Content-Type': 'text/html' }).send(template);
      } catch (err: any) {
        console.error('Error serving template inside wildcard route:', err);
        try {
          const templatePath = getTemplatePath();
          if (fs.existsSync(templatePath)) {
            res.sendFile(templatePath);
          } else {
            res.status(500).send(`
              <!DOCTYPE html>
              <html lang="id">
              <head>
                <meta charset="UTF-8">
                <title>Server Error - GNEXT</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; color: #333; text-align: center; padding: 50px; }
                  .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                  h1 { color: #e53e3e; }
                  p { color: #666; line-height: 1.6; }
                  pre { background: #f1f1f1; padding: 15px; border-radius: 6px; text-align: left; overflow-x: auto; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Internal Server Error</h1>
                  <p>Terjadi kesalahan saat memuat berkas template aplikasi di server Vercel. Mohon periksa log fungsi.</p>
                  <pre>${err.message || err}</pre>
                </div>
              </body>
              </html>
            `);
          }
        } catch (sendErr: any) {
          res.status(500).send(`Critical Server Error: ${err.message || err} | Follow up: ${sendErr.message || sendErr}`);
        }
      }
    });
  }

  if (!process.env.VERCEL) { app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  }
}

startServer().catch(error => {
  console.error("Critical async startServer error:", error);
  try {
    // Safely attempt to reset the express router so it doesn't try to route to half-built paths
    (app as any)._router = null;
  } catch (e) {}
  
  app.all('*', (req, res) => {
    res.status(500).set('Content-Type', 'text/html').send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Server Initialization Error</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fafafa; color: #333; padding: 50px; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 35px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          h1 { color: #e53e3e; margin-top: 0; font-size: 28px; }
          p { color: #4a5568; font-size: 16px; line-height: 1.6; }
          pre { background: #1a202c; color: #ae3; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: "Courier New", Courier, monospace; font-size: 14px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Inisialisasi Peladen Gagal (Server Initialization Error)</h1>
          <p>Terjadi kesalahan kritis saat melakukan inisialisasi asinkron (startServer) di berkas <code>server.ts</code> pada Vercel:</p>
          <pre>${error instanceof Error ? error.stack : String(error)}</pre>
          <p style="margin-top: 20px; font-size: 14px; color: #718096;">Sistem penanganan kegagalan otomatis GNEXT.</p>
        </div>
      </body>
      </html>
    `);
  });
});

export default app;

