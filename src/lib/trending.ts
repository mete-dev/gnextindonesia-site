import { Article } from '../pages/studio/types';
import { filterValidArticles } from '../data/news';

/**
 * Helper to parse various date formats safely
 */
export function parseArticleDate(dateStr?: string | Date, createdAtStr?: string | Date): Date {
  let createdTime = 0;
  if (createdAtStr) {
    const cDate = createdAtStr instanceof Date ? createdAtStr : new Date(String(createdAtStr).trim());
    if (!isNaN(cDate.getTime())) {
      createdTime = cDate.getTime();
    }
  }

  let dateTime = 0;
  if (dateStr) {
    if (dateStr instanceof Date) {
      dateTime = dateStr.getTime();
    } else {
      const str = String(dateStr).trim();
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        dateTime = parsed.getTime();
      } else {
        // Handle Indonesian date string format like '08 Agu 2026', '31 Jul 2026', '01 Agustus 2026'
        const months: Record<string, number> = {
          jan: 0, januari: 0,
          feb: 1, februari: 1,
          mar: 2, maret: 2,
          apr: 3, april: 3,
          mei: 4, may: 4,
          jun: 5, juni: 5,
          jul: 6, juli: 6,
          agu: 7, agustus: 7, agt: 7, ags: 7, aug: 7, august: 7,
          sep: 8, september: 8,
          okt: 9, oktober: 9, oct: 9,
          nov: 10, november: 10,
          des: 11, desember: 11, dec: 11
        };

        const parts = str.toLowerCase().split(/\s+/);
        if (parts.length >= 3) {
          const day = parseInt(parts[0], 10);
          const monthKey = parts[1].toLowerCase();
          const month = months[monthKey] ?? months[monthKey.substring(0, 3)] ?? 0;
          const year = parseInt(parts[2], 10);
          if (!isNaN(day) && !isNaN(year)) {
            dateTime = new Date(year, month, day).getTime();
          }
        }
      }
    }
  }

  const maxTime = Math.max(createdTime, dateTime);
  return new Date(maxTime);
}

/**
 * Get trending headline candidates for each website portal.
 * Rules:
 * - Filtered by past 7 days (seminggu terakhir) relative to latest date / now.
 * - Highest traffic (views) in past 7 days gets top spot (Berita Utama / Trending Topic).
 * - Regional portals (Jatim, Lumajang, Lentera) focus on their region.
 * - Lentera portals use local articles first; if none exist, fall back to National highest-traffic articles.
 */
export function getTrendingHeadlineCandidates(
  rawArticles: Article[],
  scope: 'national' | 'jatim' | 'lumajang' | 'lentera' | 'gummah' | 'finance',
  lenteraLocation?: string
): Article[] {
  const articles = filterValidArticles(rawArticles);
  if (!articles || articles.length === 0) return [];

  // 1. Filter relevant articles by scope
  let relevantArticles: Article[] = [];

  if (scope === 'national') {
    relevantArticles = [...articles];
  } else if (scope === 'jatim') {
    const jatimKeywords = [
      'jatim', 'jawa timur', 'surabaya', 'malang', 'lumajang', 'banyuwangi',
      'jember', 'kediri', 'sidoarjo', 'gresik', 'probolinggo', 'pasuruan'
    ];
    relevantArticles = articles.filter((a) => {
      const portal = ((a as any).portal || '').toLowerCase();
      const loc = (a.news_location || '').toLowerCase().trim();
      return portal === 'yoikijatim' || jatimKeywords.some((k) => loc.includes(k));
    });
    if (relevantArticles.length === 0) {
      relevantArticles = [...articles];
    }
  } else if (scope === 'lumajang') {
    relevantArticles = articles.filter((a) => {
      const portal = ((a as any).portal || '').toLowerCase();
      const loc = (a.news_location || '').toLowerCase().trim();
      return portal === 'lumajangtalks' || loc.includes('lumajang');
    });
    if (relevantArticles.length === 0) {
      relevantArticles = [...articles];
    }
  } else if (scope === 'lentera') {
    const locKeyword = (lenteraLocation || '').toLowerCase().replace(/^lentera\s*/i, '').trim();
    if (locKeyword) {
      relevantArticles = articles.filter((a) => {
        const portal = ((a as any).portal || '').toLowerCase();
        const loc = (a.news_location || '').toLowerCase().trim();
        return (
          portal.includes(locKeyword) ||
          loc.includes(locKeyword) ||
          (locKeyword === 'jogja' && (loc.includes('yogyakarta') || loc.includes('jogja'))) ||
          (locKeyword === 'jabar' && (loc.includes('jawabarat') || loc.includes('jawa barat') || loc.includes('bandung'))) ||
          (locKeyword === 'jateng' && (loc.includes('jawa tengah') || loc.includes('semarang'))) ||
          (locKeyword === 'jatim' && (loc.includes('jawa timur') || loc.includes('surabaya')))
        );
      });
    }

    if (relevantArticles.length === 0) {
      relevantArticles = articles.filter((a) => {
        const loc = (a.news_location || '').toLowerCase().trim();
        return loc === 'nasional' || !loc;
      });
      if (relevantArticles.length === 0) {
        relevantArticles = [...articles];
      }
    }
  } else if (scope === 'gummah') {
    relevantArticles = articles.filter((a) => {
      const portal = ((a as any).portal || '').toLowerCase();
      return portal === 'gummah';
    });
    if (relevantArticles.length === 0) {
      relevantArticles = [...articles];
    }
  } else if (scope === 'finance') {
    relevantArticles = articles.filter((a) => {
      const portal = ((a as any).portal || '').toLowerCase();
      const catId = (a.categoryId || a.category_id || '').toLowerCase();
      return portal === 'finance' || portal === 'gnextfinance' || catId.includes('finance') || catId.includes('fiskal') || catId.includes('bisnis');
    });
    if (relevantArticles.length === 0) {
      relevantArticles = [...articles];
    }
  }

  // 2. Sort relevant articles strictly by date descending (newest published article FIRST)
  const sortedByDate = [...relevantArticles].sort((a, b) => {
    const dateA = parseArticleDate((a as any).date || (a as any).created_at).getTime();
    const dateB = parseArticleDate((b as any).date || (b as any).created_at).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    return ((b as any).views || 0) - ((a as any).views || 0);
  });

  return sortedByDate;
}

/**
 * Get top 5 latest articles strictly for the running text (ticker)
 */
export function getLatestTickerArticles(rawArticles: Article[], limit: number = 5): Article[] {
  const articles = filterValidArticles(rawArticles);
  const sorted = [...articles].sort((a, b) => {
    const dateA = parseArticleDate((a as any).date || (a as any).created_at).getTime();
    const dateB = parseArticleDate((b as any).date || (b as any).created_at).getTime();
    return dateB - dateA; // Newest first
  });
  return sorted.slice(0, limit);
}

/**
 * Helper to get reference time (either current time or latest article timestamp in dataset)
 */
export function getReferenceTime(articles: Article[]): number {
  const nowMs = Date.now();
  const maxArticleMs = articles.reduce((max, a) => {
    const d = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    return d > max ? d : max;
  }, 0);
  return maxArticleMs > 0 ? Math.max(nowMs, maxArticleMs) : nowMs;
}

/**
 * 1. BERITA UTAMA: Berita pembaca terbanyak dalam 3 hari terakhir.
 * Priority: Last 3 days articles sorted by views descending.
 */
export function getBeritaUtama(
  rawArticles: Article[],
  scope: 'national' | 'jatim' | 'lumajang' | 'lentera' | 'gummah' | 'finance' = 'national',
  lenteraLocation?: string
): Article[] {
  const articles = getTrendingHeadlineCandidates(rawArticles, scope, lenteraLocation);
  if (!articles || articles.length === 0) return [];

  const refMs = getReferenceTime(articles);
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  // Filter articles from past 3 days
  const last3Days = articles.filter((a) => {
    const dateMs = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    if (dateMs === 0) return true;
    return refMs - dateMs <= THREE_DAYS_MS;
  });

  // Sort by highest views descending, then recency
  last3Days.sort((a, b) => {
    const viewsA = (a as any).views || 0;
    const viewsB = (b as any).views || 0;
    if (viewsB !== viewsA) return viewsB - viewsA;
    const dateA = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    const dateB = parseArticleDate((b as any).date, (b as any).created_at).getTime();
    return dateB - dateA;
  });

  if (last3Days.length >= 4) {
    return last3Days;
  }

  // Fallback / padding if fewer than 4 articles in 3 days:
  // Pad with articles from last 7 days or remaining articles sorted by views
  const remaining = articles
    .filter((a) => !last3Days.some((r) => r.id === a.id))
    .sort((a, b) => {
      const viewsA = (a as any).views || 0;
      const viewsB = (b as any).views || 0;
      if (viewsB !== viewsA) return viewsB - viewsA;
      const dateA = parseArticleDate((a as any).date, (a as any).created_at).getTime();
      const dateB = parseArticleDate((b as any).date, (b as any).created_at).getTime();
      return dateB - dateA;
    });

  return [...last3Days, ...remaining];
}

/**
 * 2a. TERPOPULER HARIAN: Berita pembaca terbanyak dalam 24 jam / 1 hari terakhir.
 */
export function getTerpopulerHarian(rawArticles: Article[], limit: number = 5): Article[] {
  const articles = filterValidArticles(rawArticles);
  if (!articles || articles.length === 0) return [];

  const refMs = getReferenceTime(articles);
  const ONE_DAY_MS = 1 * 24 * 60 * 60 * 1000;
  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

  // Filter articles from past 24 hours
  let daily = articles.filter((a) => {
    const dateMs = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    if (dateMs === 0) return true;
    return refMs - dateMs <= ONE_DAY_MS;
  });

  // If low volume in 24 hours, expand to 48 hours
  if (daily.length < limit) {
    daily = articles.filter((a) => {
      const dateMs = parseArticleDate((a as any).date, (a as any).created_at).getTime();
      if (dateMs === 0) return true;
      return refMs - dateMs <= TWO_DAYS_MS;
    });
  }

  // Sort by views descending
  daily.sort((a, b) => {
    const viewsA = (a as any).views || 0;
    const viewsB = (b as any).views || 0;
    if (viewsB !== viewsA) return viewsB - viewsA;
    const dateA = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    const dateB = parseArticleDate((b as any).date, (b as any).created_at).getTime();
    return dateB - dateA;
  });

  if (daily.length >= limit) {
    return daily.slice(0, limit);
  }

  // Pad with overall articles by views if still under limit
  const remaining = articles
    .filter((a) => !daily.some((d) => d.id === a.id))
    .sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0));

  return [...daily, ...remaining].slice(0, limit);
}

/**
 * 2b. TERPOPULER MINGGUAN: Berita pembaca terbanyak dalam 7 hari (1 minggu) terakhir.
 */
export function getTerpopulerMingguan(rawArticles: Article[], limit: number = 5): Article[] {
  const articles = filterValidArticles(rawArticles);
  if (!articles || articles.length === 0) return [];

  const refMs = getReferenceTime(articles);
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const weekly = articles.filter((a) => {
    const dateMs = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    if (dateMs === 0) return true;
    return refMs - dateMs <= SEVEN_DAYS_MS;
  });

  weekly.sort((a, b) => {
    const viewsA = (a as any).views || 0;
    const viewsB = (b as any).views || 0;
    if (viewsB !== viewsA) return viewsB - viewsA;
    const dateA = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    const dateB = parseArticleDate((b as any).date, (b as any).created_at).getTime();
    return dateB - dateA;
  });

  if (weekly.length >= limit) {
    return weekly.slice(0, limit);
  }

  const remaining = articles
    .filter((a) => !weekly.some((w) => w.id === a.id))
    .sort((a, b) => ((b as any).views || 0) - ((a as any).views || 0));

  return [...weekly, ...remaining].slice(0, limit);
}

/**
 * Backward-compatible alias for popular articles
 */
export function getPopularArticles(rawArticles: Article[], limit: number = 5): Article[] {
  return getTerpopulerMingguan(rawArticles, limit);
}

/**
 * 3. SOROTAN UTAMA: Berita tanding / trending dalam 7 hari terakhir.
 */
export function getSorotanUtama(
  rawArticles: Article[],
  limit: number = 5,
  excludeIds: (string | undefined)[] = []
): Article[] {
  const articles = filterValidArticles(rawArticles);
  if (!articles || articles.length === 0) return [];

  const excludedSet = new Set(excludeIds.filter(Boolean));
  const candidateList = articles.filter((a) => !excludedSet.has(a.id));

  const refMs = getReferenceTime(candidateList);
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  // Past 7 days
  const last7Days = candidateList.filter((a) => {
    const dateMs = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    if (dateMs === 0) return true;
    return refMs - dateMs <= SEVEN_DAYS_MS;
  });

  // Sort by combination of views and recency (trending score)
  last7Days.sort((a, b) => {
    const viewsA = (a as any).views || 0;
    const viewsB = (b as any).views || 0;
    if (viewsB !== viewsA) return viewsB - viewsA;
    const dateA = parseArticleDate((a as any).date, (a as any).created_at).getTime();
    const dateB = parseArticleDate((b as any).date, (b as any).created_at).getTime();
    return dateB - dateA;
  });

  if (last7Days.length >= limit) {
    return last7Days.slice(0, limit);
  }

  const remaining = candidateList
    .filter((a) => !last7Days.some((s) => s.id === a.id))
    .sort((a, b) => {
      const dateA = parseArticleDate((a as any).date, (a as any).created_at).getTime();
      const dateB = parseArticleDate((b as any).date, (b as any).created_at).getTime();
      return dateB - dateA;
    });

  return [...last7Days, ...remaining].slice(0, limit);
}

/**
 * 4. NEWSDETAIL TERPOPULER / BERITA TERKAIT:
 * Prioritizes articles matching hashtags (tags) or title word similarity.
 */
export function getRelatedArticlesBySimilarity(
  currentArticle: Article,
  allArticles: Article[],
  limit: number = 5
): Article[] {
  const articles = filterValidArticles(allArticles).filter((a) => a.id !== currentArticle.id);
  if (!articles || articles.length === 0) return [];

  // Parse hashtags/tags from current article
  const currentTags: string[] = Array.isArray((currentArticle as any).tags)
    ? (currentArticle as any).tags.map((t: string) => t.toLowerCase().trim())
    : (currentArticle as any).tags
    ? String((currentArticle as any).tags).toLowerCase().split(',').map((t) => t.trim())
    : [];

  // Also extract hashtags from title or content (#tag)
  const hashtagRegex = /#([\w\-]+)/g;
  let match;
  while ((match = hashtagRegex.exec(currentArticle.title + ' ' + (currentArticle.content || ''))) !== null) {
    if (match[1]) currentTags.push(match[1].toLowerCase());
  }

  // Extract significant words from title (length >= 4, ignoring common stop words)
  const stopWords = new Set(['yang', 'dengan', 'untuk', 'pada', 'dalam', 'dari', 'atau', 'akan', 'oleh', 'juga', 'saat', 'para', 'bisa']);
  const titleWords = currentArticle.title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));

  const scored = articles.map((article) => {
    let score = 0;

    // Check tag / hashtag matches
    const articleTags: string[] = Array.isArray((article as any).tags)
      ? (article as any).tags.map((t: string) => t.toLowerCase().trim())
      : (article as any).tags
      ? String((article as any).tags).toLowerCase().split(',').map((t) => t.trim())
      : [];

    let hashtagMatchCount = 0;
    currentTags.forEach((tag) => {
      if (tag && articleTags.some((t) => t.includes(tag) || tag.includes(t))) {
        hashtagMatchCount++;
      }
    });
    score += hashtagMatchCount * 10;

    // Check title word similarity
    const otherTitleWords = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);

    let titleMatchCount = 0;
    titleWords.forEach((word) => {
      if (otherTitleWords.includes(word)) {
        titleMatchCount++;
      }
    });
    score += titleMatchCount * 4;

    // Category match bonus
    if (article.categoryId && currentArticle.categoryId && article.categoryId === currentArticle.categoryId) {
      score += 5;
    }

    // Portal match bonus
    if ((article as any).portal && (currentArticle as any).portal && (article as any).portal === (currentArticle as any).portal) {
      score += 2;
    }

    // Recency tie-breaker
    const dateMs = parseArticleDate((article as any).date, (article as any).created_at).getTime();

    return { article, score, dateMs, views: (article as any).views || 0 };
  });

  // Sort by score descending, then views, then recency
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.views !== a.views) return b.views - a.views;
    return b.dateMs - a.dateMs;
  });

  return scored.slice(0, limit).map((s) => s.article);
}

/**
 * Format date nicely in Indonesian (e.g., "15 Agustus 2026")
 */
export function formatDate(dateStr?: string | Date, createdAtStr?: string): string {
  const raw = dateStr || createdAtStr;
  const d = parseArticleDate(raw);
  if (!d || isNaN(d.getTime()) || d.getTime() === 0) {
    return String(raw || 'Baru Saja');
  }
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
