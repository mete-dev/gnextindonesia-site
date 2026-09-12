import { ALL_PORTALS, getPortalById } from "../../lib/portals";
import { GUMMAH_SUBCATS, FINANCE_SUBCATS, CATEGORIES_CONFIG, getCategoryType, validateSubCategory } from "../../lib/categoriesConfig";
const getPortalStyle = (portalId: string) => { if (portalId === "yoikijatim") return "bg-orange-50 text-orange-600 border-orange-200"; if (portalId === "lumajangtalks") return "bg-lumajang-50 text-lumajang-400 border-lumajang-200"; if (portalId?.startsWith("lentera")) return "bg-blue-50 text-blue-600 border-blue-200"; return "bg-red-50 text-red-600 border-red-200"; };
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { 
  Plus, Edit2, Trash2, Search, X, Bold, Italic, Link as LinkIcon, 
  List, Heading1, Heading2, ListOrdered, Image, Archive, Eye, 
  Check, Clock, MapPin, ExternalLink, Filter, ArrowLeft, Camera, FileText,
  Share2, Globe, MessageCircle, Sparkles, Tag, Video, Table, Quote, Undo2, Redo2, RotateCcw,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Database, Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clearArticlesCache } from '../../lib/cachedFetch';
import { Article, Category, User } from './types';
import { logAudit } from '../../lib/audit';
import { indonesiaLocations, EAST_JAVA_CITIES, LUMAJANG_DISTRICTS } from '../../data/indonesiaLocations';
import { HeroImagePreview } from '../../components/studio/HeroImagePreview';
import { ImageCropperModal } from '../../components/studio/ImageCropperModal';
import { BackupRestoreModal } from '../../components/studio/BackupRestoreModal';
import { compressImageForNews } from '../../lib/imageCompressor';

const compressImageHighQuality = async (file: File): Promise<string> => {
  return compressImageForNews(file);
};

const CURATED_GALLERY_COVERS: Array<{
  cover_image: string;
  image_caption: string;
  image_credit: string;
  title?: string;
  date?: string;
}> = [
  {
    cover_image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1000&auto=format&fit=crop",
    image_caption: "Gedung Pemerintahan dan Kegiatan Politik",
    image_credit: "Unsplash / Editorial"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1000&auto=format&fit=crop",
    image_caption: "Grafik Saham, Pertumbuhan Ekonomi & Bisnis",
    image_credit: "Unsplash / Business"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop",
    image_caption: "Inovasi Teknologi Digital & Mikrochip",
    image_credit: "Unsplash / Tech"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop",
    image_caption: "Kompetisi Olahraga & Semangat Atletik",
    image_credit: "Unsplash / Sports"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1429552077091-836cd5e27055?w=1000&auto=format&fit=crop",
    image_caption: "Kondisi Cuaca Ekstrem & Penanganan Bencana",
    image_credit: "Unsplash / Weather"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&auto=format&fit=crop",
    image_caption: "Suasana Belajar Mengajar di Lembaga Pendidikan",
    image_credit: "Unsplash / Education"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1000&auto=format&fit=crop",
    image_caption: "Layanan Kesehatan & Fasilitas Kedokteran",
    image_credit: "Unsplash / Health"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&auto=format&fit=crop",
    image_caption: "Timbangan Keadilan, Hukum & Kriminal",
    image_credit: "Unsplash / Law"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&fit=crop",
    image_caption: "Keindahan Kebudayaan Nusantara & Pariwisata",
    image_credit: "Unsplash / Tourism"
  },
  {
    cover_image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop",
    image_caption: "Suasana Konferensi Pers Resmi & Pertemuan Media",
    image_credit: "Unsplash / Press"
  }
];



export default function NewsManager({ currentUser }: { currentUser: User }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [yoikiLocations, setYoikiLocations] = useState<string[]>([]);
  const [lumajangLocations, setLumajangLocations] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({});
  const [previewImage, setPreviewImage] = useState<{ filename: string, dataUrl: string, isUploading: boolean, isCover?: boolean } | null>(null);
  const [cropTarget, setCropTarget] = useState<{ file: File; isCover: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [portalFilter, setPortalFilter] = useState<string>('all');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState('');
  const [locSearch, setLocSearch] = useState('');
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const savedRangeRef = useRef<Range | null>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (contentEditableRef.current && contentEditableRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (selection && savedRangeRef.current) {
      try {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      } catch (e) {
        // Fallback
      }
    }
  };

  const handleOpenYouTube = () => {
    saveSelection();
    setYoutubeModalOpen(true);
  };

  const handleOpenInstagram = () => {
    saveSelection();
    setInstagramModalOpen(true);
  };

  const handleOpenTable = () => {
    saveSelection();
    setTableModalOpen(true);
  };

  const slashOptions = [
    { id: 'youtube', label: 'Video YouTube', desc: 'Sisipkan pemutar video YouTube responsif', icon: Video, color: 'text-red-600 bg-red-50' },
    { id: 'instagram', label: 'Pratinjau Instagram', desc: 'Sisipkan pratinjau kiriman/video Instagram', icon: Share2, color: 'text-pink-600 bg-pink-50' },
    { id: 'table', label: 'Tabel Data', desc: 'Sisipkan tabel terstruktur rapi', icon: Table, color: 'text-blue-600 bg-blue-50' },
    { id: 'image', label: 'Sisipkan Gambar', desc: 'Unggah dan sisipkan gambar di naskah', icon: Image, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'quote', label: 'Kutipan Narsum', desc: 'Buat blok kutipan narasumber', icon: Quote, color: 'text-amber-600 bg-amber-50' },
    { id: 'h2', label: 'Sub-Judul (H2)', desc: 'Judul bagian utama', icon: Heading1, color: 'text-purple-600 bg-purple-50' },
    { id: 'h3', label: 'Sub-Judul Kecil (H3)', desc: 'Judul sub-bagian kecil', icon: Heading2, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'alignLeft', label: 'Rata Kiri', desc: 'Ratakan teks ke kiri', icon: AlignLeft, color: 'text-neutral-600 bg-neutral-50' },
    { id: 'alignCenter', label: 'Rata Tengah', desc: 'Ratakan teks ke tengah', icon: AlignCenter, color: 'text-neutral-600 bg-neutral-50' },
    { id: 'alignRight', label: 'Rata Kanan', desc: 'Ratakan teks ke kanan', icon: AlignRight, color: 'text-neutral-600 bg-neutral-50' },
    { id: 'alignJustify', label: 'Rata Kiri Kanan', desc: 'Ratakan teks rata kiri dan kanan (justify)', icon: AlignJustify, color: 'text-neutral-600 bg-neutral-50' },
  ].filter(opt => opt.label.toLowerCase().includes(slashQuery.toLowerCase()) || opt.id.toLowerCase().includes(slashQuery.toLowerCase()));

  const executeSlashCommand = (action: 'youtube' | 'instagram' | 'table' | 'image' | 'quote' | 'h2' | 'h3' | 'alignLeft' | 'alignCenter' | 'alignRight' | 'alignJustify') => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent;
        const slashIdx = text.lastIndexOf('/');
        if (slashIdx !== -1) {
          node.textContent = text.substring(0, slashIdx);
          range.setStart(node, node.textContent.length);
          range.setEnd(node, node.textContent.length);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    setSlashMenuOpen(false);
    setSlashQuery('');
    saveSelection();

    if (action === 'youtube') {
      setYoutubeModalOpen(true);
    } else if (action === 'instagram') {
      setInstagramModalOpen(true);
    } else if (action === 'table') {
      setTableModalOpen(true);
    } else if (action === 'image') {
      fileInputRef.current?.click();
    } else if (action === 'quote') {
      applyFormat('formatBlock', '<blockquote>');
    } else if (action === 'h2') {
      applyFormat('formatBlock', '<h2>');
    } else if (action === 'h3') {
      applyFormat('formatBlock', '<h3>');
    } else if (action === 'alignLeft') {
      applyFormat('justifyLeft');
    } else if (action === 'alignCenter') {
      applyFormat('justifyCenter');
    } else if (action === 'alignRight') {
      applyFormat('justifyRight');
    } else if (action === 'alignJustify') {
      applyFormat('justifyFull');
    }
  };

  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    saveSelection();
    const html = e.currentTarget.innerHTML;
    if (html !== (currentArticle.content || '')) {
      recordUndoState(currentArticle.content || '');
      setCurrentArticle(prev => ({ ...prev, content: html }));
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textBeforeCursor = range.startContainer.textContent?.substring(0, range.startOffset) || '';
      const slashIndex = textBeforeCursor.lastIndexOf('/');
      if (slashIndex !== -1 && (slashIndex === 0 || /\s/.test(textBeforeCursor[slashIndex - 1]))) {
        const query = textBeforeCursor.substring(slashIndex + 1);
        if (!/\s/.test(query)) {
          setSlashMenuOpen(true);
          setSlashQuery(query);
          return;
        }
      }
    }
    if (slashMenuOpen) {
      setSlashMenuOpen(false);
      setSlashQuery('');
    }
  };

  const recordUndoState = (prevContent: string) => {
    setUndoStack(prev => [...prev.slice(-40), prevContent]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const currentContent = currentArticle.content || '';
    const previousContent = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [currentContent, ...prev]);
    setCurrentArticle(prev => ({ ...prev, content: previousContent }));
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = previousContent;
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const currentContent = currentArticle.content || '';
    const nextContent = redoStack[0];
    setRedoStack(prev => prev.slice(1));
    setUndoStack(prev => [...prev, currentContent]);
    setCurrentArticle(prev => ({ ...prev, content: nextContent }));
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = nextContent;
    }
  };

  // Sync contentEditable innerHTML when article ID changes without disrupting typing cursor
  useEffect(() => {
    if (contentEditableRef.current && currentArticle.content !== undefined) {
      if (contentEditableRef.current.innerHTML !== currentArticle.content) {
        if (document.activeElement !== contentEditableRef.current) {
          contentEditableRef.current.innerHTML = currentArticle.content;
        }
      }
    }
  }, [currentArticle.id]);

  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine active studio route based on subdomains or path prefix
  const getStudioRoute = (subpath: string) => {
    const isStudioSubdomain = typeof window !== 'undefined' && window.location.hostname.toLowerCase().startsWith('studio.');
    if (isStudioSubdomain) {
      return subpath.startsWith('/') ? subpath : `/${subpath}`;
    }
    return `/studio/${subpath}`;
  };

  // Gallery Cover Selection feature states
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');

  // Popup Modal states for YouTube, Instagram, Table, Link
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeCaption, setYoutubeCaption] = useState('');
  const [youtubeTheme, setYoutubeTheme] = useState<'minimal' | 'bold'>('minimal');

  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [instagramCaption, setInstagramCaption] = useState('');
  const [instagramTheme, setInstagramTheme] = useState<'minimal' | 'bold'>('minimal');

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkHref, setLinkHref] = useState('');

  const openGalleryModal = async () => {
    setIsGalleryModalOpen(true);
    setGalleryLoading(true);
    try {
      const itemsList = [...CURATED_GALLERY_COVERS];
      const uniqueUrls = new Set(itemsList.map(item => item.cover_image));

      const { data, error } = await supabase
        .from('articles')
        .select('*');
      
      if (!error && data) {
        data.forEach((item: any) => {
          const imgUrl = item.cover_image;
          if (!imgUrl || imgUrl.trim() === '') return;
          if (!uniqueUrls.has(imgUrl)) {
            uniqueUrls.add(imgUrl);
            itemsList.push({
              cover_image: imgUrl,
              image_caption: item.image_caption || '',
              image_credit: item.image_credit || '',
              title: item.title,
              date: item.date
            });
          }
        });
      }
      setGalleryItems(itemsList);
    } catch (err) {
      console.error('Failed to load gallery cover history, using fallback templates:', err);
      setGalleryItems(CURATED_GALLERY_COVERS);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleSelectGalleryPhoto = (photo: any) => {
    setCurrentArticle({
      ...currentArticle,
      cover_image: photo.cover_image,
      image_caption: photo.image_caption || currentArticle.image_caption || '',
      image_credit: photo.image_credit || currentArticle.image_credit || ''
    });
    setIsGalleryModalOpen(false);
  };

  const checkSavedDraft = () => {
    try {
      const draft = localStorage.getItem('article_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.title || parsed.content) {
          setHasSavedDraft(true);
          const savedTime = parsed._formattedTime || (parsed._savedAt ? new Date(parsed._savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null);
          setDraftTime(savedTime);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error checking saved draft', e);
    }
    setHasSavedDraft(false);
    setDraftTime(null);
    return null;
  };

  useEffect(() => {
    loadData();
    const existingDraft = checkSavedDraft();
    if (existingDraft) {
      setShowDraftBanner(true);
    }
  }, []);

  // Auto-save draft every 30 seconds while writing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEditing) {
      interval = setInterval(() => {
        if (currentArticle.title || currentArticle.content) {
          const formattedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const draftData = {
            ...currentArticle,
            _savedAt: new Date().toISOString(),
            _formattedTime: formattedTime
          };
          try { 
            localStorage.setItem('article_draft', JSON.stringify(draftData)); 
            setLastSaved(formattedTime);
            setHasSavedDraft(true);
            setDraftTime(formattedTime);
          } catch (e) {
            console.warn('Failed to autosave draft', e);
          }
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isEditing, currentArticle]);

  const handleRestoreDraft = () => {
    try {
      const draft = localStorage.getItem('article_draft');
      if (!draft) {
        alert('Tidak ditemukan draf artikel yang tersimpan.');
        return;
      }
      const parsed = JSON.parse(draft);
      const { _savedAt, _formattedTime, ...cleanArticle } = parsed;
      setCurrentArticle(cleanArticle);
      setIsEditing(true);
      if (contentEditableRef.current && cleanArticle.content !== undefined) {
        contentEditableRef.current.innerHTML = cleanArticle.content;
      }
      const savedTime = _formattedTime || (_savedAt ? new Date(_savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '');
      alert(`Draf artikel berhasil dipulihkan! ${savedTime ? `(Tersimpan: ${savedTime})` : ''}`);
      setShowDraftBanner(false);
    } catch (err) {
      console.error('Failed to restore draft:', err);
      alert('Gagal memulihkan draf artikel.');
    }
  };

  const handleDiscardDraft = () => {
    if (confirm('Apakah Anda yakin ingin menghapus draf artikel tersimpan dari browser?')) {
      try {
        localStorage.removeItem('article_draft');
      } catch (e) {}
      setHasSavedDraft(false);
      setDraftTime(null);
      setShowDraftBanner(false);
    }
  };

  const fetchAndEditArticle = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (data) {
        setCurrentArticle({
          ...data,
          categoryId: data.category_id,
          authorId: data.author_id
        });
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Failed to fetch article for editing:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL route synchronization for dedicated Write & Edit pages
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    
    // 1. Tulis Artikel Baru (Write Mode)
    if (path.endsWith('/news/write')) {
      if (!isEditing || currentArticle.id) {
        // Prepare blank state
        const userPortal = currentUser.role === 'Administrator' ? 'gnext' : (currentUser.portal || 'gnext');
        let defaultLoc = 'Nasional';
        if (userPortal === 'yoikijatim') defaultLoc = 'Jawa Timur';
        else if (userPortal === 'lumajangtalks') defaultLoc = 'Lumajang';
        else if (userPortal.startsWith('lentera')) {
          const portalObj = ALL_PORTALS.find(p => p.id === userPortal);
          defaultLoc = portalObj ? portalObj.name.replace(/^Lentera\s*/i, '') : 'Jakarta';
        }
        setCurrentArticle({
          portal: userPortal as any,
          news_location: defaultLoc
        });
        setIsEditing(true);
      }
    } 
    // 2. Edit Artikel (Edit Mode)
    else if (path.includes('/news/edit/')) {
      const parts = location.pathname.split('/');
      const editIdx = parts.findIndex(p => p.toLowerCase() === 'edit');
      const articleId = parts[editIdx + 1];
      
      if (articleId && currentArticle.id !== articleId) {
        fetchAndEditArticle(articleId);
      }
    } 
    // 3. Jendela Daftar Artikel (List Mode)
    else {
      if (isEditing) {
        setIsEditing(false);
        setCurrentArticle({});
      }
    }
  }, [location.pathname]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes, usersRes, settingsRes] = await Promise.all([
        supabase.from('articles').select('*').order('date', { ascending: false }).limit(1000),
        supabase.from('categories').select('*'),
        supabase.from('users').select('*'),
        supabase.from('web_settings').select('*'),
      ]) as any[];

      if (articlesRes.data) {
        const mapped = articlesRes.data.map((a: any) => ({
          ...a,
          categoryId: a.category_id,
          authorId: a.author_id,
          image_caption: a.image_caption || '',
          image_credit: a.image_credit || '',
          news_location: a.news_location || 'Nasional',
          tags: Array.isArray(a.tags) 
            ? a.tags 
            : (typeof a.tags === 'string' ? (a.tags as string).split(',').map(t => t.trim()).filter(Boolean) : [])
        }));

        mapped.sort((a: any, b: any) => {
          const timeA = new Date(a.created_at || a.date || 0).getTime();
          const timeB = new Date(b.created_at || b.date || 0).getTime();
          if (timeA && timeB && timeA !== timeB) return timeB - timeA;
          return String(b.id || '').localeCompare(String(a.id || ''), undefined, { numeric: true });
        });

        setArticles(mapped);
      }
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (usersRes.data) setUsers(usersRes.data);

      const yoikiSetting = settingsRes.data?.find((s: any) => s.path === 'yoikijatim-locations');
      const lumajangSetting = settingsRes.data?.find((s: any) => s.path === 'lumajangtalks-locations');

      const yoikiCustom = yoikiSetting?.content 
        ? yoikiSetting.content.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      const lumajangCustom = lumajangSetting?.content
        ? lumajangSetting.content.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      const yoikiLocs = Array.from(new Set([...EAST_JAVA_CITIES, ...yoikiCustom]));
      const lumajangLocs = Array.from(new Set([...LUMAJANG_DISTRICTS, ...lumajangCustom]));

      setYoikiLocations(yoikiLocs);
      setLumajangLocations(lumajangLocs);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocs = locSearch.trim() ? indonesiaLocations.filter(loc => loc.toLowerCase().includes(locSearch.toLowerCase())).slice(0, 15) : indonesiaLocations.slice(0, 15);

  const executeSaveWithFallback = async (
    action: 'update' | 'insert',
    data: Record<string, any>,
    articleId?: string
  ) => {
    const payload = { ...data };
    let attempts = 0;
    const maxAttempts = 15;

    // Optional columns that can be removed if missing from Supabase schema
    const optionalCols = ['image_caption', 'image_credit', 'news_location', 'tags', 'portal', 'images'];

    while (attempts < maxAttempts) {
      attempts++;
      let response: { error: any; data: any };
      if (action === 'update' && articleId) {
        response = await supabase.from('articles').update(payload).eq('id', articleId);
      } else {
        response = await supabase.from('articles').insert([payload]);
      }

      if (!response.error) {
        clearArticlesCache();
        return { success: true, data: response.data };
      }

      const err = response.error;
      const errStr = `${err.code || ''} ${err.message || ''} ${err.details || ''}`.toLowerCase();

      if (err.code === 'PGRST204' || err.code === '42703' || errStr.includes('column') || errStr.includes('schema cache')) {
        const match = err.message?.match(/Could not find the '([^']+)' column/i)
          || err.message?.match(/column ["']?([^"'\s]+)["']? of relation/i)
          || err.message?.match(/column ["']?([^"'\s]+)["']? does not exist/i);

        if (match && match[1]) {
          const missingCol = match[1];
          if (missingCol in payload) {
            console.warn(`Database column '${missingCol}' missing in 'articles' table. Retrying save without '${missingCol}'...`);
            delete payload[missingCol];
            continue;
          }
        }

        // Fallback: try deleting optional columns sequentially
        let removedAny = false;
        for (const col of optionalCols) {
          if (col in payload) {
            console.warn(`Retrying save without optional column '${col}'...`);
            delete payload[col];
            removedAny = true;
            break;
          }
        }

        if (removedAny) {
          continue;
        }
      }

      return { success: false, error: err };
    }

    return { success: false, error: new Error('Gagal menyimpan ke database setelah beberapa percobaan.') };
  };

  const handleSave = async (targetStatus: 'draft' | 'published' | 'archived' = 'draft') => {
    const title = currentArticle.title?.trim();
    const categoryId = currentArticle.categoryId || currentArticle.category_id;

    if (!title || !categoryId) {
      alert('Judul dan kategori tidak boleh kosong.');
      return;
    }
    
    if (!currentArticle.cover_image) {
      alert('Mohon unggah foto berita.');
      return;
    }
    
    if (targetStatus === 'published') {
      const isDuplicate = articles.some(
        a => a.title?.trim().toLowerCase() === title.toLowerCase() &&
             String(a.id) !== String(currentArticle.id || '') &&
             a.status === 'published'
      );
      if (isDuplicate) {
        alert('Gagal menerbitkan: Artikel dengan judul yang sama persis sudah diterbitkan.');
        return;
      }
    }
    
    try {
      const articlePortal = currentUser.role === 'Administrator'
        ? (currentArticle.portal || 'gnext')
        : (currentUser.portal || 'gnext');

      // Contextual sub-category validation using categoriesConfig
      const selectedCat = categories.find(c => String(c.id) === String(categoryId));
      const subCatValidation = validateSubCategory(
        currentArticle.sub_category,
        selectedCat?.slug,
        selectedCat?.name,
        articlePortal
      );

      if (!subCatValidation.isValid) {
        alert(subCatValidation.message || 'Mohon pilih sub-kategori yang sesuai.');
        return;
      }

      const validatedSubCategory = subCatValidation.cleanedSubCat;

      const formattedTags = Array.isArray(currentArticle.tags)
        ? currentArticle.tags
        : (typeof currentArticle.tags === 'string' ? (currentArticle.tags as string).split(',').map(t => t.trim()).filter(Boolean) : []);

      const articleData: any = {
        title: title,
        category_id: categoryId,
        sub_category: validatedSubCategory,
        content: currentArticle.content || '',
        tags: formattedTags,
        date: currentArticle.date || new Date().toISOString(),
        author_id: currentArticle.authorId || currentArticle.author_id || currentUser.id || null,
        status: targetStatus,
        portal: articlePortal,
        cover_image: currentArticle.cover_image,
        image_caption: currentArticle.image_caption || '',
        image_credit: currentArticle.image_credit || '',
        news_location: currentArticle.news_location || 'Nasional',
        images: currentArticle.images || []
      };

      const isStaticOrFallbackId = typeof currentArticle.id === 'string' && (
        currentArticle.id.startsWith('news-static-') ||
        currentArticle.id.startsWith('yoiki-') ||
        currentArticle.id.startsWith('lumajang-') ||
        currentArticle.id.includes('fallback')
      );

      const action = (currentArticle.id && !isStaticOrFallbackId) ? 'update' : 'insert';
      const targetId = currentArticle.id && !isStaticOrFallbackId ? String(currentArticle.id) : undefined;

      const saveResult = await executeSaveWithFallback(action, articleData, targetId);

      if (!saveResult.success) {
        console.error('Supabase save error:', saveResult.error);
        alert(`Gagal menyimpan artikel: ${saveResult.error?.message || 'Terjadi kesalahan pada database.'}`);
        return;
      }

      if (action === 'update') {
        await logAudit(currentUser.name, 'UPDATE', 'Article', `Updated article: ${title} (${targetStatus}) on portal ${articlePortal}`);
      } else {
        await logAudit(currentUser.name, 'CREATE', 'Article', `Created article: ${title} (${targetStatus}) on portal ${articlePortal}`);
      }
      
      // Trigger sitemap generation and Google Indexing API if published
      if (targetStatus === 'published') {
        try {
          await fetch('/api/update-sitemap', { method: 'POST' });
        } catch (err) {
          console.error('Failed to trigger sitemap update', err);
        }

        try {
          const indexRes = await fetch('/api/indexing/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              portal: articlePortal,
              categoryId
            })
          });
          const indexData = await indexRes.json();
          if (indexData.success) {
            console.log('[Google Indexing] Submission successful:', indexData);
          } else {
            console.warn('[Google Indexing] Submission failed:', indexData.error);
          }
        } catch (err) {
          console.error('Failed to trigger Google Indexing API', err);
        }
      }
      
      try { localStorage.removeItem('article_draft'); } catch (e) {};
      setHasSavedDraft(false);
      setDraftTime(null);
      setShowDraftBanner(false);
      await loadData();
      setIsEditing(false);
      setCurrentArticle({});
      setLastSaved(null);
      alert(targetStatus === 'published' ? 'Berita berhasil diterbitkan!' : 'Draft berita berhasil disimpan!');
    } catch (error: any) {
      console.error('Failed to save article:', error);
      alert(`Gagal menyimpan artikel: ${error?.message || 'Pastikan koneksi jaringan stabil.'}`);
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
      try {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) {
          alert(`Gagal menghapus artikel: ${error.message}`);
          return;
        }
        clearArticlesCache();
        await logAudit(currentUser.name, 'DELETE', 'Article', `Deleted article: ${title || id}`);
        setArticles(articles.filter(a => a.id !== id));
      } catch (error) {
        console.error('Failed to delete article:', error);
      }
    }
  };

  const handleArchive = async (id: string, title?: string) => {
    if (confirm('Yakin ingin mengarsipkan artikel ini? (Hanya tampil di data, non-publik)')) {
      try {
        const { error } = await supabase.from('articles').update({ status: 'archived' }).eq('id', id);
        if (error) {
          alert(`Gagal mengarsipkan artikel: ${error.message}`);
          return;
        }
        clearArticlesCache();
        await logAudit(currentUser.name, 'UPDATE', 'Article', `Archived article: ${title || id}`);
        setArticles(articles.map(a => a.id === id ? { ...a, status: 'archived' } : a));
      } catch (error) {
        console.error('Failed to archive article:', error);
      }
    }
  };

  const formatDateDisplay = (dateStr?: string, createdAtStr?: string) => {
    const raw = createdAtStr || dateStr;
    if (!raw) return '-';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const hasTime = Boolean(createdAtStr || (dateStr && (dateStr.includes('T') || dateStr.includes(':'))));
    if (hasTime && (d.getHours() !== 0 || d.getMinutes() !== 0)) {
      return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
    }
    return `${day} ${month} ${year}`;
  };

  const getAuthorName = (authorId: string) => users.find(u => u.id === authorId)?.name || 'Redaksi';
  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Berita';

  const startNewArticle = () => {
    const userPortal = currentUser.role === 'Administrator' ? 'gnext' : (currentUser.portal || 'gnext');
    let defaultLoc = 'Nasional';
    if (userPortal === 'yoikijatim') defaultLoc = 'Jawa Timur';
    else if (userPortal === 'lumajangtalks') defaultLoc = 'Lumajang';
    else if (userPortal.startsWith('lentera')) {
      const portalObj = ALL_PORTALS.find(p => p.id === userPortal);
      defaultLoc = portalObj ? portalObj.name.replace(/^Lentera\s*/i, '') : 'Jakarta';
    }
    setCurrentArticle({
      portal: userPortal as any,
      news_location: defaultLoc
    });
    setIsEditing(true);
  };

  const canEdit = (article: Article) => {
    if (currentUser.role === 'Administrator' || currentUser.role === 'Manajer Pers') return true;
    return article.authorId === currentUser.id;
  };

  const getArticleUrl = (article: Article) => {
    const portal = article.portal || 'gnext';
    const prefix = portal === 'yoikijatim' ? '/yoikijatim' : portal === 'lumajangtalks' ? '/lumajangtalks' : '/news';
    const catName = getCategoryName(article.categoryId);
    const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const titleSlug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return `${prefix}/${catSlug}/${titleSlug}`;
  };

  const filteredArticles = articles.filter(a => {
    // Portal permissions filter
    if (currentUser.role !== 'Administrator') {
      const userPortal = currentUser.portal || 'gnext';
      if ((a.portal || 'gnext').toLowerCase() !== userPortal.toLowerCase()) {
        return false;
      }
    } else if (portalFilter !== 'all') {
      if ((a.portal || 'gnext').toLowerCase() !== portalFilter.toLowerCase()) {
        return false;
      }
    }
    // Author permissions filter
    if (currentUser.role === 'Penulis Pers') {
      if (a.authorId !== currentUser.id) return false;
    }
    // Status filter
    if (statusFilter !== 'all') {
      const currentStatus = a.status || 'draft';
      if (currentStatus !== statusFilter) return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title?.toLowerCase().includes(q);
      const matchLoc = a.news_location?.toLowerCase().includes(q);
      const matchCat = getCategoryName(a.categoryId).toLowerCase().includes(q);
      const matchTag = a.tags && Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchLoc && !matchCat && !matchTag) return false;
    }
    return true;
  });

  // Automatically sort filtered articles with newest first
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const timeA = new Date(a.created_at || a.date || 0).getTime();
    const timeB = new Date(b.created_at || b.date || 0).getTime();
    if (timeA && timeB && timeA !== timeB) return timeB - timeA;
    return String(b.id || '').localeCompare(String(a.id || ''), undefined, { numeric: true });
  });

  const applyFormat = (command: string, value: string = '') => {
    const el = contentEditableRef.current;
    if (!el) return;
    recordUndoState(currentArticle.content || '');
    el.focus();
    document.execCommand(command, false, value);
    setCurrentArticle(prev => ({ ...prev, content: el.innerHTML }));
  };

  const insertHtmlContent = (htmlString: string) => {
    const el = contentEditableRef.current;
    recordUndoState(currentArticle.content || '');
    if (!el) {
      setCurrentArticle(prev => ({ ...prev, content: (prev.content || '') + htmlString }));
      return;
    }
    el.focus();
    restoreSelection();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = div.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.setEndAfter(lastNode);
          selection.removeAllRanges();
          selection.addRange(range);
          savedRangeRef.current = range.cloneRange();
        }
      } else {
        el.innerHTML += htmlString;
      }
    } else {
      el.innerHTML += htmlString;
    }
    setCurrentArticle(prev => ({ ...prev, content: el.innerHTML }));
  };

  const confirmInsertYouTube = () => {
    if (!youtubeUrl.trim()) {
      alert('URL YouTube wajib diisi.');
      return;
    }
    let videoId = '';
    const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    } else {
      videoId = youtubeUrl.trim();
    }
    const capHtml = youtubeCaption ? `<p class="text-xs text-center text-neutral-500 italic mt-1.5">${youtubeCaption}</p>` : '';
    
    let ytHtml = '';
    if (youtubeTheme === 'bold') {
      ytHtml = `<div class="my-6 aspect-video w-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-red-950 via-neutral-900 to-neutral-950 border-2 border-red-500/40 p-1.5"><iframe src="https://www.youtube.com/embed/${videoId.trim()}" class="w-full h-full rounded-xl border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${capHtml}`;
    } else {
      ytHtml = `<div class="my-6 aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs"><iframe src="https://www.youtube.com/embed/${videoId.trim()}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${capHtml}`;
    }
    insertHtmlContent(ytHtml);
    setYoutubeModalOpen(false);
    setYoutubeUrl('');
    setYoutubeCaption('');
  };

  const handleOpenLinkModal = () => {
    const el = contentEditableRef.current;
    let selected = '';
    if (el) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selected = selection.toString();
      }
    }
    setLinkText(selected);
    setLinkHref('');
    setLinkModalOpen(true);
  };

  const confirmInsertLink = () => {
    if (!linkHref.trim()) {
      alert('URL tautan wajib diisi.');
      return;
    }
    const label = linkText.trim() || linkHref.trim();
    const linkHtml = `<a href="${linkHref.trim()}" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline hover:text-blue-800">${label}</a>`;
    insertHtmlContent(linkHtml);
    setLinkModalOpen(false);
  };

  const insertInstagramEmbed = () => {
    setInstagramModalOpen(true);
  };

  const confirmInsertInstagram = () => {
    if (!instagramUrl.trim()) {
      alert('URL Instagram wajib diisi.');
      return;
    }
    const capHtml = instagramCaption ? `<p class="text-xs text-neutral-700 mt-1 font-medium">${instagramCaption}</p>` : '';
    
    let igHtml = '';
    if (instagramTheme === 'bold') {
      igHtml = `<div class="my-6 p-6 bg-gradient-to-tr from-amber-100 via-pink-100 to-purple-100 border-2 border-pink-400 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center gap-4 ring-2 ring-pink-500/20"><div class="w-12 h-12 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></div><div class="flex-1 min-w-0 text-center sm:text-left"><p class="text-xs font-bold text-neutral-900">Postingan Instagram</p><p class="text-xs text-neutral-600 truncate mt-0.5">${instagramUrl.trim()}</p>${capHtml}</div><a href="${instagramUrl.trim()}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-xl text-xs font-bold shrink-0 shadow hover:opacity-95 transition-all">Buka di Instagram &rarr;</a></div>`;
    } else {
      igHtml = `<div class="my-6 p-4 bg-white border border-neutral-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-center gap-4"><div class="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-600 shrink-0"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></div><div class="flex-1 min-w-0 text-center sm:text-left"><p class="text-xs text-neutral-600 truncate mt-0.5">${instagramUrl.trim()}</p>${capHtml}</div><a href="${instagramUrl.trim()}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold shrink-0 hover:bg-neutral-800 transition-all">Buka &rarr;</a></div>`;
    }
    insertHtmlContent(igHtml);
    setInstagramModalOpen(false);
    setInstagramUrl('');
    setInstagramCaption('');
  };

  const insertTableTemplate = () => {
    setTableModalOpen(true);
  };

  const confirmInsertTable = () => {
    const r = Math.max(1, Number(tableRows) || 3);
    const c = Math.max(1, Number(tableCols) || 3);
    let headerRow = '<tr>';
    for (let j = 1; j <= c; j++) {
      headerRow += `<th class="border border-neutral-300 bg-neutral-100 p-2.5 text-left font-bold text-neutral-800">Kolom ${j}</th>`;
    }
    headerRow += '</tr>';
    let bodyRows = '';
    for (let i = 1; i <= r; i++) {
      bodyRows += '<tr class="even:bg-neutral-50">';
      for (let j = 1; j <= c; j++) {
        bodyRows += `<td class="border border-neutral-200 p-2.5 text-neutral-700">Baris ${i}, Sel ${j}</td>`;
      }
      bodyRows += '</tr>';
    }
    const tableHtml = `<div class="overflow-x-auto my-5"><table class="w-full border-collapse"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table></div>`;
    insertHtmlContent(tableHtml);
    setTableModalOpen(false);
  };

  const preprocessMarkdown = (raw: string) => {
    if (!raw) return '';
    let text = raw;

    // YouTube shortcode [youtube:videoId|caption]
    text = text.replace(/\[youtube:([^\|\]]+)(?:\|([^\]]*))?\]/gi, (match, videoId, caption) => {
      const capHtml = caption ? `<p class="text-xs text-center text-neutral-500 italic mt-1.5">${caption}</p>` : '';
      return `<div class="my-6 aspect-video w-full overflow-hidden rounded-2xl shadow-md bg-neutral-900 border border-neutral-800"><iframe src="https://www.youtube.com/embed/${videoId.trim()}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${capHtml}`;
    });

    // Instagram shortcode [instagram:url|caption]
    text = text.replace(/\[instagram:([^\|\]]+)(?:\|([^\]]*))?\]/gi, (match, url, caption) => {
      const capHtml = caption ? `<p class="text-xs text-neutral-700 mt-1 font-medium">${caption}</p>` : '';
      return `<div class="my-6 p-6 bg-gradient-to-tr from-amber-50 via-pink-50 to-purple-50 border border-pink-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-4"><div class="w-12 h-12 bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></div><div class="flex-1 min-w-0 text-center sm:text-left"><p class="text-xs text-neutral-600 truncate mt-0.5">${url}</p>${capHtml}</div><a href="${url}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-xl text-xs font-bold shrink-0 shadow hover:opacity-95 transition-all">Buka di Instagram &rarr;</a></div>`;
    });

    // Table shortcode [table:rowsxcols]
    text = text.replace(/\[table:(\d+)x(\d+)\]/gi, (match, rStr, cStr) => {
      const r = parseInt(rStr) || 3;
      const c = parseInt(cStr) || 3;
      let headerRow = '<tr>';
      for (let j = 1; j <= c; j++) {
        headerRow += `<th class="border border-neutral-300 bg-neutral-100 p-2.5 text-left font-bold text-neutral-800">Kolom ${j}</th>`;
      }
      headerRow += '</tr>';
      let bodyRows = '';
      for (let i = 1; i <= r; i++) {
        bodyRows += '<tr class="even:bg-neutral-50">';
        for (let j = 1; j <= c; j++) {
          bodyRows += `<td class="border border-neutral-200 p-2.5 text-neutral-700">Baris ${i}, Sel ${j}</td>`;
        }
        bodyRows += '</tr>';
      }
      return `<div class="overflow-x-auto my-5"><table class="w-full border-collapse"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table></div>`;
    });

    // Active links &text|url& or &url&
    text = text.replace(/&([^&|]+)\|([^&]+)&/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline hover:text-blue-800">$1</a>');
    text = text.replace(/&([^&|\s]+)&/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-semibold underline hover:text-blue-800">$1</a>');
    // Bold with *x* -> **x**
    text = text.replace(/(?<!\*)\*([^\*\n]+)\*(?!\*)/g, '**$1**');
    // Italic with _x_ -> *x*
    text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, '*$1*');
    return text;
  };





  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Open crop modal
    setCropTarget({ file, isCover: false });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedDataUrl: string, croppedFile: File) => {
    if (!cropTarget) return;
    const { isCover } = cropTarget;
    setCropTarget(null);

    try {
      const dataUrl = await compressImageHighQuality(croppedFile);
      if (isCover) {
        setPreviewImage({ filename: croppedFile.name, dataUrl, isUploading: false, isCover: true });
      } else {
        const imgHtml = `<img src="${dataUrl}" alt="${croppedFile.name}" loading="lazy" class="w-full rounded-2xl shadow-md my-4 object-cover" />`;
        insertHtmlContent(imgHtml);
      }
    } catch (err) {
      console.error('Failed to process cropped image:', err);
      alert('Gagal memproses gambar setelah dipangkas.');
    }
  };

  const confirmImageUpload = async () => {
    if (!previewImage) return;
    setPreviewImage({ ...previewImage, isUploading: true });
    
    try {
      const dataUrl = previewImage.dataUrl;
      
      if (previewImage.isCover) {
        setCurrentArticle({ ...currentArticle, cover_image: dataUrl });
      } else {
        const imgHtml = `<img src="${dataUrl}" alt="${previewImage.filename}" loading="lazy" class="w-full rounded-2xl shadow-md my-4 object-cover" />`;
        insertHtmlContent(imgHtml);
      }
      setPreviewImage(null);
    } catch (error) {
      console.error('Upload error', error);
      alert('Terjadi kesalahan saat memproses gambar');
      setPreviewImage({ ...previewImage, isUploading: false });
    }
  };

  if (isEditing) {
    // Title real-time SEO & count calculations
    const titleText = currentArticle.title || '';
    const titleCharCount = titleText.length;
    const titleWordCount = titleText.trim() ? titleText.trim().split(/\s+/).filter(Boolean).length : 0;
    
    let titleSeoStatus = { label: 'Belum Diisi', color: 'bg-neutral-100 text-neutral-500 border-neutral-200' };
    if (titleCharCount > 0 && titleCharCount < 30) {
      titleSeoStatus = { label: 'Terlalu Pendek (<30 kar)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    } else if (titleCharCount >= 30 && titleCharCount < 50) {
      titleSeoStatus = { label: 'Cukup (30-49 kar)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else if (titleCharCount >= 50 && titleCharCount <= 70) {
      titleSeoStatus = { label: 'Sangat Baik (SEO 50-70 kar)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    } else if (titleCharCount > 70) {
      titleSeoStatus = { label: 'Terlalu Panjang (>70 kar)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }

    // Body real-time SEO & count calculations
    const bodyText = currentArticle.content || '';
    const cleanBodyText = bodyText.replace(/#+\s?|[\*\_]{1,3}|\[([^\]]+)\]\([^\)]+\)|`{1,3}.*?`{1,3}|^\s*[\-\*]\s+/gm, '$1').trim();
    const bodyCharCount = bodyText.length;
    const bodyWordCount = cleanBodyText ? cleanBodyText.split(/\s+/).filter(Boolean).length : 0;
    const bodyParagraphCount = bodyText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(bodyWordCount / 200));

    let bodySeoStatus = { label: 'Belum Ada Konten', color: 'bg-neutral-100 text-neutral-500 border-neutral-200' };
    if (bodyWordCount > 0 && bodyWordCount < 150) {
      bodySeoStatus = { label: 'Sangat Singkat (<150 kata)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    } else if (bodyWordCount >= 150 && bodyWordCount < 300) {
      bodySeoStatus = { label: 'Berita Singkat (150-299 kata)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else if (bodyWordCount >= 300 && bodyWordCount <= 800) {
      bodySeoStatus = { label: 'Ideal SEO (300-800 kata)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    } else if (bodyWordCount > 800) {
      bodySeoStatus = { label: 'Artikel Mendalam (>800 kata)', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    }

    return (
      <div className="max-w-7xl mx-auto bg-gradient-to-b from-white via-white to-neutral-50/40 rounded-3xl border border-neutral-200/90 p-5 sm:p-8 md:p-10 mb-28 md:mb-16 relative shadow-xl space-y-8 animate-in fade-in duration-300">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-neutral-200/80">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => { navigate(getStudioRoute('news')); }}
              className="p-2.5 text-neutral-700 hover:bg-neutral-100 rounded-2xl transition-all border border-neutral-200 shadow-3xs flex items-center justify-center bg-white"
              title="Kembali ke daftar berita"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-neutral-900 text-white rounded-md text-[10px] font-extrabold uppercase tracking-widest">
                  Studio Redaktur
                </span>
                <span className="text-xs text-neutral-500 font-medium">• Gnext Newsroom</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-display font-extrabold tracking-tight text-neutral-900 mt-1">
                {currentArticle.id ? 'Edit Artikel Berita' : 'Tulis Artikel Berita Baru'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {lastSaved && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Auto-draft tersimpan 30s ({lastSaved})
                  </p>
                )}
                {hasSavedDraft && (
                  <button
                    type="button"
                    onClick={handleRestoreDraft}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-3xs"
                    title="Pulihkan draf tersimpan dari browser"
                  >
                    <RotateCcw size={12} /> Pulihkan Draf
                  </button>
                )}
              </div>

        {/* YOUTUBE EMBED MODAL */}
        {youtubeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-display font-bold">Sisipkan Video YouTube</h3>
              <p className="text-xs text-neutral-500">Masukkan URL video atau ID video YouTube serta keterangan opsional.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">URL / ID YouTube</label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Keterangan / Caption (Opsional)</label>
                  <input
                    type="text"
                    value={youtubeCaption}
                    onChange={e => setYoutubeCaption(e.target.value)}
                    placeholder="Contoh: Suasana konferensi pers..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Pilih Tema Embed (Embed Theme)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setYoutubeTheme('minimal')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${youtubeTheme === 'minimal' ? 'border-neutral-900 bg-neutral-900 text-white font-bold' : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      <div className="text-xs font-bold">Clean / Minimal</div>
                      <div className={`text-[10px] ${youtubeTheme === 'minimal' ? 'text-neutral-300' : 'text-neutral-500'}`}>Sleek & rapi tanpa aksen</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setYoutubeTheme('bold')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${youtubeTheme === 'bold' ? 'border-red-600 bg-red-600 text-white font-bold' : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      <div className="text-xs font-bold">Engaging / Bold</div>
                      <div className={`text-[10px] ${youtubeTheme === 'bold' ? 'text-red-100' : 'text-neutral-500'}`}>Gaya mewah kontras</div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setYoutubeModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmInsertYouTube}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Sisipkan Video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INSTAGRAM EMBED MODAL */}
        {instagramModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-display font-bold">Pratinjau Postingan Instagram</h3>
              <p className="text-xs text-neutral-500">Masukkan URL postingan Instagram.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">URL Postingan Instagram</label>
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={e => setInstagramUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Keterangan / Caption (Opsional)</label>
                  <input
                    type="text"
                    value={instagramCaption}
                    onChange={e => setInstagramCaption(e.target.value)}
                    placeholder="Contoh: Dokumen resmi Instagram..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Pilih Tema Embed (Embed Theme)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInstagramTheme('minimal')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${instagramTheme === 'minimal' ? 'border-neutral-900 bg-neutral-900 text-white font-bold' : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      <div className="text-xs font-bold">Clean / Minimal</div>
                      <div className={`text-[10px] ${instagramTheme === 'minimal' ? 'text-neutral-300' : 'text-neutral-500'}`}>Sleek & rapi tanpa aksen</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstagramTheme('bold')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${instagramTheme === 'bold' ? 'border-pink-600 bg-pink-600 text-white font-bold' : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      <div className="text-xs font-bold">Engaging / Bold</div>
                      <div className={`text-[10px] ${instagramTheme === 'bold' ? 'text-pink-100' : 'text-neutral-500'}`}>Gaya mewah kontras</div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInstagramModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmInsertInstagram}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Sisipkan Instagram
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE CREATOR MODAL */}
        {tableModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-display font-bold">Buat / Edit Tabel Data</h3>
              <p className="text-xs text-neutral-500">Tentukan jumlah baris dan kolom untuk tabel berita.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Jumlah Baris (Rows)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={e => setTableRows(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Jumlah Kolom (Cols)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={e => setTableCols(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmInsertTable}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Sisipkan Tabel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LINK CREATOR MODAL */}
        {linkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-display font-bold">Sisipkan Tautan (Link)</h3>
              <p className="text-xs text-neutral-500">Tentukan teks tampil dan URL tujuan tautan.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Teks Tampil (Label)</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={e => setLinkText(e.target.value)}
                    placeholder="Contoh: Baca selengkapnya..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">URL Tujuan</label>
                  <input
                    type="text"
                    value={linkHref}
                    onChange={e => setLinkHref(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmInsertLink}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Sisipkan Tautan
                </button>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
          <button 
            onClick={() => { navigate(getStudioRoute('news')); }} 
            className="p-2.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all"
            title="Tutup Studio"
          >
            <X size={22} />
          </button>
        </div>

        {/* Restore Draft Notification Banner */}
        {hasSavedDraft && showDraftBanner && (
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
                <RotateCcw size={18} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Draf Tersimpan Otomatis Ditemukan
                </h4>
                <p className="text-[11px] text-amber-700">
                  Terdapat draf artikel sebelumnya yang tersimpan secara lokal {draftTime ? `(${draftTime})` : ''}. Apabila tab Anda tidak sengaja tertutup, Anda dapat memulihkannya kapan saja.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <RotateCcw size={13} /> Pulihkan Draf
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-2 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-all"
              >
                Abaikan / Hapus
              </button>
            </div>
          </div>
        )}

        {/* 1) Portal, Kategori Berita, dan Lokasi di Bagian Atas */}
        <div className="bg-neutral-50/90 backdrop-blur-sm rounded-2xl border border-neutral-200/80 p-5 sm:p-7 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200/80 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Portal, Kategori, & Lokasi Penyiaran</span>
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">Tentukan target distribusi pembaca</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Portal */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center gap-1">
                <Globe size={13} className="text-neutral-500" /> Target Portal Berita *
              </label>
              {currentUser.role === 'Administrator' ? (
                <select
                  value={currentArticle.portal || 'gnext'}
                  onChange={e => {
                    const nextPortal = e.target.value;
                    let defaultLoc = 'Nasional';
                    if (nextPortal === 'yoikijatim') defaultLoc = 'Jawa Timur';
                    else if (nextPortal === 'lumajangtalks') defaultLoc = 'Lumajang';
                    else if (nextPortal.startsWith('lentera')) {
                      const portalObj = ALL_PORTALS.find(p => p.id === nextPortal);
                      defaultLoc = portalObj ? portalObj.name.replace(/^Lentera\s*/i, '') : 'Jakarta';
                    }
                    setCurrentArticle({ 
                      ...currentArticle, 
                      portal: nextPortal as any,
                      news_location: defaultLoc
                    });
                  }}
                  className="w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs sm:text-sm font-semibold text-neutral-800 transition-all shadow-3xs"
                >
                  {ALL_PORTALS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              ) : (
                <div className="w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-700 font-semibold text-xs sm:text-sm flex items-center shadow-3xs">
                  {getPortalById(currentUser.portal || 'gnext').name}
                </div>
              )}
            </div>

            {/* Kategori Berita Utama */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center gap-1">
                <FileText size={13} className="text-neutral-500" /> Kategori Berita *
              </label>
              <select
                value={currentArticle.categoryId || currentArticle.category_id || ''}
                onChange={e => {
                  const selectedCatId = e.target.value;
                  const foundCat = categories.find(c => c.id === selectedCatId);
                  const catType = getCategoryType(foundCat?.slug, foundCat?.name);

                  let newPortal = currentArticle.portal;
                  if (currentUser.role === 'Administrator') {
                    if (catType === 'UMMAH') {
                      newPortal = 'gummah' as any;
                    } else if (catType === 'FINANCE') {
                      newPortal = 'finance' as any;
                    } else if (newPortal === 'gummah' || newPortal === 'finance') {
                      newPortal = 'gnext' as any;
                    }
                  }

                  setCurrentArticle({ 
                    ...currentArticle, 
                    categoryId: selectedCatId, 
                    category_id: selectedCatId,
                    portal: newPortal,
                    sub_category: (catType === 'UMMAH' || catType === 'FINANCE') ? currentArticle.sub_category : ''
                  });
                }}
                className="w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs sm:text-sm font-semibold text-neutral-800 transition-all shadow-3xs"
              >
                <option value="">Pilih Kategori Utama</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.slug ? `(/${c.slug})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Kategori / Sub-Menu Tematik (Dinamis berdasarkan Kategori Induk dari categoriesConfig.ts) */}
            {(() => {
              const selectedCat = categories.find(c => c.id === (currentArticle.categoryId || currentArticle.category_id));
              const activePortal = currentArticle.portal || (currentUser.role === 'Administrator' ? 'gnext' : (currentUser.portal || 'gnext'));
              const catType = selectedCat 
                ? getCategoryType(selectedCat.slug, selectedCat.name)
                : getCategoryType(undefined, undefined, activePortal);

              const config = CATEGORIES_CONFIG[catType];

              if (config && config.subCategories && config.subCategories.length > 0) {
                const isUmmah = catType === 'UMMAH';
                return (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center gap-1">
                      <Tag size={13} className="text-neutral-500" /> Sub-Kategori / Sub-Menu
                    </label>
                    <select
                      value={currentArticle.sub_category || ''}
                      onChange={e => setCurrentArticle({ ...currentArticle, sub_category: e.target.value })}
                      className={`w-full px-3.5 py-3 border rounded-xl focus:outline-none focus:ring-2 text-xs sm:text-sm font-semibold transition-all shadow-3xs ${
                        isUmmah 
                          ? 'bg-emerald-50/60 border-emerald-200 focus:ring-emerald-600 text-emerald-900' 
                          : 'bg-blue-50/60 border-blue-200 focus:ring-blue-600 text-blue-900'
                      }`}
                    >
                      <option value="">{config.placeholder}</option>
                      {config.subCategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Kategori umum (Lingkungan, Politik, Teknologi, dll.): Beralih dinamis ke input hidden
              return (
                <input
                  type="hidden"
                  name="sub_category"
                  value=""
                />
              );
            })()}

            {/* Lokasi Kejadian */}
            <div className="relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-neutral-500" /> Lokasi Kejadian Berita *
              </label>
              {(() => {
                const portal = currentArticle.portal || (currentUser.role === 'Administrator' ? 'gnext' : (currentUser.portal || 'gnext'));
                const defaultVal = portal === 'yoikijatim' 
                  ? 'Jawa Timur' 
                  : (portal === 'lumajangtalks' 
                      ? 'Lumajang' 
                      : (portal.startsWith('lentera') 
                          ? (ALL_PORTALS.find(p => p.id === portal)?.name.replace(/^Lentera\s*/i, '') || 'Jakarta') 
                          : 'Nasional'
                        )
                    );

                let suggestedPool: string[] = [];
                if (portal === 'yoikijatim') {
                  suggestedPool = Array.from(new Set(['Jawa Timur', ...yoikiLocations, ...EAST_JAVA_CITIES]));
                } else if (portal === 'lumajangtalks') {
                  suggestedPool = Array.from(new Set(['Lumajang', ...lumajangLocations, ...LUMAJANG_DISTRICTS]));
                } else {
                  suggestedPool = indonesiaLocations;
                }

                const activeFilteredLocs = locSearch.trim()
                  ? Array.from(new Set([
                      ...suggestedPool.filter(loc => loc.toLowerCase().includes(locSearch.toLowerCase())),
                      ...indonesiaLocations.filter(loc => loc.toLowerCase().includes(locSearch.toLowerCase()))
                    ])).slice(0, 40)
                  : suggestedPool;

                return (
                  <div className="relative">
                    <input
                      type="text"
                      value={showLocDropdown ? locSearch : (currentArticle.news_location || defaultVal)}
                      onChange={e => {
                        setLocSearch(e.target.value);
                        setCurrentArticle({ ...currentArticle, news_location: e.target.value });
                        setShowLocDropdown(true);
                      }}
                      onFocus={() => {
                        setLocSearch('');
                        setShowLocDropdown(true);
                      }}
                      onBlur={() => setTimeout(() => setShowLocDropdown(false), 200)}
                      placeholder={
                        portal === 'yoikijatim' 
                          ? "Pilih atau ketik kota/kabupaten di Jawa Timur..." 
                          : (portal === 'lumajangtalks' ? "Pilih atau ketik kecamatan di Lumajang..." : "Pilih atau ketik lokasi...")
                      }
                      className="w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs sm:text-sm font-medium shadow-3xs"
                    />

                    {showLocDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-64 overflow-y-auto divide-y divide-neutral-100">
                         {activeFilteredLocs.length > 0 ? activeFilteredLocs.map(loc => (
                            <div 
                              key={loc}
                              className="px-4 py-2.5 hover:bg-neutral-100 cursor-pointer text-xs sm:text-sm font-medium text-neutral-900 transition-colors flex items-center justify-between"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                 setCurrentArticle({ ...currentArticle, news_location: loc });
                                 setLocSearch('');
                                 setShowLocDropdown(false);
                              }}
                            >
                              <span>{loc}</span>
                              {currentArticle.news_location === loc && <Check size={14} className="text-emerald-600" />}
                            </div>
                         )) : (
                            <div className="px-4 py-2.5 text-xs text-neutral-600 italic">
                              Gunakan lokasi kustom: "{locSearch}"
                            </div>
                         )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Portal News Categories handled directly by Category Selection */}
        </div>

        {/* 2) Judul */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Judul Berita Utama *</span>
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border ${titleSeoStatus.color}`}>
                {titleSeoStatus.label}
              </span>
              <span className="text-neutral-500 font-mono text-[11px]">
                <strong>{titleCharCount}</strong> kar | <strong>{titleWordCount}</strong> kata
              </span>
            </div>
          </div>
          <input
            type="text"
            value={currentArticle.title || ''}
            onChange={e => setCurrentArticle({ ...currentArticle, title: e.target.value })}
            className="w-full px-4.5 py-4 bg-neutral-50/80 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-bold text-xl sm:text-2xl text-neutral-900 placeholder:text-neutral-400 transition-all shadow-3xs"
            placeholder="Tulis judul berita yang menarik dan informatif di sini..."
          />
        </div>

        {/* 3) Component Hero Image Preview */}
        <HeroImagePreview
          coverImage={currentArticle.cover_image}
          caption={currentArticle.image_caption || ''}
          credit={currentArticle.image_credit || ''}
          title={currentArticle.title || ''}
          categoryName={getCategoryName(currentArticle.categoryId || currentArticle.category_id || '')}
          portal={currentArticle.portal || (currentUser.role === 'Administrator' ? 'gnext' : (currentUser.portal || 'gnext'))}
          onFileSelect={(file: File) => {
            setCropTarget({ file, isCover: true });
          }}
          onOpenGallery={openGalleryModal}
          onRemove={() => setCurrentArticle({ ...currentArticle, cover_image: '' })}
          onCaptionChange={(caption) => setCurrentArticle({ ...currentArticle, image_caption: caption })}
          onCreditChange={(credit) => setCurrentArticle({ ...currentArticle, image_credit: credit })}
        />

        {/* 4) Isi Artikel (Penulisan Langsung di Fitur Pratinjau Hasil) */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Isi Artikel & Live Preview</span>
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold border ${bodySeoStatus.color}`}>
                {bodySeoStatus.label}
              </span>
              <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
                <strong>{bodyWordCount}</strong> kata | <strong>{bodyCharCount}</strong> kar
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 bg-amber-50/80 border border-amber-200/60 p-3.5 rounded-xl flex items-center gap-2">
            ✨ <span className="font-medium">Tip Redaktur:</span> Ketik naskah di kolom kiri, hasil format Markdown, tabel, video YouTube, dan foto langsung dirender di pratinjau kanan secara instan.
          </p>

          {/* Toolbar Cepat */}
          <div className="p-2.5 border border-neutral-200 rounded-xl bg-neutral-50 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-3xs">
            <button 
              type="button" 
              onClick={handleUndo} 
              disabled={undoStack.length === 0}
              className={`p-2 rounded-lg shrink-0 transition-all shadow-3xs ${undoStack.length === 0 ? 'text-neutral-300 cursor-not-allowed' : 'hover:bg-white text-neutral-700'}`} 
              title="Undo (Kembalikan)"
            >
              <Undo2 size={16} />
            </button>
            <button 
              type="button" 
              onClick={handleRedo} 
              disabled={redoStack.length === 0}
              className={`p-2 rounded-lg shrink-0 transition-all shadow-3xs ${redoStack.length === 0 ? 'text-neutral-300 cursor-not-allowed' : 'hover:bg-white text-neutral-700'}`} 
              title="Redo (Ulangi)"
            >
              <Redo2 size={16} />
            </button>
            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-1" />
            <button type="button" onClick={() => applyFormat('bold')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Tebal (Bold)">
              <Bold size={16} />
            </button>
            <button type="button" onClick={() => applyFormat('italic')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Miring (Italic)">
              <Italic size={16} />
            </button>
            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-1" />
            <button type="button" onClick={() => applyFormat('formatBlock', '<h2>')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 font-bold text-xs transition-all shadow-3xs" title="Sub-judul (H2)">
              <Heading1 size={16} />
            </button>
            <button type="button" onClick={() => applyFormat('formatBlock', '<h3>')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 font-bold text-xs transition-all shadow-3xs" title="Sub-judul Kecil (H3)">
              <Heading2 size={16} />
            </button>
            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-1" />
            <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="List Poin">
              <List size={16} />
            </button>
            <button type="button" onClick={() => applyFormat('insertOrderedList')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="List Angka">
              <ListOrdered size={16} />
            </button>
            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-1" />
            <button type="button" onClick={() => applyFormat('justifyLeft')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Rata Kiri">
              <AlignLeft size={16} />
            </button>
            <button type="button" onClick={() => applyFormat('justifyCenter')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Rata Tengah">
              <AlignCenter size={16} />
            </button>
            <button type="button" onClick={() => applyFormat('justifyRight')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Rata Kanan">
              <AlignRight size={16} />
            </button>
            <button type="button" onClick={() => applyFormat('justifyFull')} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Rata Kiri Kanan (Justify)">
              <AlignJustify size={16} />
            </button>
            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-1" />
            <button type="button" onClick={handleOpenLinkModal} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Sisip Tautan Link">
              <LinkIcon size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button type="button" onClick={() => { saveSelection(); fileInputRef.current?.click(); }} className="p-2 hover:bg-white rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Sisipkan Gambar di Teks">
              <Image size={16} />
            </button>
            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-1" />
            <button type="button" onClick={handleOpenYouTube} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Sisip Video YouTube">
              <Video size={16} />
            </button>
            <button type="button" onClick={handleOpenInstagram} className="p-2 hover:bg-pink-50 hover:text-pink-600 rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Sisip Pratinjau Instagram">
              <Share2 size={16} />
            </button>
            <button type="button" onClick={handleOpenTable} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Sisip Tabel Data">
              <Table size={16} />
            </button>
            <button type="button" onClick={() => applyFormat('formatBlock', '<blockquote>')} className="p-2 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-neutral-700 shrink-0 transition-all shadow-3xs" title="Kutipan Narsum">
              <Quote size={16} />
            </button>
          </div>

          {/* Single Unified Live Worksheet Sheet (Preview IS the Editor) */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
            {/* Location Header */}
            <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
              <span className="font-bold tracking-wide text-neutral-900 uppercase text-xs sm:text-sm">
                📍 {currentArticle.news_location || 'Nasional'}, GNEXT NEWS — 
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Worksheet Editor</span>
              </span>
            </div>

            {/* Direct ContentEditable & Live Rendered Sheet Surface */}
            <div className="relative min-h-[420px] bg-neutral-50/40 border border-neutral-200/80 rounded-xl p-6 focus-within:ring-2 focus-within:ring-neutral-900 transition-all">
              {slashMenuOpen && slashOptions.length > 0 && (
                <div className="absolute z-50 left-6 top-16 w-80 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 flex items-center justify-between">
                    <span>Perintah Cepat (Slash Commands)</span>
                    <span className="text-neutral-500">Ketik / untuk cari</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {slashOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => executeSlashCommand(opt.id as any)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-neutral-50 flex items-center gap-3 group transition-all"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${opt.color} group-hover:scale-105 transition-transform`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-neutral-900">{opt.label}</div>
                            <div className="text-[11px] text-neutral-500 truncate">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div
                ref={contentEditableRef}
                contentEditable
                suppressContentEditableWarning
                dir="ltr"
                onInput={handleContentInput}
                onKeyUp={saveSelection}
                onClick={saveSelection}
                className="prose prose-neutral max-w-none text-neutral-800 text-sm sm:text-base leading-relaxed outline-none min-h-[380px] text-left ltr [&_table]:w-full [&_table]:border-collapse [&_table]:my-5 [&_th]:bg-neutral-100 [&_th]:border [&_th]:border-neutral-300 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_td]:border [&_td]:border-neutral-200 [&_td]:p-3 [&_tr:nth-child(even)]:bg-white [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-4 empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 empty:before:italic"
                data-placeholder="Ketik naskah berita di sini atau ketik '/' untuk memunculkan menu sisipan instan..."
              />
            </div>

            <div className="text-[11px] text-neutral-400 italic text-center">
              💡 Ketik langsung di atas. Setiap sisipan YouTube, Instagram, atau Tabel akan otomatis ter-render secara instan di lembar kerja ini.
            </div>
          </div>
        </div>

        {/* 5) SEO dan Hastag */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">5</span>
              <span>SEO & Hashtag (Kata Kunci Berita)</span>
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">Optimasi mesin pencari</span>
          </h3>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => {
                  const val = e.target.value;
                  if (val.includes(',')) {
                    const parts = val.split(',').map(p => p.trim().replace(/^#/, '')).filter(Boolean);
                    if (parts.length > 0) {
                      const existing = currentArticle.tags || [];
                      const updated = Array.from(new Set([...existing, ...parts]));
                      setCurrentArticle({ ...currentArticle, tags: updated });
                      setTagInput('');
                      return;
                    }
                  }
                  setTagInput(val);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const trimmed = tagInput.trim().replace(/^#/, '');
                    if (trimmed) {
                      const existing = currentArticle.tags || [];
                      if (!existing.includes(trimmed)) {
                        setCurrentArticle({ ...currentArticle, tags: [...existing, trimmed] });
                      }
                      setTagInput('');
                    }
                  }
                }}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium"
                placeholder="Ketik tag / hashtag (contoh: pemilu2026, ekonomi) lalu tekan Enter atau Koma..."
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = tagInput.trim().replace(/^#/, '');
                  if (trimmed) {
                    const existing = currentArticle.tags || [];
                    if (!existing.includes(trimmed)) {
                      setCurrentArticle({ ...currentArticle, tags: [...existing, trimmed] });
                    }
                    setTagInput('');
                  }
                }}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 shadow-sm"
              >
                Tambah
              </button>
            </div>

            {/* Render Tag Chips */}
            {currentArticle.tags && currentArticle.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {currentArticle.tags.map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 text-neutral-800 rounded-xl text-xs font-bold border border-neutral-200 shadow-3xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (currentArticle.tags || []).filter((_, i) => i !== idx);
                        setCurrentArticle({ ...currentArticle, tags: updated });
                      }}
                      className="text-neutral-400 hover:text-red-600 transition-colors p-0.5 rounded ml-1"
                      title="Hapus tag"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 font-medium">
                Belum ada hashtag ditambahkan. Tambahkan tag agar berita mudah diindeks oleh mesin pencari.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-neutral-200 bg-white/90 backdrop-blur-md sticky bottom-0 z-30 pb-4 px-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { navigate(getStudioRoute('news')); try { localStorage.removeItem('article_draft'); } catch (e) {}; }}
              className="px-6 py-3.5 font-bold text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
            >
              Batal
            </button>

            {/* Hero Image Ready Status Chip */}
            {currentArticle.cover_image ? (
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl">
                <img src={currentArticle.cover_image} alt="Hero Thumbnail" className="w-6 h-6 rounded-lg object-cover shadow-2xs" referrerPolicy="no-referrer" />
                <span className="text-[11px] font-bold text-emerald-800">Hero Image Ready</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-[11px] font-bold">
                <Camera size={13} />
                <span>Foto Sampul Wajib</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSave('draft')}
              className="px-6 py-3.5 border border-neutral-200 text-neutral-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-50 transition-all shadow-3xs"
            >
              Simpan Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              className="px-7 py-3.5 bg-neutral-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-md"
            >
              {currentArticle.status === 'published' ? 'Perbarui (Terbit)' : 'Terbitkan Sekarang'}
            </button>
          </div>
        </div>

        {/* Sticky Action Bar for Mobile Smartphones */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 flex items-center justify-between gap-2 z-40 shadow-2xl">
          <button
            onClick={() => { navigate(getStudioRoute('news')); try { localStorage.removeItem('article_draft'); } catch (e) {}; }}
            className="px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('draft')}
              className="px-3.5 py-2.5 bg-neutral-100 text-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 shadow-3xs"
            >
              Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-neutral-800"
            >
              {currentArticle.status === 'published' ? 'Perbarui' : 'Terbitkan'}
            </button>
          </div>
        </div>

        {/* Image Cropper Modal */}
        {cropTarget && (
          <ImageCropperModal
            imageFile={cropTarget.file}
            onCropComplete={handleCropComplete}
            onCancel={() => setCropTarget(null)}
          />
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl">
              <h3 className="text-lg font-display font-bold mb-1 flex items-center gap-2">
                {previewImage.isCover ? (
                  <>
                    <Sparkles size={18} className="text-amber-500" />
                    <span>Pratinjau Hero Image (Sampul Utama)</span>
                  </>
                ) : (
                  <span>Pratinjau Gambar Sisipan</span>
                )}
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                {previewImage.isCover
                  ? 'Konfirmasi foto ini untuk ditetapkan sebagai hero image thumbnail utama artikel.'
                  : 'Gambar ini telah dikompresi agar hemat kuota dan cepat dimuat.'}
              </p>
              
              <div className="bg-neutral-900 rounded-2xl overflow-hidden mb-5 flex items-center justify-center min-h-[220px] max-h-[350px] border border-neutral-800 p-2 shadow-inner">
                <img src={previewImage.dataUrl} alt="Preview" className="max-h-[300px] max-w-full object-contain rounded-xl" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  disabled={previewImage.isUploading}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmImageUpload}
                  disabled={previewImage.isUploading}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {previewImage.isUploading
                    ? 'Mengunggah...'
                    : (previewImage.isCover ? 'Tetapkan Sebagai Hero Image' : 'Sisipkan Ke Naskah')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLE CREATOR MODAL */}
        {tableModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-display font-bold">Buat / Edit Tabel Data</h3>
              <p className="text-xs text-neutral-500">Tentukan jumlah baris dan kolom untuk tabel berita.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Jumlah Baris (Rows)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={e => setTableRows(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Jumlah Kolom (Cols)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={e => setTableCols(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmInsertTable}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Sisipkan Tabel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LINK CREATOR MODAL */}
        {linkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-display font-bold">Sisipkan Tautan (Link)</h3>
              <p className="text-xs text-neutral-500">Tentukan teks tampil dan URL tujuan tautan.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Teks Tampil (Label)</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={e => setLinkText(e.target.value)}
                    placeholder="Contoh: Baca selengkapnya..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">URL Tujuan</label>
                  <input
                    type="text"
                    value={linkHref}
                    onChange={e => setLinkHref(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmInsertLink}
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  Sisipkan Tautan
                </button>
              </div>
            </div>
          </div>
        )}

      {/* GALLERY SELECTION MODAL */}
      {isGalleryModalOpen && createPortal(
        <div className="fixed inset-0 bg-neutral-900/65 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image size={18} className="text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-800">Pilih dari Galeri Cover</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-neutral-100 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari foto dari histori berdasarkan keterangan foto atau judul berita..."
                  value={gallerySearch}
                  onChange={e => setGallerySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-neutral-50/50">
              {galleryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, idx) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-xl overflow-hidden aspect-video animate-pulse" />
                  ))}
                </div>
              ) : (() => {
                const query = gallerySearch.toLowerCase().trim();
                const filtered = galleryItems.filter(item => {
                  const caption = (item.image_caption || '').toLowerCase();
                  const credit = (item.image_credit || '').toLowerCase();
                  const title = (item.title || '').toLowerCase();
                  return caption.includes(query) || credit.includes(query) || title.includes(query);
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-neutral-500 text-xs bg-white border border-neutral-200 rounded-2xl">
                      Tidak ada foto histori yang cocok dengan pencarian "{gallerySearch}".
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filtered.map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectGalleryPhoto(photo)}
                        className="group bg-white border border-neutral-200 hover:border-neutral-400 rounded-xl overflow-hidden transition-all cursor-pointer flex flex-col hover:shadow-xs"
                      >
                        <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
                          <img
                            src={photo.cover_image}
                            alt={photo.image_caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <p className="text-[10px] font-bold text-neutral-800 line-clamp-2 leading-tight" title={photo.image_caption}>
                            {photo.image_caption || 'Tanpa Keterangan'}
                          </p>
                          <p className="text-[9px] text-neutral-400 mt-1 truncate">
                            {photo.image_credit ? `Kredit: ${photo.image_credit}` : 'Tanpa Kredit'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 bg-white flex justify-end text-xs">
              <span className="text-neutral-400 self-center">Klik salah satu foto untuk memilih</span>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-0 space-y-4">
      {hasSavedDraft && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                Draf Artikel Belum Disimpan Ditemukan
              </h4>
              <p className="text-[11px] text-amber-700">
                Terdapat draf berita yang tersimpan otomatis di browser {draftTime ? `(${draftTime})` : ''}. Ingin memulihkan dan melanjutkannya?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Pulihkan & Tulis
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-3 py-2 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-all"
            >
              Hapus Draf
            </button>
          </div>
        </div>
      )}

      {/* Unified Compact Header & Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-xl px-3 py-2 mb-2.5 shadow-3xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2">
        
        {/* Left: Title & Count */}
        <div className="flex items-center gap-2 shrink-0">
          <h2 className="text-base sm:text-lg font-display font-bold text-neutral-900">Blog & Berita</h2>
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-[11px] font-bold">
            {sortedArticles.length}
          </span>
        </div>

        {/* Middle: Search input & Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-3xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-8 pr-7 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-900 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter Tabs (Segmented Control) */}
          <div className="hidden sm:inline-flex p-0.5 bg-neutral-100 rounded-lg border border-neutral-200/60 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-white text-neutral-900 shadow-3xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'published' ? 'bg-emerald-700 text-white shadow-3xs font-bold' : 'text-neutral-500 hover:text-emerald-700'
              }`}
            >
              Terbit
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'draft' ? 'bg-neutral-800 text-white shadow-3xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'archived' ? 'bg-orange-600 text-white shadow-3xs font-bold' : 'text-neutral-500 hover:text-orange-700'
              }`}
            >
              Arsip
            </button>
          </div>

          {/* Portal Filter (Admin only) */}
          {currentUser.role === 'Administrator' && (
            <select
              value={portalFilter}
              onChange={(e) => setPortalFilter(e.target.value)}
              className="hidden md:block py-1.5 px-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 focus:outline-none shrink-0"
            >
              <option value="all">Semua Portal</option>
              <optgroup label="Portal Utama">
                <option value="gnext">Gnext</option>
                <option value="yoikijatim">Jatim</option>
                <option value="lumajangtalks">Lumajang</option>
              </optgroup>
            </select>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-all shadow-3xs"
            title="Backup & Restore Data Berita (JSON/CSV)"
          >
            <Database size={13} />
            <span className="hidden sm:inline">Backup / Restore</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate(getStudioRoute('news/write'))}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 active:scale-98 transition-all shadow-3xs"
          >
            <Plus size={14} />
            <span>Tulis Artikel</span>
          </button>
        </div>
      </div>

      {/* MOBILE SMARTPHONE CARD VIEW (block md:hidden) */}
      <div className="block md:hidden space-y-2">
        {loading ? (
          <div className="p-6 text-center bg-white rounded-xl border border-neutral-200">
            <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-neutral-500 font-medium">Memuat data artikel...</p>
          </div>
        ) : sortedArticles.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-xl border border-neutral-200">
            <FileText size={28} className="mx-auto text-neutral-300 mb-1.5" />
            <p className="text-xs font-semibold text-neutral-700 mb-0.5">Artikel Tidak Ditemukan</p>
            <p className="text-[11px] text-neutral-400">Coba ubah kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          sortedArticles.map((article) => {
            const isPub = article.status === 'published';
            const articleUrl = getArticleUrl(article);

            return (
              <div key={article.id} className="bg-white border border-neutral-200 rounded-xl p-3 shadow-3xs space-y-2">
                <div className="flex items-start gap-2.5">
                  {/* Cover image preview */}
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200 flex items-center justify-center">
                    {article.cover_image ? (
                      <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={18} className="text-neutral-400" />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        article.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        article.status === 'archived' ? 'bg-orange-100 text-orange-800' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {article.status || 'draft'}
                      </span>

                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        getPortalStyle(article.portal || 'gnext')
                      }`}>
                        {getPortalById(article.portal || 'gnext').name}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2 mb-1">
                      {article.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-medium">
                      <span>{getCategoryName(article.categoryId)}</span>
                      <span>•</span>
                      <span>{formatDateDisplay(article.date, article.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Sub Metadata (Lokasi & Penulis) */}
                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-100">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-neutral-400" />
                    <span>{article.news_location || 'Nasional'}</span>
                  </span>
                  <span>Oleh: <strong className="text-neutral-700">{getAuthorName(article.authorId)}</strong></span>
                </div>

                {/* Smartphone Action Buttons */}
                {canEdit(article) && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <button 
                      onClick={() => navigate(getStudioRoute('news/edit/' + article.id))}
                      className="flex-1 py-1.5 px-2 bg-neutral-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 active:scale-98 transition-transform"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>

                    {isPub && (
                      <a 
                        href={articleUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg text-xs font-semibold flex items-center justify-center"
                        title="Lihat Berita"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {article.status !== 'archived' && (
                      <button 
                        onClick={() => handleArchive(article.id, article.title)}
                        className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-semibold"
                        title="Arsipkan"
                      >
                        <Archive size={14} />
                      </button>
                    )}

                    <button 
                      onClick={() => handleDelete(article.id, article.title)}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white border border-neutral-200 rounded-xl overflow-x-auto shadow-3xs">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-neutral-50/90 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-500 whitespace-nowrap">
              <th className="py-2.5 px-3.5 min-w-[260px]">Judul Berita</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Portal</th>
              <th className="py-2.5 px-3">Lokasi</th>
              <th className="py-2.5 px-3">Kategori</th>
              <th className="py-2.5 px-3">Penulis</th>
              <th className="py-2.5 px-3">Tanggal</th>
              <th className="py-2.5 px-3.5 text-right min-w-[100px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedArticles.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-500 text-xs">
                  Belum ada artikel berita yang cocok.
                </td>
              </tr>
            ) : sortedArticles.map((article) => (
              <tr key={article.id} className="hover:bg-neutral-50/70 transition-colors group">
                <td className="py-2.5 px-3.5 min-w-[260px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 flex items-center justify-center">
                      {article.cover_image ? (
                        <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={14} className="text-neutral-400" />
                      )}
                    </div>
                    <span 
                      onClick={() => canEdit(article) && navigate(getStudioRoute('news/edit/' + article.id))}
                      className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 line-clamp-2 cursor-pointer leading-snug"
                      title={article.title}
                    >
                      {article.title}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    article.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                    article.status === 'archived' ? 'bg-orange-100 text-orange-800' :
                    'bg-neutral-100 text-neutral-700'
                  }`}>
                    {article.status || 'draft'}
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                    getPortalStyle(article.portal || 'gnext')
                  }`}>
                    {getPortalById(article.portal || 'gnext').name}
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="text-[11px] text-neutral-600 font-medium">
                    {article.news_location || 'Nasional'}
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-[11px] font-medium">
                    {getCategoryName(article.categoryId)}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[11px] text-neutral-500 font-medium whitespace-nowrap">
                  {getAuthorName(article.authorId)}
                </td>
                <td className="py-2.5 px-3 text-[11px] text-neutral-500 font-medium whitespace-nowrap">
                  {formatDateDisplay(article.date, article.created_at)}
                </td>
                <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {article.status === 'published' && (
                      <a 
                        href={getArticleUrl(article)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center justify-center"
                        title="Lihat Berita"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {canEdit(article) && (
                      <>
                        <button 
                          onClick={() => navigate(getStudioRoute('news/edit/' + article.id))} 
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center justify-center" 
                          title="Edit Berita"
                        >
                          <Edit2 size={14} />
                        </button>
                        {article.status !== 'archived' && (
                          <button 
                            onClick={() => handleArchive(article.id, article.title)} 
                            className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors flex items-center justify-center" 
                            title="Arsipkan"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(article.id, article.title)} 
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center" 
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Action Button (FAB) for Smartphones */}
      <div className="md:hidden fixed bottom-5 right-4 z-30">
        <button
          onClick={() => navigate(getStudioRoute('news/write'))}
          className="flex items-center gap-2 px-5 py-3.5 bg-neutral-900 text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-2xl active:scale-95 transition-transform border border-neutral-700"
        >
          <Plus size={20} />
          <span>Tulis Artikel</span>
        </button>
      </div>

      {/* GALLERY SELECTION MODAL */}
      {isGalleryModalOpen && createPortal(
        <div className="fixed inset-0 bg-neutral-900/65 backdrop-blur-xs z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image size={18} className="text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-800">Pilih dari Galeri Cover</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-neutral-100 bg-white">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari foto dari histori berdasarkan keterangan foto atau judul berita..."
                  value={gallerySearch}
                  onChange={e => setGallerySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-neutral-50/50">
              {galleryLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, idx) => (
                    <div key={idx} className="bg-white border border-neutral-200 rounded-xl overflow-hidden aspect-video animate-pulse" />
                  ))}
                </div>
              ) : (() => {
                const query = gallerySearch.toLowerCase().trim();
                const filtered = galleryItems.filter(item => {
                  const caption = (item.image_caption || '').toLowerCase();
                  const credit = (item.image_credit || '').toLowerCase();
                  const title = (item.title || '').toLowerCase();
                  return caption.includes(query) || credit.includes(query) || title.includes(query);
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-neutral-500 text-xs bg-white border border-neutral-200 rounded-2xl">
                      Tidak ada foto histori yang cocok dengan pencarian "{gallerySearch}".
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filtered.map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectGalleryPhoto(photo)}
                        className="group bg-white border border-neutral-200 hover:border-neutral-400 rounded-xl overflow-hidden transition-all cursor-pointer flex flex-col hover:shadow-xs"
                      >
                        <div className="aspect-[16/10] bg-neutral-100 overflow-hidden relative">
                          <img
                            src={photo.cover_image}
                            alt={photo.image_caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <p className="text-[10px] font-bold text-neutral-800 line-clamp-2 leading-tight" title={photo.image_caption}>
                            {photo.image_caption || 'Tanpa Keterangan'}
                          </p>
                          <p className="text-[9px] text-neutral-400 mt-1 truncate">
                            {photo.image_credit ? `Kredit: ${photo.image_credit}` : 'Tanpa Kredit'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 bg-white flex justify-end text-xs">
              <span className="text-neutral-400 self-center">Klik salah satu foto untuk memilih</span>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* BACKUP & RESTORE MODAL */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        currentUser={currentUser}
        defaultTable="articles"
        onRestoreComplete={() => {
          fetchArticles();
        }}
      />
    </div>
  );
}
