import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight, Radio, Globe, MapPin, Clock, UserCheck, ZoomIn, ZoomOut, X, Flame, Share2, Eye, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';
import { supabase } from '../lib/supabase';
import { fetchPublishedArticlesAndMetadata, fetchArticleFullDetail, fetchUsersCached } from '../lib/cachedFetch';
import { Article, Category, User } from './studio/types';
import { gummahFallbackArticles } from './GUmmah';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { SchemaMarkup } from '../components/SchemaMarkup';
import ShareButtons from '../components/ShareButtons';
import { detectPortal, getPortalById, lenteraNetworks } from '../lib/portals';
import { ArticleDetailSkeleton } from '../components/NewsSkeletons';
import { trackArticleView } from '../lib/tracker';
import { parseArticleDate, getPopularArticles, getRelatedArticlesBySimilarity } from '../lib/trending';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';

export default function NewsDetailPage() {
  const { categorySlug, slug } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; caption?: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine active portal based on hostname context and path
  const getActivePortalId = (): string => {
    if (typeof window === 'undefined') return 'gnext';
    const host = window.location.hostname.toLowerCase();
    
    // Explicit subdomains get their own portal
    if (host.startsWith('finance.')) return 'finance';
    if (host.startsWith('gummah.') || host.startsWith('g-ummah.') || host.startsWith('ummah.')) return 'gummah';
    if (host.startsWith('yoikijatim.')) return 'yoikijatim';
    if (host.startsWith('lumajangtalks.')) return 'lumajangtalks';
    if (host.startsWith('lentera')) {
      const match = host.match(/^lenterabangsa|^lentera[a-z]+/);
      return match ? match[0] : 'lenterabangsa';
    }
    
    // Main domain or news subdomain context
    // Check if the path explicitly starts with a portal identifier
    if (pathname.startsWith('/yoikijatim/')) return 'yoikijatim';
    if (pathname.startsWith('/lumajangtalks/')) return 'lumajangtalks';
    
    // Check if path is for a lentera network
    const lenteraMatch = lenteraNetworks.find(n => pathname.startsWith(`/${n.id}/`));
    if (lenteraMatch) return lenteraMatch.id;

    // For any other path (e.g., /finance/... or /ummah/... on news subdomain/main domain),
    // we want to keep the "Gnext News" brand and navbar!
    return 'gnext';
  };

  const activePortal = getActivePortalId();

  const isSubdomain = typeof window !== 'undefined' && (
    window.location.hostname.toLowerCase().startsWith('news.') ||
    window.location.hostname.toLowerCase().startsWith('yoikijatim.') ||
    window.location.hostname.toLowerCase().startsWith('lumajangtalks.') ||
    window.location.hostname.toLowerCase().startsWith('gummah.') ||
    window.location.hostname.toLowerCase().startsWith('g-ummah.') ||
    window.location.hostname.toLowerCase().startsWith('ummah.') ||
    window.location.hostname.toLowerCase().startsWith('finance.') ||
    window.location.hostname.toLowerCase().startsWith('lentera')
  );

  const routePrefix = isSubdomain
    ? ''
    : activePortal === 'yoikijatim' 
    ? '/yoikijatim' 
    : activePortal === 'lumajangtalks' 
    ? '/lumajangtalks' 
    : activePortal === 'gummah' 
    ? (typeof window !== 'undefined' && window.location.pathname.startsWith('/ummah') ? '/ummah' : '/gummah') 
    : activePortal.startsWith('lentera')
    ? `/${activePortal}`
    : '/news';

  const portalObj = getPortalById(activePortal);

  const portalName = portalObj ? portalObj.name : (
    activePortal === 'yoikijatim' 
    ? 'YO IKI JATIM' 
    : activePortal === 'lumajangtalks' 
    ? 'LUMAJANG TALKS' 
    : activePortal === 'gummah' 
    ? 'GNEXT UMMAH' 
    : 'GNEXT NEWS'
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [categorySlug, slug, pathname]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metaData, dbUsers] = await Promise.all([
        fetchPublishedArticlesAndMetadata(),
        fetchUsersCached(),
      ]);
      
      const dbArticles = metaData.articles || [];
      const dbCategories = metaData.categories || [];
      
      setCategories(dbCategories);
      setUsers(dbUsers);
      
      const allSearchArticles = filterValidArticles([...dbArticles, ...gummahFallbackArticles]).sort((a: any, b: any) => {
        const timeA = parseArticleDate(a.date, a.created_at).getTime();
        const timeB = parseArticleDate(b.date, b.created_at).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return ((b.views || 0) - (a.views || 0));
      });
      
      const getCatName = (id: string) => {
        const foundCat = dbCategories.find((c: any) => c.id === id);
        if (foundCat) return foundCat.name;
        if (id === 'cat-sosial') return 'Sosial';
        if (id === 'cat-pendidikan') return 'Pendidikan';
        if (id === 'cat-keuangan') return 'Keuangan';
        if (id === 'cat-lingkungan') return 'Lingkungan';
        if (id === 'cat-wisata' || id.includes('wisata')) return 'Wisata & Budaya';
        if (id === 'cat-ekonomi' || id.includes('ekonomi')) return 'Ekonomi & Bisnis';
        if (id === 'cat-kreatif' || id.includes('pemuda')) return 'Kreatif & Media';
        if (id === 'cat-teknologi') return 'Teknologi';
        return 'Berita';
      };
      
      const foundPreview = allSearchArticles.find(a => {
        const catName = getCatName(a.categoryId);
        const catSlugMatches = slugify(catName) === categorySlug;
        const titleMatches = slugify(a.title) === slug;
        return (catSlugMatches || !categorySlug) && titleMatches;
      }) || allSearchArticles.find(a => slugify(a.title) === slug);
      
      if (foundPreview) {
        // Fetch full content specifically for this single article
        const fullDetail = await fetchArticleFullDetail(foundPreview.id || slug || '');
        const finalArticle = fullDetail ? { ...foundPreview, ...fullDetail } : foundPreview;

        setArticle(finalArticle);
        
        // Track article view
        trackArticleView(finalArticle.id, finalArticle.views || 0, (finalArticle as any).portal || activePortal);
        
        // Filter other articles from same category in memory (zero extra network egress!)
        const sameCategoryData = allSearchArticles.filter(
          a => (a.categoryId === finalArticle.categoryId || a.category_id === finalArticle.category_id) && a.id !== finalArticle.id
        ).slice(0, 10);

        const isFinanceCategory = (catId: string) => {
          const catIdLower = (catId || '').toLowerCase();
          const financeCatIds = [
            'cat-kabar-fiskal',
            'cat-perbankan-fintech',
            'cat-bursa-emiten',
            'cat-aset-alternatif',
            'cat-dapur-bisnis',
            'cat-sentra-umkm',
            'cat-cerdas-finansial',
            'cat-keuangan',
            'cat-ekonomi'
          ];
          if (financeCatIds.includes(catIdLower)) return true;
          
          const catName = getCategoryName(catId).toLowerCase();
          return catName.includes('finance') || 
                 catName.includes('keuangan') || 
                 catName.includes('ekonomi') || 
                 catName.includes('bisnis') || 
                 catName.includes('saham') ||
                 catName.includes('fiskal') ||
                 catName.includes('fintech') ||
                 catName.includes('perbankan') ||
                 catName.includes('emiten') ||
                 catName.includes('umkm');
        };

        const getTagsArray = (item: any): string[] => {
          if (Array.isArray(item.tags)) return item.tags.map((t: string) => String(t).toLowerCase().trim()).filter(Boolean);
          if (typeof item.tags === 'string') return item.tags.split(',').map((t: string) => t.toLowerCase().trim()).filter(Boolean);
          return [];
        };

        const getTitleWords = (titleStr: string): string[] => {
          const stopWords = new Set(['dengan', 'untuk', 'yang', 'pada', 'dari', 'atau', 'dan', 'ini', 'itu', 'akan', 'telah', 'resmi', 'bisa', 'oleh', 'dalam', 'secara', 'kini', 'bukan', 'saat', 'para']);
          return (titleStr || '')
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));
        };

        const targetTags = getTagsArray(found);
        const targetTitleWords = getTitleWords(found.title);

        let portalCandidates = filterValidArticles(allSearchArticles).filter(a => a.id !== found.id && a.status === 'published');
        if (activePortal === 'yoikijatim') {
          portalCandidates = portalCandidates.filter(a => (a as any).portal === 'yoikijatim' || a.id.startsWith('yoiki-'));
        } else if (activePortal === 'lumajangtalks') {
          portalCandidates = portalCandidates.filter(a => (a as any).portal === 'lumajangtalks' || a.id.startsWith('lumajang-'));
        } else if (activePortal === 'gummah') {
          portalCandidates = portalCandidates.filter(a => (a as any).portal === 'gummah' || a.id.startsWith('gummah-'));
        } else if (activePortal === 'finance') {
          portalCandidates = portalCandidates.filter(a => (a as any).portal === 'finance' || isFinanceCategory(a.categoryId));
        } else if (activePortal.startsWith('lentera')) {
          portalCandidates = portalCandidates.filter(a => (a as any).portal === activePortal);
        }

        if (portalCandidates.length < 5) {
          portalCandidates = filterValidArticles(allSearchArticles).filter(a => a.id !== found.id && a.status === 'published');
        }

        // Score candidates based on hashtag overlap, title word similarity, and category match
        const scoredArticles = portalCandidates.map(candidate => {
          let score = 0;
          const candTags = getTagsArray(candidate);
          const candTitleWords = getTitleWords(candidate.title);

          // Hashtag / Tag overlap (+20 per matching tag)
          for (const tTag of targetTags) {
            if (candTags.includes(tTag)) {
              score += 20;
            }
          }

          // Title keyword overlap (+5 per matching word)
          for (const tWord of targetTitleWords) {
            if (candTitleWords.includes(tWord)) {
              score += 5;
            }
          }

          // Category match (+10)
          if (candidate.categoryId === found.categoryId || (candidate as any).category_id === found.category_id) {
            score += 10;
          }

          return { article: candidate, score };
        });

        // Sort by relevance score descending, then date descending
        scoredArticles.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          const timeA = parseArticleDate(a.article.date, (a.article as any).created_at).getTime();
          const timeB = parseArticleDate(b.article.date, (b.article as any).created_at).getTime();
          return timeB - timeA;
        });

        // Sort & calculate related and popular articles based on hashtag and title similarity
        const similarityArticles = getRelatedArticlesBySimilarity(found, portalCandidates, 10);
        setRelatedArticles(similarityArticles.slice(0, 5));
        
        // Popular sidebar in NewsDetail prioritizes hashtag and title similarity matching current article
        const popularList = similarityArticles.length >= 5 ? similarityArticles.slice(0, 5) : getPopularArticles(portalCandidates, 5);
        setPopularArticles(popularList);
      } else {
        setArticle(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    if (found) return found.name;
    if (catId === 'cat-sosial') return 'Sosial';
    if (catId === 'cat-pendidikan') return 'Pendidikan';
    if (catId === 'cat-keuangan') return 'Keuangan';
    if (catId === 'cat-lingkungan') return 'Lingkungan';
    if (catId === 'cat-wisata' || catId.includes('wisata')) return activePortal === 'lumajangtalks' ? 'Wisata & Semeru' : 'Wisata & Budaya';
    if (catId === 'cat-ekonomi' || catId.includes('ekonomi')) return activePortal === 'lumajangtalks' ? 'Pisang & Kuliner' : 'Ekonomi & Bisnis';
    if (catId === 'cat-kreatif' || catId.includes('pemuda')) return activePortal === 'lumajangtalks' ? 'Komunitas Pemuda' : 'Kreatif & Media';
    if (catId === 'cat-teknologi') return 'Teknologi';
    return 'Berita';
  };

  const getAuthorName = (authorId: string) => users.find(u => u.id === authorId)?.name || 'Redaksi ' + portalName;

  const formatPublishDateTime = (dateStr?: string, createdAtStr?: string) => {
    const raw = createdAtStr || dateStr;
    if (!raw) return 'Baru saja';

    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      return raw;
    }

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const dayName = dayNames[d.getDay()];
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const hasTime = Boolean(createdAtStr || (dateStr && (dateStr.includes('T') || dateStr.includes(':'))));

    if (hasTime) {
      return `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes} WIB`;
    }

    return `${dayName}, ${day} ${month} ${year}`;
  };

  const extractFirstImage = (content?: string) => {
    if (!content) return null;
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1]?.trim()) return mdMatch[1].trim();
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/);
    if (htmlMatch && htmlMatch[1]?.trim()) return htmlMatch[1].trim();
    return null;
  };

  const defaultCoverFallback = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&h=630&fit=crop';

  const getArticleImg = (art?: Article | null) => {
    if (!art) return defaultCoverFallback;
    const cover = (art as any).cover_image;
    if (typeof cover === 'string' && cover.trim()) return cover.trim();
    const extracted = extractFirstImage(art.content);
    if (extracted) return extracted;
    return defaultCoverFallback;
  };

  const getFormattedContentWithDateline = (content: string, location?: string, portal?: string) => {
    if (!content) return '';
    let trimmed = content.trim();

    const rawLoc = location && location.trim() ? location.trim() : (portal === 'lumajangtalks' ? 'LUMAJANG' : portal === 'yoikijatim' ? 'JAWA TIMUR' : portal === 'gummah' ? 'UMMAH' : 'NASIONAL');
    const loc = rawLoc.toUpperCase();
    const pub = portal === 'yoikijatim' ? 'YO IKI JATIM' : portal === 'lumajangtalks' ? 'LUMAJANG TALKS' : portal === 'gummah' ? 'GNEXT UMMAH' : portal === 'finance' ? 'GNEXT FINANCE' : portal?.startsWith('lentera') ? portalName.toUpperCase() : 'GNEXT NEWS';

    const datelineMarkdown = `**${loc}, ${pub}** - `;

    // Remove existing dateline patterns to prevent duplication
    trimmed = trimmed.replace(/^\s*\*\*[^*]+\*\*\s*[-–]\s*/i, '');
    trimmed = trimmed.replace(/^<([a-z1-6]+)[^>]*>\s*\*\*[^*]+\*\*\s*[-–]\s*/i, '<$1>');
    trimmed = trimmed.replace(/^\s*<strong>[^<]+<\/strong>\s*[-–]\s*/i, '');
    trimmed = trimmed.replace(/^<([a-z1-6]+)[^>]*>\s*<strong>[^<]+<\/strong>\s*[-–]\s*/i, '<$1>');

    // If it's a simple string without any tags at the start, just prepend markdown
    if (!trimmed.startsWith('<')) {
      return `${datelineMarkdown}${trimmed}`;
    }

    try {
      if (typeof window !== 'undefined' && window.DOMParser) {
        const parser = new DOMParser();
        // Parse the content into an HTML document
        const doc = parser.parseFromString(trimmed, 'text/html');
        
        // Recursive function to find the first meaningful text node
        const findFirstTextNode = (node: Node): Node | null => {
          for (let child of Array.from(node.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE && child.textContent && child.textContent.trim() !== '') {
              return child;
            }
            if (child.nodeType === Node.ELEMENT_NODE) {
              const el = child as HTMLElement;
              // Ignore self-closing or non-text-bearing elements
              if (['SCRIPT', 'STYLE', 'IMG', 'BR', 'HR', 'IFRAME', 'VIDEO'].includes(el.nodeName)) continue;
              const found = findFirstTextNode(child);
              if (found) return found;
            }
          }
          return null;
        };

        const firstTextNode = findFirstTextNode(doc.body);

        if (firstTextNode && firstTextNode.parentNode) {
          const strong = doc.createElement('strong');
          strong.textContent = `${loc}, ${pub}`;
          const span = doc.createElement('span');
          span.textContent = ' - ';
          
          firstTextNode.parentNode.insertBefore(span, firstTextNode);
          firstTextNode.parentNode.insertBefore(strong, span);
          
          return doc.body.innerHTML;
        }
      }
    } catch (e) {
      console.error('Error parsing HTML for dateline', e);
    }

    // Fallback if parsing fails or no text node is found
    return `${datelineMarkdown}${trimmed}`;
  };

  const getExcerpt = (content: string, length = 180) => {
    if (!content) return '';
    const formatted = getFormattedContentWithDateline(content, article?.news_location, activePortal);
    return getCleanExcerpt(formatted, length);
  };

  const isGummah = activePortal === 'gummah';
  const isLentera = activePortal.startsWith('lentera');
  const categoryNames = ['Semua', ...Array.from(new Set(categories.map((c) => c.name)))];

  // Background style per portal
  const pageBgClass = isLentera
    ? 'bg-[#FAF7F2] text-[#23150C] selection:bg-[#8C4A21] selection:text-white'
    : isGummah
    ? 'bg-[#f0fdf4] text-neutral-900 selection:bg-emerald-600 selection:text-white'
    : activePortal === 'yoikijatim' 
    ? 'bg-orange-50/40 text-neutral-900 selection:bg-orange-600 selection:text-white' 
    : activePortal === 'lumajangtalks' 
    ? 'bg-lumajang-50/40 text-neutral-900 selection:bg-lumajang-400 selection:text-neutral-950' 
    : 'bg-neutral-50 text-neutral-900 selection:bg-red-600 selection:text-white';

  if (loading) {
    return (
      <div className={`min-h-screen ${pageBgClass} relative overflow-hidden`}>
        <Navbar 
          portal={activePortal} 
          categories={activePortal === 'gnext' && categoryNames.length > 1 ? categoryNames : undefined}
          onSelectCategory={(cat) => navigate(`/${activePortal === 'gnext' ? 'news' : activePortal}?category=${encodeURIComponent(cat)}`)}
        />
        <ArticleDetailSkeleton portal={activePortal} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3">Berita tidak ditemukan</h1>
        <p className="text-neutral-500 mb-8 max-w-md text-sm">
          Berita yang Anda cari mungkin telah dihapus, dipindahkan, atau URL tidak valid.
        </p>
        <button 
          onClick={() => navigate(routePrefix, { replace: true })} 
          className="bg-neutral-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
        >
          Kembali ke {portalName}
        </button>
      </div>
    );
  }

  const coverImg = getArticleImg(article);
  const excerptText = getExcerpt(article.content);

  const publisherLogo = activePortal === 'lumajangtalks' 
    ? 'https://www.gnextindonesia.site/favicon-lt.svg' 
    : activePortal === 'yoikijatim' 
    ? 'https://www.gnextindonesia.site/favicon-yj.svg' 
    : 'https://www.gnextindonesia.site/favicon-news.svg';

  // Page URL for Schema markup
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://${activePortal === 'gnext' ? 'news' : activePortal}.gnextindonesia.site/${categorySlug || 'berita'}/${slug}`;

  return (
    <div className={`min-h-screen ${pageBgClass} relative overflow-hidden`}>
      {/* Article JSON-LD Structured Data Schema */}
      <SchemaMarkup
        article={article}
        title={article.title}
        description={excerptText}
        url={pageUrl}
        imageUrl={coverImg}
        datePublished={(article as any)?.created_at || article.date}
        dateModified={(article as any)?.updated_at || (article as any)?.created_at || article.date}
        authorName={getAuthorName(article.authorId)}
        publisherName={portalName}
        publisherLogoUrl={publisherLogo}
        categoryName={getCategoryName(article.categoryId)}
        keywords={Array.isArray(article.tags) ? article.tags : (typeof article.tags === 'string' ? article.tags : undefined)}
      />

      <SEO 
        title={`${article.title} - ${portalName}`}
        description={excerptText}
        image={coverImg}
        type="article"
        author={getAuthorName(article.authorId)}
        datePublished={(article as any)?.created_at || article.date}
        dateModified={(article as any)?.updated_at || (article as any)?.created_at || article.date}
        categoryName={getCategoryName(article.categoryId)}
        keywords={Array.isArray(article.tags) ? article.tags.join(', ') : (typeof article.tags === 'string' ? article.tags : undefined)}
      />

      <Navbar 
        portal={activePortal} 
        categories={activePortal === 'gnext' && categoryNames.length > 1 ? categoryNames : undefined}
        onSelectCategory={(cat) => navigate(`/${activePortal === 'gnext' ? 'news' : activePortal}?category=${encodeURIComponent(cat)}`)}
      />
      
      <main className="pt-20 md:pt-28 pb-24 overflow-hidden relative z-10">
        
        <article className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* BREADCRUMB NAVIGATION */}
          <Breadcrumbs
            portal={activePortal}
            items={[
              { label: portalName, path: routePrefix || '/' },
              { 
                label: getCategoryName(article.categoryId), 
                path: `/${activePortal === 'gnext' ? 'news' : activePortal}?category=${encodeURIComponent(getCategoryName(article.categoryId))}` 
              },
              { label: article.title, active: true }
            ]}
            className="mb-5"
          />

          {/* HEADLINE / TITLE SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                isLentera
                  ? 'bg-[#3D2314] text-[#FAF7F2]'
                  : isGummah
                  ? 'bg-emerald-800 text-amber-200 border border-amber-400/40 shadow-xs'
                  : activePortal === 'yoikijatim'
                  ? 'bg-orange-600 text-white'
                  : activePortal === 'lumajangtalks'
                  ? 'bg-lumajang-400 text-neutral-950'
                  : 'bg-red-600 text-white'
              }`}>
                {getCategoryName(article.categoryId)}
              </span>
              {article.news_location && (
                <span className={`text-xs font-medium flex items-center gap-1 ${isLentera ? 'text-[#8C715E]' : isGummah ? 'text-emerald-800' : 'text-neutral-500'}`}>
                  <MapPin size={12} className={isLentera ? 'text-[#8C4A21]' : isGummah ? 'text-emerald-700' : 'text-neutral-400'} />
                  {article.news_location}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-extrabold leading-[1.25] tracking-tight mb-4 ${
              isLentera ? 'text-[#23150C]' : isGummah ? 'text-emerald-950 font-serif' : 'text-neutral-950'
            }`}>
              {article.title}
            </h1>

            {/* Publisher & Timestamp Meta */}
            <div className={`flex flex-wrap items-center justify-between gap-3 text-xs pt-1 pb-4 border-b ${
              isLentera ? 'border-[#EADCC9] text-[#8C715E]' : isGummah ? 'border-emerald-200 text-emerald-900/70' : 'border-neutral-200 text-neutral-500'
            }`}>
              <div className="flex items-center gap-2">
                {(() => {
                  const authorUser = users.find(u => u.id === article.authorId);
                  return authorUser?.username ? (
                    <Link 
                      to={`/${authorUser.username}`}
                      className={`font-bold hover:underline transition-all ${
                        isLentera ? 'text-[#8C4A21]' : isGummah ? 'text-emerald-800' : activePortal === 'yoikijatim' ? 'text-orange-600' : activePortal === 'lumajangtalks' ? 'text-lumajang-600' : 'text-red-600'
                      }`}
                    >
                      {getAuthorName(article.authorId)}
                    </Link>
                  ) : (
                    <span className={`font-bold ${
                      isLentera ? 'text-[#8C4A21]' : isGummah ? 'text-emerald-800' : activePortal === 'yoikijatim' ? 'text-orange-600' : activePortal === 'lumajangtalks' ? 'text-lumajang-600' : 'text-red-600'
                    }`}>
                      {getAuthorName(article.authorId)}
                    </span>
                  );
                })()}
                <span className="text-neutral-300">&bull;</span>
                <span className={`font-calibri font-medium tracking-wide flex items-center gap-1.5 ${isLentera ? 'text-[#5C4435]' : 'text-neutral-600'}`}>
                  <Clock size={13} className={`inline shrink-0 ${isLentera ? 'text-[#8C4A21]' : 'text-neutral-400'}`} />
                  <span>{formatPublishDateTime(article.date, (article as any)?.created_at)}</span>
                </span>
              </div>

              {/* Share actions header */}
              <div className="flex items-center gap-2">
                <ShareButtons title={article.title} excerpt={excerptText} coverImage={coverImg} />
              </div>
            </div>
          </motion.div>

          {/* COVER IMAGE WITH CAPTION */}
          {coverImg && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div 
                className={`overflow-hidden rounded-2xl aspect-[16/9] sm:aspect-[21/9] shadow-sm mb-2 border relative group cursor-zoom-in ${
                  isLentera ? 'bg-[#1E120A] border-[#EADCC9]' : 'bg-neutral-100 border-neutral-200'
                }`}
                onClick={() => {
                  setLightboxImage({ src: coverImg, caption: (article as any)?.image_caption || article.title });
                  setZoomLevel(1);
                }}
              >
                <BlurImage 
                  src={coverImg} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs font-bold shadow-lg z-10 pointer-events-none">
                  <ZoomIn size={14} />
                  <span>Perbesar</span>
                </div>
              </div>
              <p className={`text-xs leading-relaxed px-1 ${isLentera ? 'text-[#8C715E]' : 'text-neutral-500'}`}>
                <span className={`italic ${isLentera ? 'text-[#3D2314]' : 'text-neutral-700'}`}>
                  {(article as any)?.image_caption || article.title}
                </span>
              </p>
            </motion.div>
          )}

          {/* MAIN ARTICLE BODY CONTENT WITH AUTOMATIC MID-ARTICLE BACA JUGA BETWEEN EVEN-ODD PARAGRAPHS */}
          {(() => {
            const fullContent = getFormattedContentWithDateline(article.content, article.news_location, activePortal);
            const paragraphs = fullContent.split(/\n\s*\n/).filter(Boolean);

            const getCategoryNameForCatId = (catId: string) => {
              const foundCat = categories.find(c => c.id === catId);
              if (foundCat) return foundCat.name;
              return 'Berita';
            };

            const renderContentWithBacaJuga = () => {
              const renderedElements: React.ReactNode[] = [];

              paragraphs.forEach((paragraphText, idx) => {
                // Render paragraph with image lightbox support
                renderedElements.push(
                  <div key={`p-chunk-${idx}`} className="markdown-body my-4">
                    <ReactMarkdown 
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        img: ({ node, ...props }) => (
                          <span className="block my-4">
                            <span 
                              className="relative inline-block cursor-zoom-in group max-w-full rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm"
                              onClick={() => {
                                if (props.src) {
                                  setLightboxImage({ src: props.src, caption: props.alt || '' });
                                  setZoomLevel(1);
                                }
                              }}
                            >
                              <img
                                {...props}
                                loading="lazy"
                                style={{ aspectRatio: '16/9', ...props.style }}
                                className="rounded-2xl hover:scale-[1.02] transition-transform duration-300 max-w-full mx-auto block"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] font-bold">
                                <ZoomIn size={12} />
                                <span>Perbesar</span>
                              </span>
                            </span>
                            {props.alt && (
                              <span className="block text-center text-xs text-neutral-500 italic mt-1.5 px-2">
                                {props.alt}
                              </span>
                            )}
                          </span>
                        )
                      }}
                    >
                      {paragraphText}
                    </ReactMarkdown>
                  </div>
                );

                // Insert BACA JUGA after every 2 paragraphs (between 2-3, 4-5, 6-7, etc.)
                const paragraphNumber = idx + 1;
                const totalParagraphs = paragraphs.length;

                if (paragraphNumber % 2 === 0 && relatedArticles.length > 0) {
                  const relatedIndex = (paragraphNumber / 2 - 1) % relatedArticles.length;
                  const relArticle = relatedArticles[relatedIndex];
                  if (relArticle) {
                    const categoryName = getCategoryNameForCatId(relArticle.categoryId);
                    const relUrl = `${routePrefix}/${slugify(categoryName)}/${slugify(relArticle.title)}`;

                    renderedElements.push(
                      <div 
                        key={`baca-juga-insert-${idx}`}
                        className={`my-7 p-4 sm:p-5 rounded-2xl border-l-4 transition-all shadow-2xs not-prose border border-neutral-200/70 ${
                          isLentera 
                            ? 'bg-[#FAF3E8] border-l-[#8C4A21] text-[#23150C]' 
                            : isGummah
                            ? 'bg-emerald-900/5 border-l-emerald-600 border-emerald-100 text-emerald-950 shadow-xs'
                            : activePortal === 'yoikijatim' 
                            ? 'bg-orange-50/80 border-l-orange-600 border-orange-100 text-neutral-900' 
                            : activePortal === 'lumajangtalks' 
                            ? 'bg-lumajang-50/80 border-l-lumajang-400 border-neutral-200 text-neutral-900' 
                            : 'bg-neutral-100/90 border-l-red-600 text-neutral-900'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md text-white shadow-2xs ${
                            isLentera 
                              ? 'bg-[#8C4A21]' 
                              : isGummah 
                              ? 'bg-emerald-800 text-amber-200 border border-amber-400/40' 
                              : activePortal === 'yoikijatim' 
                              ? 'bg-orange-600' 
                              : activePortal === 'lumajangtalks' 
                              ? 'bg-lumajang-400 text-neutral-950' 
                              : 'bg-red-600'
                          }`}>
                            BACA JUGA :
                          </span>
                          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            {categoryName}
                          </span>
                        </div>

                        <Link 
                          to={relUrl}
                          className={`text-base sm:text-lg font-bold hover:underline block leading-snug font-sans sm:font-display transition-colors ${
                            isLentera 
                              ? 'text-[#8C4A21] hover:text-[#3D2314]' 
                              : isGummah 
                              ? 'text-emerald-950 hover:text-emerald-700' 
                              : activePortal === 'yoikijatim' 
                              ? 'text-orange-700 hover:text-orange-900' 
                              : activePortal === 'lumajangtalks' 
                              ? 'text-neutral-900 hover:text-lumajang-400' 
                              : 'text-red-700 hover:text-red-900'
                          }`}
                        >
                          {relArticle.title} &rarr;
                        </Link>
                      </div>
                    );
                  }
                }
              });

              return renderedElements;
            };

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className={`prose prose-neutral max-w-none leading-relaxed text-base sm:text-lg md:text-xl prose-p:mb-5 prose-p:leading-[1.8] prose-a:font-semibold prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-2xl sm:prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:text-xl sm:prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-lg sm:prose-h3:text-xl md:prose-h3:text-2xl prose-img:rounded-xl [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:bg-neutral-100 [&_th]:border [&_th]:border-neutral-300 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_td]:border [&_td]:border-neutral-200 [&_td]:p-3 [&_tr:nth-child(even)]:bg-neutral-50 [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:my-6 ${
                  isLentera ? 'text-[#23150C] prose-headings:text-[#23150C] prose-a:text-[#8C4A21]' : 'text-neutral-900'
                }`}
              >
                {renderContentWithBacaJuga()}

                {/* ADDITIONAL PHOTOS / GALERI FOTO PENDUKUNG */}
                {Array.isArray((article as any).images) && ((article as any).images).length > 0 && (
                  <div className={`my-10 p-5 sm:p-6 rounded-2xl border not-prose ${
                    isLentera ? 'bg-[#FAF3E8]/80 border-[#EADCC9]' : isGummah ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <h3 className={`text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider mb-5 pb-2 border-b ${
                      isLentera ? 'border-[#EADCC9] text-[#23150C]' : isGummah ? 'border-emerald-200 text-emerald-900 font-bold' : 'border-neutral-200 text-neutral-900'
                    }`}>
                      Galeri Foto Pendukung ({((article as any).images).length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {((article as any).images).map((imgItem: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs flex flex-col group">
                          <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
                            <BlurImage 
                              src={imgItem.url} 
                              alt={imgItem.caption || `Foto Pendukung ${idx + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          {(imgItem.caption || imgItem.credit) && (
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              {imgItem.caption && (
                                <p className={`text-xs font-semibold leading-snug mb-1 ${isLentera ? 'text-[#23150C]' : 'text-neutral-900'}`}>
                                  {imgItem.caption}
                                </p>
                              )}
                              {imgItem.credit && (
                                <p className="text-[10px] text-neutral-400">
                                  Foto: {imgItem.credit}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* TAGS & FOOTER META */}
          <div className={`mt-12 pt-6 border-t ${isLentera ? 'border-[#EADCC9]' : isGummah ? 'border-emerald-200' : 'border-neutral-200'}`}>
            {(() => {
              const tagsList = Array.isArray(article.tags)
                ? article.tags
                : (typeof article.tags === 'string' ? (article.tags as string).split(',').map(t => t.trim()).filter(Boolean) : []);
              if (tagsList.length === 0) return null;
              return (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className={`text-xs font-bold uppercase tracking-wider mr-2 ${isLentera ? 'text-[#8C715E]' : isGummah ? 'text-emerald-800' : 'text-neutral-400'}`}>Kata Kunci:</span>
                  {tagsList.map((tag, idx) => (
                    <span key={`${tag}-${idx}`} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      isLentera ? 'bg-[#FAF3E8] text-[#5C4435] border border-[#EADCC9] hover:bg-[#F2E8DC]' : isGummah ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300 hover:bg-emerald-200' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              );
            })()}

            {/* AUTHOR / REDAKSI VERIFIED BOX */}
            {(() => {
              const authorUser = users.find(u => u.id === article.authorId);
              const authorNameStr = authorUser?.name || getAuthorName(article.authorId);
              const hasProfile = !!authorUser?.username;
              const profilePath = hasProfile ? `/${authorUser.username}` : '#';

              const cardContent = (
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs mb-8 transition-all duration-300 ${
                  hasProfile 
                    ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer group bg-opacity-90' 
                    : ''
                } ${
                  isLentera 
                    ? 'bg-[#FAF3E8] border-[#EADCC9] text-[#23150C]' 
                    : isGummah 
                    ? 'bg-emerald-900/5 border-emerald-200 text-emerald-950 shadow-2xs' 
                    : 'bg-neutral-50 border-neutral-200/80 text-neutral-900'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm transition-transform duration-300 ${
                      hasProfile ? 'group-hover:scale-105' : ''
                    } ${
                      isLentera 
                        ? 'bg-[#8C4A21]' 
                        : isGummah 
                        ? 'bg-emerald-800 text-amber-300 border border-amber-400/40' 
                        : activePortal === 'yoikijatim' 
                        ? 'bg-orange-600' 
                        : activePortal === 'lumajangtalks' 
                        ? 'bg-lumajang-400 text-neutral-950' 
                        : 'bg-neutral-900'
                    }`}>
                      {isLentera ? <Radio size={16} /> : activePortal === 'yoikijatim' ? <Globe size={16} /> : activePortal === 'lumajangtalks' ? <MapPin size={16} /> : <Radio size={16} />}
                    </div>
                    <div>
                      <p className={`font-extrabold text-sm transition-colors duration-200 ${
                        hasProfile ? 'group-hover:text-neutral-950 group-hover:underline decoration-2' : ''
                      }`}>
                        Redaksi {portalName} ({authorNameStr})
                      </p>
                      <p className={`text-[11px] ${
                        isLentera ? 'text-[#8C715E]' : isGummah ? 'text-emerald-800/80' : 'text-neutral-500'
                      }`}>
                        Artikel Terverifikasi &bull; Berita Resmi
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-bold text-[11px] border border-emerald-200 shrink-0">
                    <UserCheck size={14} />
                    <span>Terverifikasi</span>
                  </div>
                </div>
              );

              if (hasProfile) {
                return (
                  <Link to={profilePath} className="block no-underline">
                    {cardContent}
                  </Link>
                );
              }
              return cardContent;
            })()}
          </div>

        </article>

        {/* RELATED & POPULAR ARTICLES SECTION (Matching screenshot layout) */}
        {(relatedArticles.length > 0 || popularArticles.length > 0) && (() => {
          const primaryColorClass = isLentera 
            ? 'text-[#8C4A21]' 
            : isGummah 
            ? 'text-emerald-700' 
            : activePortal === 'yoikijatim' 
            ? 'text-orange-600' 
            : activePortal === 'lumajangtalks' 
            ? 'text-lumajang-600' 
            : 'text-red-600';

          const primaryBgClass = isLentera 
            ? 'bg-[#8C4A21]' 
            : isGummah 
            ? 'bg-emerald-700' 
            : activePortal === 'yoikijatim' 
            ? 'bg-orange-600' 
            : activePortal === 'lumajangtalks' 
            ? 'bg-lumajang-400 text-neutral-950' 
            : 'bg-red-600';

          const primaryBorderClass = isLentera 
            ? 'border-[#8C4A21]' 
            : isGummah 
            ? 'border-emerald-700' 
            : activePortal === 'yoikijatim' 
            ? 'border-orange-600' 
            : activePortal === 'lumajangtalks' 
            ? 'border-lumajang-400' 
            : 'border-red-600';

          const hoverTitleClass = isLentera 
            ? 'group-hover:text-[#8C4A21]' 
            : isGummah 
            ? 'group-hover:text-emerald-700' 
            : activePortal === 'yoikijatim' 
            ? 'group-hover:text-orange-600' 
            : activePortal === 'lumajangtalks' 
            ? 'group-hover:text-lumajang-600' 
            : 'group-hover:text-red-600';

          return (
            <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-12 pt-10 border-t border-neutral-200/80 clear-both">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: BERITA TERKINI (8 COLS) */}
                <div className="lg:col-span-8 bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
                  {/* Header */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-6 border-b-2 gap-2 ${primaryBorderClass}`}>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                      <Flame className={`w-6 h-6 ${primaryColorClass} fill-current`} />
                      <span>BERITA REKOMENDASI</span>
                    </h3>
                    <span className="text-xs font-medium text-neutral-500">
                      Berdasarkan Tag & Topik Terkait
                    </span>
                  </div>

                  {/* Article List */}
                  <div className="flex flex-col gap-6">
                    {relatedArticles.slice(0, 5).map((item) => {
                      const catName = getCategoryName(item.categoryId);
                      const locationName = item.news_location || 'INDONESIA';
                      const itemUrl = `${routePrefix}/${slugify(catName)}/${slugify(item.title)}`;
                      const coverImage = getArticleImg(item);

                      return (
                        <div 
                          key={item.id}
                          className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-stretch shadow-2xs hover:shadow-md transition-all group h-full"
                        >
                          {/* Image & Badges */}
                          <div className="w-full sm:w-56 md:w-64 aspect-[16/10] sm:aspect-none sm:h-auto sm:self-stretch rounded-xl overflow-hidden shrink-0 relative bg-neutral-900">
                            <BlurImage 
                              src={coverImage} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            {/* Overlay Badges top-left */}
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 max-w-[90%]">
                              <span className="bg-neutral-900/95 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-2xs">
                                {catName}
                              </span>
                              {locationName && (
                                <span className={`${primaryBgClass} ${activePortal === 'lumajangtalks' ? '' : 'text-white'} text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-2xs`}>
                                  {locationName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Info Column */}
                          <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                            <div>
                              {/* Meta Header Row */}
                              <div className="flex items-center justify-between text-xs text-neutral-400 font-medium mb-2">
                                <div className="flex items-center gap-1.5">
                                  <Clock size={13} className="text-neutral-400" />
                                  <span>{item.date || '2026-08-28'}</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (navigator.share) {
                                      navigator.share({ title: item.title, url: window.location.origin + itemUrl }).catch(() => {});
                                    } else {
                                      navigator.clipboard.writeText(window.location.origin + itemUrl);
                                      alert('Tautan berita telah disalin!');
                                    }
                                  }}
                                  className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
                                  title="Bagikan berita"
                                >
                                  <Share2 size={16} />
                                </button>
                              </div>

                              {/* Title */}
                              <Link to={itemUrl}>
                                <h4 className={`text-base sm:text-lg md:text-xl font-bold text-neutral-900 leading-snug line-clamp-2 transition-colors ${hoverTitleClass}`}>
                                  {item.title}
                                </h4>
                              </Link>

                              {/* Excerpt */}
                              <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 mt-2 leading-relaxed">
                                {getExcerpt(item.content, 140)}
                              </p>
                            </div>

                            {/* Baca Berita Link */}
                            <div className="mt-4 pt-2">
                              <Link 
                                to={itemUrl}
                                className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider ${primaryColorClass} hover:underline`}
                              >
                                <span>BACA BERITA</span>
                                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT COLUMN: TERPOPULER (4 COLS) */}
                <div className="lg:col-span-4 bg-white border border-neutral-200 shadow-sm rounded-2xl p-5 sticky top-28">
                  {/* Header */}
                  <div className={`flex items-center justify-between pb-3 mb-4 border-b-2 ${primaryBorderClass} gap-2`}>
                    <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                      <Flame className={`w-4 h-4 ${primaryColorClass} fill-current`} />
                      <span>TERPOPULER TERKAIT</span>
                    </h3>
                    <span className={`text-[10px] font-extrabold tracking-widest bg-neutral-50 px-2.5 py-1 rounded-md border border-neutral-200 uppercase ${primaryColorClass}`}>
                      TRENDING
                    </span>
                  </div>

                  {/* List of popular items */}
                  <div className="flex flex-col divide-y divide-neutral-100">
                    {(popularArticles.length > 0 ? popularArticles : relatedArticles.slice(0, 5)).map((item, index) => {
                      const catName = getCategoryName(item.categoryId);
                      const itemUrl = `${routePrefix}/${slugify(catName)}/${slugify(item.title)}`;
                      const rankStr = String(index + 1).padStart(2, '0');
                      
                      const rankColor = index === 0 
                        ? primaryColorClass 
                        : 'text-neutral-400';

                      const rawViews = (item.views && item.views > 100) 
                        ? item.views 
                        : (16800 - index * 2450 + ((item.title.length * 89) % 950));
                      const formattedViews = rawViews.toLocaleString('id-ID');

                      return (
                        <Link 
                          key={item.id || index}
                          to={itemUrl}
                          className="py-3.5 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                        >
                          {/* Rank Number */}
                          <span className={`text-2xl font-black font-display shrink-0 w-8 text-center ${rankColor}`}>
                            {rankStr}
                          </span>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${primaryColorClass}`}>
                              {catName}
                            </span>
                            <h4 className={`text-xs sm:text-sm font-bold text-neutral-900 leading-snug line-clamp-2 transition-colors ${hoverTitleClass}`}>
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <Eye size={11} />
                                {formattedViews} pembaca
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

              </div>
            </section>
          );
        })()}
      </main>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxImage(null)}
        >
          {/* Lightbox Header Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between z-10 text-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-bold text-neutral-200 backdrop-blur-md border border-white/10">
                Pratinjau Foto Berita
              </span>
              {lightboxImage.caption && (
                <span className="text-xs text-neutral-400 max-w-md truncate hidden sm:inline-block">
                  {lightboxImage.caption}
                </span>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 3))}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 flex items-center gap-1"
                title="Perbesar (Zoom In)"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 0.7))}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 flex items-center gap-1"
                title="Perkecil (Zoom Out)"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                title="Reset Ukuran"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all ml-2 shadow-lg"
                title="Tutup (Esc)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Image Stage */}
          <div 
            className="flex-1 w-full flex items-center justify-center overflow-auto my-4 relative cursor-grab active:cursor-grabbing"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.caption || 'Full view'}
              loading="lazy"
              style={{ aspectRatio: '16/9', transform: `scale(${zoomLevel})` }}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-200"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Caption Footer */}
          {lightboxImage.caption && (
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 text-center z-10" onClick={e => e.stopPropagation()}>
              <p className="text-xs sm:text-sm text-neutral-200 font-medium">
                {lightboxImage.caption}
              </p>
            </div>
          )}
        </div>
      )}

      <Footer portal={activePortal} />
    </div>
  );
}
