import { supabase } from './supabase';
import { filterValidArticles, slugify } from '../data/news';
import { parseArticleDate } from './trending';

let cachedArticles: any[] | null = null;
let cachedCategories: any[] | null = null;
let cachedSettings: any[] | null = null;
let cachedUsers: any[] | null = null;
let lastFetchTime = 0;

const ARTICLE_DETAIL_CACHE: Record<string, { data: any; timestamp: number }> = {};

const CACHE_TTL = 300000; // 5 minutes cache for articles list
const META_CACHE_TTL = 900000; // 15 minutes cache for categories/settings/users

const STORAGE_KEYS = {
  ARTICLES: 'gnext_cache_articles_v4',
  CATEGORIES: 'gnext_cache_categories_v4',
  SETTINGS: 'gnext_cache_settings_v4',
  TIMESTAMP: 'gnext_cache_time_v4',
};

// Safe sessionStorage helpers
function getSessionStorage(key: string): any {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setSessionStorage(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // quota exceeded or private mode, silent fallback
  }
}

export function clearArticlesCache() {
  cachedArticles = null;
  lastFetchTime = 0;
  Object.keys(ARTICLE_DETAIL_CACHE).forEach(k => delete ARTICLE_DETAIL_CACHE[k]);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ARTICLES);
      sessionStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
      sessionStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      sessionStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (e) {}
  }
}

const DEFAULT_REAL_ARTICLES = [
  {
    id: 'gummah-1',
    title: 'Pesantren Ar-Raudhah Lumajang Luncurkan Inkubator Bisnis Santri Mandiri 2026',
    content: 'Pondok Pesantren Ar-Raudhah resmi meluncurkan program Inkubator Bisnis Santri Mandiri sebagai langkah konkret dalam mendorong kemandirian ekonomi pesantren dan mempersiapkan santri menjadi wirausahawan masa depan berlandaskan nilai syariah.',
    category_id: 'cat-dinamika-wawasan',
    author_id: 'redaksi-gummah',
    status: 'published',
    date: '15 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80',
    views: 4210,
    news_location: 'Lumajang',
    portal: 'gummah',
    sub_category: 'Kabar Ummah'
  },
  {
    id: 'gummah-2',
    title: 'Pasar Modal Syariah Indonesia Catat Pertumbuhan Investor Milenial Tertinggi di Asia Tenggara',
    content: 'Otoritas Jasa Keuangan (OJK) melaporkan pertumbuhan jumlah investor muda pada instrumen reksa dana dan saham syariah terus melonjak drastis, memperkuat posisi Indonesia sebagai salah satu pusat keuangan syariah paling prospektif.',
    category_id: 'cat-ekonomi-filantropi',
    author_id: 'redaksi-gummah',
    status: 'published',
    date: '14 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    views: 5120,
    news_location: 'Nasional',
    portal: 'gummah',
    sub_category: 'Ekonomi Syariah'
  },
  {
    id: 'yoiki-1',
    title: 'Pemerintah Provinsi Jawa Timur Percepat Digitalisasi UMKM dan Layanan Publik 2026',
    content: 'Pemprov Jawa Timur terus memacu percepatan transformasi digital bagi sektor usaha mikro kecil menengah (UMKM) serta memperluas layanan publik berbasis sistem cerdas di seluruh kabupaten dan kota se-Jawa Timur.',
    category_id: 'cat-ekonomi-jatim',
    author_id: 'redaksi-yoikijatim',
    status: 'published',
    date: '08 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    views: 4850,
    news_location: 'Surabaya',
    portal: 'yoikijatim',
    sub_category: 'Ekonomi Jatim'
  },
  {
    id: 'yoiki-2',
    title: 'Kawasan Wisata Bromo & Malang Raya Catat Peningkatan Kunjungan Wisatawan Internasional',
    content: 'Destinasi wisata unggulan Malang Raya dan Taman Nasional Bromo Tengger Semeru terus menyedot antusiasme turis mancanegara. Pengembangan homestay warga lokal mendongkrak perekonomian masyarakat Jawa Timur.',
    category_id: 'cat-wisata-jatim',
    author_id: 'redaksi-yoikijatim',
    status: 'published',
    date: '07 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
    views: 5300,
    news_location: 'Malang',
    portal: 'yoikijatim',
    sub_category: 'Wisata Budaya'
  },
  {
    id: 'lumajang-1',
    title: 'Festival Pisang Kirana Lumajang 2026 Siap Digelar: Tampilkan Kuliner & Olahan Kreatif Lokal',
    content: 'Festival tahunan Pisang Kirana Lumajang kembali hadir dengan ragam inovasi olahan pangan lokal dan pameran produk UMKM unggulan untuk menggerakkan ekonomi daerah.',
    category_id: 'cat-ekonomi-jatim',
    author_id: 'redaksi-lumajangtalks',
    status: 'published',
    date: '09 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=1200&q=80',
    views: 3100,
    news_location: 'Lumajang',
    portal: 'lumajangtalks',
    sub_category: 'Ekonomi Lumajang'
  },
  {
    id: 'gnext-1',
    title: 'Transformasi Strategi Digital Branding untuk Perusahaan Media Modern di Era AI',
    content: 'Adopsi teknologi kecerdasan buatan dalam pengelolaan redaksi berita dan personalisasi konten memberikan pengalaman pembaca yang jauh lebih imersif dan akurat.',
    category_id: 'cat-teknologi',
    author_id: 'redaksi-gnext',
    status: 'published',
    date: '10 Aug 2026',
    cover_image: 'https://images.unsplash.com/photo-1432828684207-6b4510008518?auto=format&fit=crop&w=1200&q=80',
    views: 6400,
    news_location: 'Jakarta',
    portal: 'gnext',
    sub_category: 'Teknologi'
  }
];

/**
 * Optimized fetch for public portal & listing pages:
 * - Omits the massive 'content' column to save ~80% Supabase Egress
 * - Utilizes 2-tier caching (Memory + SessionStorage)
 */
export async function fetchPublishedArticlesAndMetadata(forceRefresh: boolean = false) {
  const now = Date.now();

  // 1. Check in-memory cache
  if (!forceRefresh && cachedArticles && cachedArticles.length > 0 && (now - lastFetchTime < CACHE_TTL)) {
    return {
      articles: cachedArticles,
      categories: cachedCategories || [],
      settings: cachedSettings || []
    };
  }

  // 2. Check SessionStorage cache (instant, 0 network, 0 egress)
  if (!forceRefresh) {
    const storedTime = getSessionStorage(STORAGE_KEYS.TIMESTAMP);
    const storedArticles = getSessionStorage(STORAGE_KEYS.ARTICLES);
    const storedCategories = getSessionStorage(STORAGE_KEYS.CATEGORIES);
    const storedSettings = getSessionStorage(STORAGE_KEYS.SETTINGS);

    if (storedTime && storedArticles && storedArticles.length > 0 && (now - Number(storedTime) < CACHE_TTL)) {
      cachedArticles = storedArticles;
      cachedCategories = storedCategories || [];
      cachedSettings = storedSettings || [];
      lastFetchTime = Number(storedTime);
      return {
        articles: cachedArticles,
        categories: cachedCategories,
        settings: cachedSettings
      };
    }
  }

  try {
    // 3. Selective query: only valid columns that exist in DB
    const fetchPromise = Promise.all([
      supabase
        .from('articles')
        .select('id, title, category_id, author_id, status, date, cover_image, views, news_location, portal, sub_category, tags, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('categories')
        .select('id, name, slug, parent_id, created_at'),
      supabase
        .from('web_settings')
        .select('id, path, title, description, content')
    ]);

    const [articlesRes, categoriesRes, settingsRes] = await fetchPromise;

    let dbArticles: any[] = [];
    if (articlesRes && articlesRes.error) {
      console.warn('Database fetch warning, error was:', articlesRes.error);
      dbArticles = cachedArticles || DEFAULT_REAL_ARTICLES;
    } else {
      dbArticles = articlesRes && articlesRes.data && articlesRes.data.length > 0 ? articlesRes.data : [];
      if (!dbArticles || dbArticles.length === 0) {
        dbArticles = DEFAULT_REAL_ARTICLES;
      }
    }

    if (dbArticles && dbArticles.length > 0) {
      const valid = filterValidArticles(dbArticles).map((a: any) => ({
        ...a,
        categoryId: a.category_id || a.categoryId,
        authorId: a.author_id || a.authorId,
        news_location: a.news_location || 'Nasional',
        cover_image: a.cover_image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'
      }));

      valid.sort((a: any, b: any) => {
        const timeA = parseArticleDate(a.date, a.created_at).getTime();
        const timeB = parseArticleDate(b.date, b.created_at).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return ((b.views || 0) - (a.views || 0));
      });

      cachedArticles = valid;
      lastFetchTime = now;

      // Save to sessionStorage
      setSessionStorage(STORAGE_KEYS.ARTICLES, valid);
      setSessionStorage(STORAGE_KEYS.TIMESTAMP, now);
    }

    if (categoriesRes && !categoriesRes.error && categoriesRes.data) {
      cachedCategories = categoriesRes.data;
      setSessionStorage(STORAGE_KEYS.CATEGORIES, categoriesRes.data);
    }
    if (settingsRes && !settingsRes.error && settingsRes.data) {
      cachedSettings = settingsRes.data;
      setSessionStorage(STORAGE_KEYS.SETTINGS, settingsRes.data);
    }
  } catch (err) {
    console.warn('Network issue in cachedFetch:', err);
    if (!cachedArticles || cachedArticles.length === 0) {
      cachedArticles = filterValidArticles(DEFAULT_REAL_ARTICLES);
    }
  }

  return {
    articles: filterValidArticles(cachedArticles || DEFAULT_REAL_ARTICLES),
    categories: cachedCategories || [],
    settings: cachedSettings || []
  };
}

/**
 * Fetches full single article detail (including full 'content' body) on-demand:
 * - Only downloads the single article requested, not the whole database
 * - Caches in memory for fast re-views
 */
export async function fetchArticleFullDetail(slugOrId: string): Promise<any | null> {
  const cacheKey = slugOrId.toLowerCase();
  const now = Date.now();

  // Return cached single article if available within 10 minutes
  if (ARTICLE_DETAIL_CACHE[cacheKey] && (now - ARTICLE_DETAIL_CACHE[cacheKey].timestamp < 600000)) {
    return ARTICLE_DETAIL_CACHE[cacheKey].data;
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    
    let query = supabase.from('articles').select('*');
    if (isUuid) {
      query = query.eq('id', slugOrId);
    } else {
      query = query.eq('id', slugOrId);
    }

    const { data, error } = await query.maybeSingle();

    if (!error && data) {
      const formatted = {
        ...data,
        categoryId: data.category_id,
        authorId: data.author_id,
        news_location: data.news_location || 'Nasional',
        cover_image: data.cover_image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80'
      };
      ARTICLE_DETAIL_CACHE[cacheKey] = { data: formatted, timestamp: now };
      return formatted;
    }
  } catch (e) {
    console.warn('Failed to fetch full article detail:', e);
  }

  return null;
}

/**
 * Cached users fetch to prevent unnecessary egress on public author lookups
 */
export async function fetchUsersCached(): Promise<any[]> {
  const now = Date.now();
  if (cachedUsers && (now - lastFetchTime < META_CACHE_TTL)) {
    return cachedUsers;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, email, role, portal, domisili, whatsapp, instagram_link, created_at');
    if (!error && data) {
      cachedUsers = data;
      return data;
    }
  } catch (e) {}

  return cachedUsers || [];
}

