/**
 * Integration service for Good News Nusantara (GNN) API
 * Endpoint: https://goodnewsnusantara.my.id/api/articles.php
 */

export interface GNNArticleRaw {
  id: string;
  title: string;
  slug?: string;
  url?: string;
  category?: string;
  sub_category?: string;
  author?: string;
  date?: string;
  created_at?: string;
  image?: string;
  cover_image?: string;
  caption?: string;
  views?: number;
  likes?: number;
  tags?: string[] | string;
  summary?: string;
  content?: string;
}

export interface GNNResponse {
  status: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  data: GNNArticleRaw[];
}

const GNN_API_URL = 'https://goodnewsnusantara.my.id/api/articles.php';
const GNN_CACHE_KEY = 'gnn_articles_cache_v3';
const GNN_CACHE_TIME_KEY = 'gnn_articles_cache_time_v3';
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 menit cache

let memoryGNNArticles: any[] | null = null;
let memoryGNNTime = 0;

import { detectArticleLocation } from './locationDetector';

/**
 * Normalizes a raw GNN article into standard Article shape compatible with Gnext site
 */
export function normalizeGNNArticle(raw: GNNArticleRaw): any {
  const categoryName = raw.category || 'Nusantara';
  const categoryId = `gnn-cat-${(raw.category || 'kabar-baik').toLowerCase().replace(/\s+/g, '-')}`;
  const textContent = raw.content || raw.summary || '';
  const detectedLocation = (raw as any).news_location || (raw as any).location || detectArticleLocation(textContent, raw.title, 'Nasional');
  
  return {
    id: raw.id || `gnn-${raw.slug || Math.random().toString(36).substring(2, 9)}`,
    title: raw.title || 'Tanpa Judul',
    content: textContent,
    categoryId: categoryId,
    category_id: categoryId,
    category_name: categoryName,
    authorId: raw.author || 'Redaksi GNN',
    author_name: raw.author || 'Redaksi GNN',
    status: 'published',
    date: raw.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    created_at: raw.created_at || new Date().toISOString(),
    cover_image: raw.image || raw.cover_image || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80',
    views: Number(raw.views) || Math.floor(Math.random() * 800) + 120,
    likes: Number(raw.likes) || 0,
    news_location: detectedLocation,
    portal: 'gnext',
    sub_category: raw.sub_category || 'Kabar Baik',
    tags: Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === 'string' ? raw.tags.split(',').map(t => t.trim()) : [],
    slug: raw.slug || '',
    external_url: raw.url || '',
    is_gnn: true
  };
}

/**
 * Fetch articles from GNN API (with caching & timeout protection)
 */
export async function fetchGNNArticles(limit: number = 20, forceRefresh: boolean = false): Promise<any[]> {
  const now = Date.now();

  // 1. Check in-memory
  if (!forceRefresh && memoryGNNArticles && (now - memoryGNNTime < CACHE_TTL_MS)) {
    return memoryGNNArticles;
  }

  // 2. Check sessionStorage
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const storedTime = sessionStorage.getItem(GNN_CACHE_TIME_KEY);
      const storedData = sessionStorage.getItem(GNN_CACHE_KEY);
      if (storedTime && storedData && (now - Number(storedTime) < CACHE_TTL_MS)) {
        const parsed = JSON.parse(storedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryGNNArticles = parsed;
          memoryGNNTime = Number(storedTime);
          return parsed;
        }
      }
    } catch (e) {}
  }

  // 3. Network Fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${GNN_API_URL}?limit=${limit}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GNN API HTTP error: ${response.status}`);
    }

    const json: GNNResponse = await response.json();
    if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      const normalized = json.data.map(normalizeGNNArticle);

      memoryGNNArticles = normalized;
      memoryGNNTime = now;

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(GNN_CACHE_KEY, JSON.stringify(normalized));
          sessionStorage.setItem(GNN_CACHE_TIME_KEY, String(now));
        } catch (e) {}
      }

      return normalized;
    }
  } catch (err) {
    console.warn('GNN API fetch failed or timed out:', err);
  }

  return memoryGNNArticles || [];
}

/**
 * Fetch detail for 1 article by slug or id from GNN API
 */
export async function fetchGNNArticleDetail(slugOrId: string): Promise<any | null> {
  try {
    const isId = slugOrId.startsWith('gnn-');
    const param = isId ? `id=${encodeURIComponent(slugOrId)}` : `slug=${encodeURIComponent(slugOrId)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${GNN_API_URL}?${param}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const json = await response.json();
    if (json && json.status === 'success') {
      const raw = Array.isArray(json.data) ? json.data[0] : json.data;
      if (raw) {
        return normalizeGNNArticle(raw);
      }
    }
  } catch (e) {
    console.warn('Failed to fetch single GNN article detail:', e);
  }
  return null;
}
