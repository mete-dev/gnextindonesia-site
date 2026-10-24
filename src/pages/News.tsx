import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  Share2,
  Check,
  Flame,
  Clock,
  Search,
  TrendingUp,
  Newspaper,
  ChevronRight,
  Radio,
  Eye,
  Bookmark,
  Sparkles,
  Send,
  Play,
  X
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { slugify, filterValidArticles, getCleanExcerpt } from '../data/news';
import { supabase } from '../lib/supabase';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { Article, Category } from './studio/types';
import { getTrendingHeadlineCandidates, getPopularArticles, parseArticleDate, formatDate, getLatestTickerArticles, getBeritaUtama, getTerpopulerHarian, getTerpopulerMingguan, getSorotanUtama } from '../lib/trending';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';
import { NewsFeedSkeleton } from '../components/NewsSkeletons';
import { trackPortalVisit } from '../lib/tracker';
import BlurImage from '../components/BlurImage';
import Breadcrumbs from '../components/Breadcrumbs';

const getBasePath = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname.toLowerCase();
      if (hostname.startsWith('news.')) return '';
    }
    return '/news';
  };

const defaultCategories: Category[] = [
  { id: 'cat-ekonomi', name: 'Ekonomi & Bisnis', slug: 'ekonomi-bisnis' },
  { id: 'cat-kreatif', name: 'Kreatif & Media', slug: 'kreatif-media' },
  { id: 'cat-teknologi', name: 'Teknologi', slug: 'teknologi' },
  { id: 'cat-budaya', name: 'Gaya Hidup & Budaya', slug: 'gaya-hidup-budaya' },
];

export interface FokusTopic {
  id: string;
  title: string;
  hashtag: string;
  keywords: string[];
  image: string;
  description: string;
  tag: string;
}

export function getDynamicFokusTopics(allArticles: Article[], categoriesGetter: (id: string) => string): FokusTopic[] {
  const candidates: Omit<FokusTopic & { count: number }, 'count'>[] = [
    {
      id: 'fokus-umkm',
      title: 'Akselerasi UMKM & Ekonomi Kreatif',
      hashtag: '#UMKMKreatifJatim',
      keywords: ['umkm', 'kreatif', 'creative', 'ekonomi', 'bisnis', 'investasi', 'dana'],
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&h=300&q=80',
      description: 'Liputan mendalam tentang kebangkitan usaha kecil, inkubasi startup digital, dan perluasan pangsa ekspor produk kerajinan Jawa Timur.',
      tag: 'Ekonomi Kreatif'
    },
    {
      id: 'fokus-teknologi',
      title: 'Inovasi Teknologi Nusantara',
      hashtag: '#TechNusantara',
      keywords: ['teknologi', 'iot', 'cerdas', 'smart', 'internet of things', 'digital', 'mobil listrik'],
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&h=300&q=80',
      description: 'Sajian perkembangan teknologi terapan, riset mandiri mahasiswa, kecerdasan buatan, dan modernisasi pertanian berbasis internet.',
      tag: 'Generasi Kreatif'
    },
    {
      id: 'fokus-wisata',
      title: 'Pesona Wisata & Budaya Jawa Timur',
      hashtag: '#PesonaJatim',
      keywords: ['wisata', 'budaya', 'semeru', 'pariwisata', 'kearifan lokal', 'seni', 'batik', 'tradisional'],
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&h=300&q=80',
      description: 'Kumpulan sorotan kearifan lokal, pelestarian warisan budaya, dan pemulihan objek wisata berbasis masyarakat adat.',
      tag: 'Akselerasi Karya'
    },
    {
      id: 'fokus-infrastruktur',
      title: 'Konektivitas Tol & Transportasi Jatim',
      hashtag: '#TolTransJawa',
      keywords: ['tol', 'infrastruktur', 'banyuwangi', 'probolinggo', 'konektivitas', 'jalan', 'transportasi'],
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=300&q=80',
      description: 'Perkembangan pembangunan tol Trans Jawa lintas daerah, kemudahan logistik, dan konektivitas jalur darat.',
      tag: 'Infrastruktur Jatim'
    },
    {
      id: 'fokus-pangan',
      title: 'Swasembada & Ketahanan Tani Modern',
      hashtag: '#TaniMakmur',
      keywords: ['pangan', 'pertanian', 'padi', 'panen', 'irigasi', 'organik', 'pupuk', 'petani'],
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&h=300&q=80',
      description: 'Liputan panen raya komoditas pangan pokok, pertanian organik modern, dan ketahanan pangan jangka panjang.',
      tag: 'Pertanian Jatim'
    }
  ];

  const latestTime = allArticles.reduce((max, a) => {
    const d = parseArticleDate(a.date || (a as any).created_at).getTime();
    return d > max ? d : max;
  }, Date.now());

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const scoredCandidates = candidates.map(c => {
    const matchingArticles = allArticles.filter(a => {
      const aTime = parseArticleDate(a.date || (a as any).created_at).getTime();
      const inPast7Days = (latestTime - aTime) <= SEVEN_DAYS_MS;
      if (!inPast7Days) return false;

      const titleLower = a.title.toLowerCase();
      const contentLower = (a.content || '').toLowerCase();
      const catLower = categoriesGetter(a.categoryId).toLowerCase();

      return c.keywords.some(keyword => 
        titleLower.includes(keyword) || 
        contentLower.includes(keyword) || 
        catLower.includes(keyword)
      );
    });

    return {
      ...c,
      count: matchingArticles.length
    };
  });

  const has7DayArticles = scoredCandidates.some(c => c.count > 0);
  if (!has7DayArticles) {
    const scoredAllTime = candidates.map(c => {
      const matchingAllTime = allArticles.filter(a => {
        const titleLower = a.title.toLowerCase();
        const contentLower = (a.content || '').toLowerCase();
        const catLower = categoriesGetter(a.categoryId).toLowerCase();

        return c.keywords.some(keyword => 
          titleLower.includes(keyword) || 
          contentLower.includes(keyword) || 
          catLower.includes(keyword)
        );
      });
      return {
        ...c,
        count: matchingAllTime.length
      };
    });

    return scoredAllTime
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => ({
        ...item,
        tag: `${item.count} Berita Terkait`
      }));
  }

  return scoredCandidates
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => ({
      ...item,
      tag: `${item.count} Berita Terpopuler 7 Hari Ini`
    }));
}

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFokus, setActiveFokus] = useState<FokusTopic | null>(null);
  const [popularTab, setPopularTab] = useState<'harian' | 'mingguan'>('harian');

  const defaultCategoryNames = ['Semua', 'Teknologi', 'Kreatif & Media', 'Hukum', 'Ekonomi & Bisnis', 'Pendidikan', 'Lingkungan', 'Gaya Hidup & Budaya'];
  const dbCategoryNames = categories
    .map((c) => c.name)
    .filter((n) => !['G-Ummah', 'Gummah', 'Ummah', 'Gnext Finance', 'Finance', 'Yo Iki Jatim', 'Lumajang Talks'].includes(n));
  const categoryNames = Array.from(new Set([...defaultCategoryNames, ...dbCategoryNames]));

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPortalVisit('gnext');
    loadData();
  }, []);

  useEffect(() => {
    const qParam = searchParams.get('search') || searchParams.get('q');
    if (qParam !== null) {
      setSearchQuery(qParam);
    }

    const catParam = searchParams.get('category');
    if (catParam) {
      const p = catParam.toLowerCase().trim();
      const matched = categoryNames.find((c) => {
        const lowerC = c.toLowerCase();
        return lowerC.includes(p) || p.includes(lowerC) || slugify(c) === p;
      });
      if (matched) {
        setActiveCategory(matched);
      } else {
        setActiveCategory(catParam.charAt(0).toUpperCase() + catParam.slice(1));
      }
    } else {
      setActiveCategory('Semua');
    }
  }, [searchParams, categories]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'Semua') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slugify(cat) });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPublishedArticlesAndMetadata();

      let fetchedArticles: Article[] = [];
      if (data.articles && data.articles.length > 0) {
        fetchedArticles = data.articles;
      }
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }

      // Jika data kosong karena database tertidur (sleep) atau timeout, gunakan berita cadangan berkualitas tinggi
      if (fetchedArticles.length === 0) {
        fetchedArticles = [
          {
            id: 'fallback-art-1',
            title: 'Sinergi Industri Kreatif Digital Jawa Timur Siap Tembus Pasar Global',
            content: 'Surabaya (GNEXT) - Pusat pengembangan industri kreatif digital Jawa Timur resmi mencatatkan pertumbuhan signifikan kuartal ini. Melalui program kolaborasi lintas komunitas kreatif, para kreator lokal kini dibekali alat produksi termodern serta akses jejaring penerbitan berskala internasional guna memperluas jangkauan pemirsa karya seni mereka secara global.',
            categoryId: 'cat-kreatif',
            authorId: 'fallback-author',
            news_location: 'Surabaya',
            cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'gnext',
            status: 'published'
          },
          {
            id: 'fallback-art-2',
            title: 'Malang Creative Center Jadi Katalis Inkubasi Bisnis Startup Kreatif Daerah',
            content: 'Malang (GNEXT) - Kehadiran pusat kreatif terintegrasi di Malang Raya berhasil mencatatkan peningkatan omzet UMKM hingga 25% melalui akselerasi pemasaran berbasis data. Puluhan inkubator bisnis dirancang khusus untuk memandu generasi muda merintis usaha digital mandiri berbekal modal intelektual dan teknologi nirkabel modern.',
            categoryId: 'cat-ekonomi',
            authorId: 'fallback-author',
            news_location: 'Malang',
            cover_image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'yoikijatim',
            status: 'published'
          },
          {
            id: 'fallback-art-3',
            title: 'Sinergi Pariwisata Lereng Semeru & Kearifan Lokal Terus Diakselerasi',
            content: 'Lumajang (GNEXT) - Peningkatan kapasitas pemandu wisata serta penyediaan sarana penunjang ramah lingkungan menjadi fokus utama program pemulihan ekonomi pariwisata lereng Gunung Semeru. Kolaborasi apik antara pemerintah daerah, masyarakat adat, dan pengembang teknologi kreatif melahirkan aplikasi navigasi desa wisata Lumajang.',
            categoryId: 'cat-budaya',
            authorId: 'fallback-author',
            news_location: 'Lumajang',
            cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'lumajangtalks',
            status: 'published'
          },
          {
            id: 'fallback-art-4',
            title: 'Inovasi Pertanian Cerdas (Smart Agriculture) Berbasis IoT Mengudara di Kediri',
            content: 'Kediri (GNEXT) - Implementasi sensor kelembapan tanah dan penyemprot pupuk nirawak (drone) berbasis internet of things (IoT) mulai diujicobakan pada klaster tani modern di wilayah Kediri. Teknologi ini diharapkan mampu menghemat penggunaan air serta mendongkrak kualitas hasil panen hingga dua kali lipat dibanding metode konvensional.',
            categoryId: 'cat-teknologi',
            authorId: 'fallback-author',
            news_location: 'Kediri',
            cover_image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'yoikijatim',
            status: 'published'
          },
          {
            id: 'fallback-art-5',
            title: 'Eksplorasi Keunikan Batik Tulis Tradisional Ponorogo Lewat Lensa Digital',
            content: 'Ponorogo (GNEXT) - Seniman batik tulis Ponorogo meluncurkan inisiatif digitalisasi motif pusaka guna melestarikan filosofi seni Nusantara dari kepunahan. Dokumentasi visual yang apik dikemas dalam bentuk pameran interaktif tiga dimensi sehingga dapat diakses oleh pecinta seni di seluruh belahan dunia.',
            categoryId: 'cat-budaya',
            authorId: 'fallback-author',
            news_location: 'Ponorogo',
            cover_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'gummah',
            status: 'published'
          },
          {
            id: 'fallback-art-6',
            title: 'Kementerian Pariwisata Alokasikan Dana Hibah Stimulan bagi Kreator Konten Lokal',
            content: 'Jakarta (GNEXT) - Stimulus finansial berskala nasional diluncurkan bagi para pegiat kreatif daerah guna mendukung produksi konten edukatif berkualitas tinggi yang mengangkat potensi pariwisata daerah tersembunyi. GNEXT Studio siap mendampingi proses pelatihan teknis produksi digital terintegrasi.',
            categoryId: 'cat-ekonomi',
            authorId: 'fallback-author',
            news_location: 'Jakarta',
            cover_image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'gnext',
            status: 'published'
          },
          {
            id: 'fallback-art-7',
            title: 'Digitalisasi Sekolah & Akselerasi Kurikulum Berbasis AI di Jawa Timur',
            content: 'Surabaya (GNEXT) - Dinas Pendidikan Provinsi Jawa Timur meluncurkan program digitalisasi sekolah menengah keatas guna mempersiapkan generasi muda yang unggul dalam penguasaan teknologi kecerdasan buatan, pemrograman komputer, dan literasi media digital.',
            categoryId: 'cat-pendidikan',
            authorId: 'fallback-author',
            news_location: 'Surabaya',
            cover_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'gnext',
            status: 'published'
          },
          {
            id: 'fallback-art-8',
            title: 'Bantuan Hukum Gratis & Edukasi Kesadaran Hak Konsumen Bagi Pelaku UMKM',
            content: 'Jakarta (GNEXT) - LBH Nusantara bersama Kementerian Hukum memberikan pendampingan hukum pro-bono serta sertifikasi HAKI bagi ratusan wirausahawan muda daerah agar produk lokal terindungi dari pemalsuan merek dan sengketa hak cipta.',
            categoryId: 'cat-hukum',
            authorId: 'fallback-author',
            news_location: 'Jakarta',
            cover_image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'gnext',
            status: 'published'
          },
          {
            id: 'fallback-art-9',
            title: 'Konservasi Hutan Mangrove & Gerakan Penghijauan Pesisir Pantai Jawa Timur',
            content: 'Banyuwangi (GNEXT) - Ratusan relawan pemuda dan komunitas pecinta lingkungan menanam 10.000 bibit mangrove di kawasan pesisir guna mencegah abrasi air laut sekaligus memulihkan ekosistem hayati laut daerah.',
            categoryId: 'cat-lingkungan',
            authorId: 'fallback-author',
            news_location: 'Banyuwangi',
            cover_image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            portal: 'gnext',
            status: 'published'
          }
        ];
      }

      // Sort strictly by published date descending (newest published articles at the top)
      const prioritizedArticles = [...fetchedArticles].sort((a, b) => {
        const dateA = parseArticleDate(a.date, (a as any).created_at).getTime();
        const dateB = parseArticleDate(b.date, (b as any).created_at).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return ((b as any).views || 0) - ((a as any).views || 0);
      });

      setArticles(filterValidArticles(prioritizedArticles));

      let fetchedCategories: Category[] = data.categories || [];
      if (fetchedCategories.length === 0) {
        fetchedCategories = [
          { id: 'cat-ekonomi', name: 'Ekonomi & Bisnis', slug: 'ekonomi-bisnis' },
          { id: 'cat-kreatif', name: 'Kreatif & Media', slug: 'kreatif-media' },
          { id: 'cat-teknologi', name: 'Teknologi', slug: 'teknologi' },
          { id: 'cat-budaya', name: 'Gaya Hidup & Budaya', slug: 'gaya-hidup-budaya' },
        ];
      }
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to load portal news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catIdOrArticle: any) => {
    if (!catIdOrArticle) return 'Kabar Baik';
    if (typeof catIdOrArticle === 'object') {
      if (catIdOrArticle.category_name) return catIdOrArticle.category_name;
      if (catIdOrArticle.category) return catIdOrArticle.category;
      if (catIdOrArticle.sub_category) return catIdOrArticle.sub_category;
      catIdOrArticle = catIdOrArticle.categoryId || catIdOrArticle.category_id || '';
    }

    const catId = String(catIdOrArticle || '');
    if (!catId || catId.toLowerCase() === 'unknown') return 'Kabar Baik';

    const found = categories.find(
      (c) => c.id === catId || c.name.toLowerCase() === catId.toLowerCase() || c.slug === catId.toLowerCase()
    );
    if (found) return found.name;

    const lowerId = catId.toLowerCase();
    if (lowerId.includes('saintek')) return 'Saintek';
    if (lowerId.includes('lingkungan')) return 'Lingkungan';
    if (lowerId.includes('ekonomi') || lowerId.includes('bisnis') || lowerId.includes('keuangan')) return 'Ekonomi';
    if (lowerId.includes('pariwisata') || lowerId.includes('wisata')) return 'Pariwisata';
    if (lowerId.includes('pendidikan')) return 'Pendidikan';
    if (lowerId.includes('hukum')) return 'Hukum';
    if (lowerId.includes('teknologi')) return 'Teknologi';
    if (lowerId.includes('kreatif') || lowerId.includes('media')) return 'Kreatif & Media';
    if (lowerId.includes('budaya')) return 'Budaya';
    if (lowerId.includes('sosial')) return 'Sosial';
    if (lowerId.includes('ummah') || lowerId.includes('islam')) return 'Ummah';
    if (lowerId.includes('indonesiana') || lowerId.includes('nusantara')) return 'Nusantara';
    if (lowerId.includes('kabar')) return 'Kabar Baik';

    // If catId is raw UUID string, return default category name instead of raw UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId);
    if (isUuid) return 'Kabar Baik';

    return catId.replace(/^gnn-cat-/, '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80';

  const extractFirstImage = (content?: string) => {
    if (!content) return null;
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
    if (mdMatch && mdMatch[1]?.trim()) return mdMatch[1].trim();
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/);
    if (htmlMatch && htmlMatch[1]?.trim()) return htmlMatch[1].trim();
    return null;
  };

  const getArticleImage = (article?: Article | null) => {
    if (!article) return DEFAULT_COVER;
    const cover = (article as any).cover_image;
    if (typeof cover === 'string' && cover.trim()) return cover.trim();
    const extracted = extractFirstImage(article.content);
    if (extracted) return extracted;
    return DEFAULT_COVER;
  };

  const handleShareArticle = async (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();

    const catName = getCategoryName(article.categoryId);
    const fullUrl = `${window.location.origin}/news/${slugify(catName)}/${slugify(
      article.title
    )}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          url: fullUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const catName = getCategoryName(a.categoryId || (a as any).category_id);
    const activeLower = activeCategory.toLowerCase().trim();
    let matchesCat = activeCategory === 'Semua' || activeLower === 'semua';

    if (!matchesCat) {
      const catLower = catName.toLowerCase().trim();
      const catSlug = slugify(catName);
      const activeSlug = slugify(activeCategory);
      const aPortal = ((a as any).portal || '').toLowerCase();
      const aSubCat = ((a as any).sub_category || '').toLowerCase().trim();
      const aTitle = a.title.toLowerCase();
      const aContent = (a.content || '').toLowerCase();

      matchesCat =
        (catLower.length > 0 && activeLower.length > 0 && (catLower === activeLower || catLower.includes(activeLower) || activeLower.includes(catLower))) ||
        (catSlug.length > 0 && activeSlug.length > 0 && (catSlug === activeSlug || catSlug.includes(activeSlug) || activeSlug.includes(catSlug))) ||
        (aSubCat.length > 0 && activeLower.length > 0 && (aSubCat.includes(activeLower) || activeLower.includes(aSubCat)));
    }

    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content && a.content.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesFokus = true;
    if (activeFokus) {
      const titleLower = a.title.toLowerCase();
      const contentLower = (a.content || '').toLowerCase();
      const catLower = catName.toLowerCase();
      const matchesKeywords = activeFokus.keywords.some(keyword => 
        titleLower.includes(keyword) || 
        contentLower.includes(keyword) || 
        catLower.includes(keyword)
      );

      // Enforce 7-day rule relative to latest article date in system
      const latestTime = articles.reduce((max, art) => {
        const d = parseArticleDate(art.date || (art as any).created_at).getTime();
        return d > max ? d : max;
      }, Date.now());
      const aTime = parseArticleDate(a.date || (a as any).created_at).getTime();
      const inPast7Days = (latestTime - aTime) <= (7 * 24 * 60 * 60 * 1000);

      // Use 7-day constraint if the selected topic had 7-day occurrences.
      // Otherwise, fallback to all-time occurrences to ensure results.
      const has7DayArticles = activeFokus.tag.includes('7 Hari');
      if (has7DayArticles) {
        matchesFokus = matchesKeywords && inPast7Days;
      } else {
        matchesFokus = matchesKeywords;
      }
    }

    return matchesCat && matchesSearch && matchesFokus;
  });

  // Limit News page feed to maximum of 16 articles on the main page
  const displayedArticles = filteredArticles.slice(0, 16);

  // Automatically calculate top Fokus topics in the past 7 days based on highest news volume
  const dynamicFokusTopics = getDynamicFokusTopics(articles, getCategoryName);

  // 1. Berita Utama: Berita pembaca terbanyak dalam 3 hari terakhir
  const beritaUtamaList = getBeritaUtama(articles, 'national');
  const heroMain = beritaUtamaList[0] || null;
  const heroSub = beritaUtamaList.slice(1, 4);

  // 2. Terpopuler: Harian vs Mingguan
  const popularHarian = getTerpopulerHarian(articles, 5);
  const popularMingguan = getTerpopulerMingguan(articles, 5);
  const popularArticles = popularTab === 'harian' ? popularHarian : popularMingguan;

  // 3. Sorotan Utama: Berita tanding 7 hari terakhir
  const heroIds = new Set([heroMain?.id, ...heroSub.map(s => s.id)].filter(Boolean));
  const sorotanUtamaList = getSorotanUtama(articles, 5, Array.from(heroIds));

  // Today's date string in Indonesian
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });


  // Lightweight Tracking Pixel for Portal Home
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewedKey = 'viewed_portal_' + 'gnext';
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        
        // Fire and forget pixel for general portal visits
        // We track it generally as "portal_visit"
        const img = new Image();
        img.src = `/api/track.gif?portal=${'gnext'}&_t=${new Date().getTime()}`;
      }
    }
  }, ['gnext']);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white overflow-x-hidden">
      <SEO
        title="GNEXT NEWS - Portal Berita Kreatif & Ekonomi Nusantara"
        description="Portal berita terkini seputar industri kreatif, ekonomi digital, teknologi, dan budaya muda Indonesia."
        path="/news"
      />
      <Navbar />

      {/* RUNNING TEXT (TICKER) KHUSUS PAGE NEWS */}
      <div className="pt-20 sm:pt-24 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-3xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-9 sm:h-10 flex items-center overflow-hidden">
          {/* Ticker Badge */}
          <div className="flex items-center gap-2 bg-neutral-900 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full shrink-0 mr-3.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Kabar Terkini</span>
          </div>

          {/* Marquee Articles */}
          <div className="flex-1 overflow-hidden relative text-xs text-neutral-800">
            {articles.length > 0 ? (
              <div className="whitespace-nowrap inline-block animate-marquee hover:[animation-play-state:paused]">
                {[...articles.slice(0, 10), ...articles.slice(0, 10), ...articles.slice(0, 10)].map((a, i) => (
                  <span key={`${a.id || 'ticker'}-${i}`} className="inline-flex items-center mx-3.5">
                    <Link
                      to={`${getBasePath()}/${slugify(getCategoryName(a))}/${slugify(a.title)}`}
                      className="hover:text-red-600 transition-colors text-neutral-800 font-medium hover:underline text-[11px] sm:text-xs"
                    >
                      {a.title}
                    </Link>
                    <span className="ml-3.5 text-neutral-300 select-none">•</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-neutral-400 text-xs">Menyajikan berita dan wawasan terkini nusantara...</span>
            )}
          </div>
        </div>
      </div>

      <main className="pt-6 sm:pt-8 pb-16">

        {loading ? (
          <NewsFeedSkeleton portal="gnext" />
        ) : (
          <>
            {/* CNN INDONESIA STYLE PREMIUM HOME GRID */}
            {heroMain && !searchQuery && activeCategory === 'Semua' && (
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-5 flex flex-col gap-4">
                
                {/* PRIMARY HEADLINE GRID (Left Hero Block + Right Popular Column) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* LEFT PRIMARY BLOCK (8 Cols) - Auto flush height matching right column */}
                  <div className="lg:col-span-8 flex flex-col justify-between gap-3.5 h-full">
                    
                    {/* Main Hero Article Card - Modern minimalist card matching homepage */}
                    <Link
                      to={`${getBasePath()}/${slugify(getCategoryName(heroMain))}/${slugify(heroMain.title)}`}
                      className="group bg-white p-5 sm:p-6 md:p-7 rounded-3xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-900/30 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 flex-1 min-h-[190px]"
                    >
                      {/* Left Side: Editorial Content */}
                      <div className="flex-1 flex flex-col justify-between h-full min-w-0 w-full">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider">
                              Berita Utama
                            </span>
                            <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold uppercase tracking-wider border border-neutral-200/60">
                              {getCategoryName(heroMain)}
                            </span>
                          </div>
                          
                          <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-[27px] font-display font-bold text-neutral-900 leading-snug tracking-tight group-hover:text-red-600 transition-colors duration-200 line-clamp-2 md:line-clamp-3">
                            {heroMain.title}
                          </h2>
                          
                          {heroMain.content && (
                            <p className="text-neutral-600 text-xs sm:text-[13px] leading-relaxed line-clamp-2 hidden sm:block font-normal">
                              {getCleanExcerpt(heroMain.content, 140)}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                          <span className="font-semibold tracking-wide text-neutral-600">
                            {heroMain.news_location || 'Nasional'}
                          </span>
                          <span className="font-medium flex items-center gap-1.5 text-neutral-400">
                            <Clock size={12} />
                            {formatDate(heroMain.date, (heroMain as any).created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Visual Cover */}
                      <div className="w-full md:w-64 lg:w-72 h-44 sm:h-48 md:h-48 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 relative shadow-2xs">
                        <BlurImage
                          src={getArticleImage(heroMain)}
                          alt={heroMain.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </Link>

                    {/* Secondary Horizontal Items Side-By-Side */}
                    {heroSub.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {heroSub.slice(0, 2).map((sub, idx) => (
                          <Link
                            key={sub.id || idx}
                            to={`${getBasePath()}/${slugify(getCategoryName(sub))}/${slugify(sub.title)}`}
                            className="group bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 flex gap-3.5 hover:border-neutral-900/30 hover:shadow-2xs transition-all items-center h-full"
                          >
                            <div className="w-24 h-22 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100 relative">
                              <BlurImage
                                src={getArticleImage(sub)}
                                alt={sub.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                            </div>
                            <div className="flex flex-col justify-between min-w-0 flex-1 h-full py-0.5">
                              <div>
                                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                                  {getCategoryName(sub)}
                                </span>
                                <h4 className="text-xs sm:text-[13px] font-display font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                                  {sub.title}
                                </h4>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 pt-1.5 border-t border-neutral-100 font-medium">
                                <span>{sub.news_location || 'Nasional'}</span>
                                <span>{formatDate(sub.date, (sub as any).created_at)}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* RIGHT SIDEBAR POPULAR LIST (4 Cols - "TERPOPULER HARIAN") */}
                  <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3 gap-2">
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                          <TrendingUp size={16} className="text-red-600" />
                          <span>Terpopuler Harian</span>
                        </h3>
                        <span className="text-[10px] text-neutral-500 font-bold tracking-wider bg-neutral-100 px-2.5 py-0.5 rounded-full uppercase">
                          24 Jam
                        </span>
                      </div>

                      <div className="flex flex-col divide-y divide-neutral-100">
                        {popularHarian.slice(0, 5).map((pop, idx) => (
                          <Link
                            key={pop.id || idx}
                            to={`${getBasePath()}/${slugify(getCategoryName(pop))}/${slugify(pop.title)}`}
                            className="py-3 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                          >
                            <span className={`text-xl font-bold font-display shrink-0 w-6 text-center ${
                              idx === 0 ? 'text-red-600' : 'text-neutral-400'
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                                {getCategoryName(pop)}
                              </span>
                              <h4 className="text-xs sm:text-[13px] font-display font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                                {pop.title}
                              </h4>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. MID GRID HEADLINES (Only if more than 3 articles exist) */}
                {articles.length > 3 && (
                  <div className="border-t border-neutral-200/90 pt-4">
                    <div className="pb-2 border-b border-neutral-200 mb-3">
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                        RAGAM BERITA TERKINI
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(() => {
                        const heroIds = new Set([heroMain?.id, ...heroSub.map(s => s.id)].filter(Boolean));
                        const distinctArticles = articles.filter(a => !heroIds.has(a.id));
                        const listToDisplay = distinctArticles.slice(0, 3);
                        return listToDisplay.map((art, idx) => (
                          <Link
                            key={art.id || idx}
                            to={`${getBasePath()}/${slugify(getCategoryName(art))}/${slugify(art.title)}`}
                            className="group flex flex-col gap-1 p-3 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-900/30 transition-all"
                          >
                            <h4 className="text-xs sm:text-sm font-display font-bold text-neutral-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                              {art.title}
                            </h4>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">
                              {getCategoryName(art)}
                            </span>
                          </Link>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* 5. RED ACCENT SPECIAL SEGMENT ("SOROTAN UTAMA") */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-2">
                  
                  {/* CLEAN MODERN MINIMALIST FOCUS BOX */}
                  <div className="lg:col-span-12 bg-white text-neutral-900 rounded-3xl p-6 sm:p-7 md:p-8 border border-neutral-200/90 shadow-2xs relative overflow-hidden flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 z-10">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full" />
                        <span>SOROTAN UTAMA</span>
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full cursor-pointer hover:bg-neutral-200 transition-colors">
                        Kabar Terpilih
                      </span>
                    </div>

                    {/* Content split in clean box */}
                    {sorotanUtamaList.length > 0 ? (
                      (() => {
                        const focusArticle = sorotanUtamaList[0];
                        const subSorotan = sorotanUtamaList.slice(1, 4).length > 0
                          ? sorotanUtamaList.slice(1, 4)
                          : articles.filter(a => a.id !== focusArticle?.id).slice(0, 3);

                        return (
                          <>
                            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start w-full z-10">
                              {/* Focus Image - Proportional aspect ratio & controlled height */}
                              <Link 
                                to={`${getBasePath()}/${slugify(getCategoryName(focusArticle))}/${slugify(focusArticle.title)}`}
                                className="w-full md:w-[45%] lg:w-[40%] rounded-2xl overflow-hidden bg-neutral-100 shrink-0 relative group block aspect-[16/10] sm:aspect-[16/9] md:h-56 lg:h-64 shadow-2xs"
                              >
                                <BlurImage
                                  src={getArticleImage(focusArticle)}
                                  alt={focusArticle.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              </Link>

                              {/* Focus Content Text */}
                              <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200/60 px-2.5 py-0.5 rounded-full inline-block">
                                      {getCategoryName(focusArticle)}
                                    </span>
                                    <span className="text-xs text-neutral-400">•</span>
                                    <span className="text-xs text-neutral-500 font-medium">
                                      {focusArticle.news_location || 'Nasional'}
                                    </span>
                                  </div>

                                  <Link 
                                    to={`${getBasePath()}/${slugify(getCategoryName(focusArticle))}/${slugify(focusArticle.title)}`}
                                    className="group-hover:text-red-600 transition-colors block"
                                  >
                                    <h4 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-neutral-900 leading-snug mb-3 hover:text-red-600 transition-colors line-clamp-3">
                                      {focusArticle.title}
                                    </h4>
                                  </Link>
                                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3 font-normal">
                                    {getCleanExcerpt(focusArticle.content, 160)}
                                  </p>
                                </div>
                                <span className="text-xs text-neutral-400 mt-4 block font-medium">
                                  {formatDate(focusArticle.date, (focusArticle as any).created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Clean Quick-Links footer for bottom 3 titles */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 pt-5 z-10">
                              {subSorotan.map((art, idx) => (
                                <Link
                                  key={art.id || idx}
                                  to={`${getBasePath()}/${slugify(getCategoryName(art))}/${slugify(art.title)}`}
                                  className="text-neutral-800 hover:text-red-600 transition-colors font-medium text-xs sm:text-sm line-clamp-2 leading-snug border-l-2 border-neutral-200 hover:border-red-600 pl-3 py-1"
                                >
                                  {art.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <div className="z-10 py-8 text-center text-red-100 font-semibold text-sm">
                        Koleksi artikel sorotan utama sedang disiapkan redaksi.
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* MAIN BODY GRID: ARTICLE FEED + TERPOPULER SIDEBAR */}
            <section id="news-feed-container" className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-6 scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT FEED (8 COLS) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                  {/* FOKUS BANNER INDICATOR */}
                  {activeFokus && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 relative overflow-hidden shadow-sm animate-fade-in">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full pointer-events-none" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            Fokus Redaksi
                          </span>
                          <span className="text-xs font-black text-red-600 font-mono">
                            {activeFokus.hashtag}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg md:text-xl font-black text-neutral-950 mt-1 leading-tight">
                          {activeFokus.title}
                        </h4>
                        <p className="text-xs text-neutral-600 mt-1 max-w-2xl font-medium leading-relaxed">
                          {activeFokus.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveFokus(null)}
                        className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shrink-0 flex items-center gap-1.5 transition-all self-end sm:self-auto shadow-sm"
                      >
                        <X size={12} />
                        <span>Tutup Fokus</span>
                      </button>
                    </div>
                  )}

                  {/* Section Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 mb-2">
                    <h3 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                      <Flame size={20} className="text-red-600" />
                      <span>
                        {searchQuery
                          ? `Hasil Pencarian: "${searchQuery}"`
                          : activeFokus 
                            ? `Fokus: ${activeFokus.title}`
                            : activeCategory === 'Semua' 
                              ? 'Kabar Terbaru' 
                              : `Kategori: ${activeCategory}`
                        }
                      </span>
                    </h3>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors uppercase flex items-center gap-1"
                      >
                        <X size={14} />
                        <span>Hapus Pencarian</span>
                      </button>
                    )}
                  </div>

              {loading ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200">
                  <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-mono text-neutral-500">Memuat berita terkini...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200">
                  <p className="text-sm text-neutral-600 font-medium">
                    Tidak ditemukan berita untuk kriteria ini.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('Semua');
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {displayedArticles.map((article) => {
                      const catName = getCategoryName(article.categoryId);
                      const image = getArticleImage(article);

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          key={article.id}
                          className="group bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 hover:border-neutral-900/30 hover:shadow-sm transition-all"
                        >
                          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
                            {/* Article Image */}
                            <Link
                              to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                              className="w-full aspect-[16/10] sm:w-56 sm:h-36 sm:aspect-auto rounded-2xl overflow-hidden shrink-0 bg-neutral-100 relative group-hover:opacity-95 block"
                            >
                              <BlurImage
                                src={image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                                <span className="bg-white/95 backdrop-blur-sm text-neutral-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs border border-neutral-200/50">
                                  {catName}
                                </span>
                              </div>
                            </Link>

                            {/* Article Text Content */}
                            <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-0.5">
                              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 font-sans">
                                <span className="flex items-center gap-1 text-neutral-500">
                                  <Clock size={12} />
                                  {article.date || 'Baru Saja'}
                                </span>

                                <button
                                  onClick={(e) => handleShareArticle(e, article)}
                                  className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                                  title="Bagikan artikel"
                                >
                                  {copiedId === article.id ? (
                                    <Check size={14} className="text-emerald-600" />
                                  ) : (
                                    <Share2 size={14} />
                                  )}
                                </button>
                              </div>

                              <Link
                                to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                className="block"
                              >
                                <h4 className="text-base sm:text-lg md:text-xl font-normal text-neutral-900 leading-snug mb-2 group-hover:text-red-600 transition-colors">
                                  {article.title}
                                </h4>
                              </Link>

                              <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                                {getCleanExcerpt(article.content, 140)}
                              </p>

                              <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-100">
                                <Link
                                  to={`${getBasePath()}/${slugify(catName)}/${slugify(article.title)}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 uppercase tracking-wider hover:underline"
                                >
                                  <span>Baca Berita</span>
                                  <ChevronRight size={14} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: TERPOPULER MINGGUAN (4 COLS) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* TERPOPULER RANKING CARD */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-3 mb-4 gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                    <Flame size={18} className="text-red-600" />
                    <span>TERPOPULER MINGGUAN</span>
                  </h3>
                  <span className="text-[10px] text-red-600 font-extrabold tracking-widest bg-red-50 px-2.5 py-1 rounded-md border border-red-200 uppercase">
                    7 HARI
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-neutral-100">
                  {popularMingguan.slice(0, 5).map((pop, idx) => (
                    <Link
                      key={pop.id || idx}
                      to={`${getBasePath()}/${slugify(getCategoryName(pop.categoryId))}/${slugify(
                        pop.title
                      )}`}
                      className="py-3.5 group flex gap-3.5 items-start hover:bg-neutral-50 px-2 rounded-xl transition-colors"
                    >
                      {/* Number Rank Badge */}
                      <span
                        className={`text-2xl font-black font-display shrink-0 w-8 text-center ${
                          idx === 0
                            ? 'text-red-600'
                            : 'text-neutral-400'
                        }`}
                      >
                        0{idx + 1}
                      </span>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-0.5">
                          {getCategoryName(pop.categoryId)}
                        </span>
                        <h4 className="text-xs sm:text-sm font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                          {pop.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <Eye size={11} />
                            {(pop as any).views || 1400 + idx * 300} pembaca
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </section>
        </>
        )}
      </main>

      <Footer portal="company" />
    </div>
  );
}
