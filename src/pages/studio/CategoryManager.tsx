import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ArrowLeft, ExternalLink, FileText, Folder, Layers, ChevronDown, ChevronUp, Globe, DollarSign, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category, User, Article } from './types';
import { logAudit } from '../../lib/audit';
import { GUMMAH_SUBCATS as UMMAH_SUBCATS, FINANCE_SUBCATS } from '../../lib/categoriesConfig';

export default function CategoryManager({ currentUser }: { currentUser: User }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [selectedThematicSub, setSelectedThematicSub] = useState<{
    portal: 'gummah' | 'finance';
    portalName: string;
    subName: string;
  } | null>(null);

  const [isUmmahExpanded, setIsUmmahExpanded] = useState(true);
  const [isFinanceExpanded, setIsFinanceExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, artRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('articles').select('*')
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (artRes.data) setArticles(artRes.data);
    } catch (error) {
      console.error('Failed to load category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentCategory.name || !currentCategory.slug) return;
    
    try {
      const payload: any = { 
        name: currentCategory.name, 
        slug: currentCategory.slug
      };

      if (currentCategory.id) {
        await supabase
          .from('categories')
          .update(payload)
          .eq('id', currentCategory.id);
        await logAudit(currentUser.name, 'UPDATE', 'Category', `Updated category: ${currentCategory.name}`);
      } else {
        await supabase
          .from('categories')
          .insert([payload]);
        await logAudit(currentUser.name, 'CREATE', 'Category', `Created category: ${currentCategory.name}`);
      }
      
      await loadData();
      setIsEditing(false);
      setCurrentCategory({});
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    if (confirm('Yakin ingin menghapus kategori ini? Semua artikel dalam kategori ini juga akan terhapus.')) {
      try {
        await supabase.from('categories').delete().eq('id', id);
        await logAudit(currentUser.name, 'DELETE', 'Category', `Deleted category: ${name || id}`);
        if (categories) setCategories(categories.filter(c => c.id !== id));
        if (selectedCategory?.id === id) setSelectedCategory(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const getCategoryArticleCount = (categoryId: string) => {
    return articles.filter(a => (a.categoryId === categoryId || a.category_id === categoryId)).length;
  };

  const getCategoryArticles = (categoryId: string) => {
    return articles.filter(a => (a.categoryId === categoryId || a.category_id === categoryId));
  };

  const getSubCategoryArticles = (portalId: string, subName: string) => {
    return articles.filter(a => {
      if (a.portal !== portalId) return false;
      const sub = (a as any).sub_category || (a as any).category || (a as any).categorySlug || (a as any).categoryName || (a as any).ummah_tier2;
      if (!sub) return false;
      const normSub = String(sub).toLowerCase().replace(/[^a-z0-9]+/g, '');
      const normTarget = subName.toLowerCase().replace(/[^a-z0-9]+/g, '');
      return normSub === normTarget || String(sub).toLowerCase().includes(subName.toLowerCase());
    });
  };

  if (currentUser.role !== 'Administrator' && currentUser.role !== 'Manajer Pers') {
    return <div className="p-8 text-center text-neutral-500">Anda tidak memiliki akses ke halaman ini.</div>;
  }

  // Detail view for general category
  if (selectedCategory) {
    const catArticles = getCategoryArticles(selectedCategory.id);
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors border border-neutral-200 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                  /{selectedCategory.slug}
                </span>
                <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  {catArticles.length} Berita
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 mt-0.5">
                Kategori: {selectedCategory.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="py-3.5 px-6">Judul Berita</th>
                  <th className="py-3.5 px-6">Portal</th>
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6 text-right">Link Berita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {catArticles.map((article) => {
                  const portalName = article.portal === 'lumajangtalks' ? 'Lumajang Talks' : article.portal === 'yoikijatim' ? 'Yo Iki Jatim' : article.portal === 'gummah' ? 'Gnext Ummah' : article.portal === 'finance' ? 'Gnext Finance' : 'GN Indonesia';
                  const articleUrl = `/${article.portal || 'gnext'}/${article.id}`;
                  return (
                    <tr key={article.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-4 px-6 font-medium text-neutral-900">
                        <div className="flex items-center gap-2.5">
                          <FileText size={16} className="text-neutral-400 shrink-0" />
                          <span className="line-clamp-1">{article.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md">
                          {portalName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-neutral-500 font-mono">
                        {article.date || article.created_at?.split('T')[0]}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a 
                          href={articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          <span>Buka Link</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {catArticles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-neutral-400 text-sm">
                      Belum ada berita dalam kategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Detail view for Thematic Subcategory (Ummah / Finance)
  if (selectedThematicSub) {
    const subArticles = getSubCategoryArticles(selectedThematicSub.portal, selectedThematicSub.subName);
    const isUmmah = selectedThematicSub.portal === 'gummah';
    
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedThematicSub(null)}
              className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors border border-neutral-200 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isUmmah ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  Subkategori {selectedThematicSub.portalName}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  isUmmah ? 'text-emerald-800 bg-emerald-50' : 'text-blue-800 bg-blue-50'
                }`}>
                  {subArticles.length} Berita
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900 mt-0.5">
                Sub-Menu: {selectedThematicSub.subName}
              </h2>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="py-3.5 px-6">Judul Berita</th>
                  <th className="py-3.5 px-6">Portal</th>
                  <th className="py-3.5 px-6">Tanggal</th>
                  <th className="py-3.5 px-6 text-right">Link Berita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {subArticles.map((article) => {
                  const articleUrl = `/${selectedThematicSub.portal}/${article.id}`;
                  return (
                    <tr key={article.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-4 px-6 font-medium text-neutral-900">
                        <div className="flex items-center gap-2.5">
                          <FileText size={16} className={isUmmah ? "text-emerald-600 shrink-0" : "text-blue-600 shrink-0"} />
                          <span className="line-clamp-1">{article.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          isUmmah ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedThematicSub.portalName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-neutral-500 font-mono">
                        {article.date || article.created_at?.split('T')[0]}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a 
                          href={articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-colors shadow-xs ${
                            isUmmah ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <span>Buka Link</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {subArticles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-neutral-400 text-sm">
                      Belum ada berita dalam subkategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 md:p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-display font-bold">
            {currentCategory.id ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-neutral-700">Nama Kategori</label>
            <input
              type="text"
              value={currentCategory.name || ''}
              onChange={e => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setCurrentCategory({ ...currentCategory, name, slug });
              }}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Contoh: Teknologi"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-neutral-700">Slug</label>
            <input
              type="text"
              value={currentCategory.slug || ''}
              onChange={e => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="teknologi"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
            >
              Simpan Kategori
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 tracking-tight">Kategori & Subkategori Berita</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">Kelola struktur navigasi kategori utama, Gnext Ummah, dan Gnext Finance.</p>
        </div>
        <button 
          onClick={() => { setCurrentCategory({}); setIsEditing(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-sm text-xs font-bold tracking-wide uppercase shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* UNIFIED CATEGORIES & SUB-CATEGORIES SECTION */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder size={18} className="text-neutral-600" />
            <h3 className="font-display font-bold text-neutral-900 text-base">Kategori Berita Utama, Tematik & Regional</h3>
          </div>
          <span className="text-xs font-bold text-neutral-500 bg-white px-2.5 py-1 rounded-md border border-neutral-200">
            {categories.length} Kategori
          </span>
        </div>

        <div className="divide-y divide-neutral-100">
          {categories?.map((category) => {
            const count = getCategoryArticleCount(category.id);
            const slugLower = (category.slug || '').toLowerCase();
            const nameLower = (category.name || '').toLowerCase();

            const isUmmahCat = slugLower === 'gummah' || slugLower === 'g-ummah' || slugLower === 'ummah' || nameLower.includes('ummah');
            const isFinanceCat = slugLower === 'finance' || slugLower === 'gnext-finance' || nameLower.includes('finance');

            if (isUmmahCat) {
              return (
                <div key={category.id} className="bg-emerald-50/30">
                  <div 
                    onClick={() => setIsUmmahExpanded(!isUmmahExpanded)}
                    className="p-5 flex items-center justify-between hover:bg-emerald-50/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); }}
                            className="font-display font-bold text-emerald-950 text-base hover:text-emerald-700 hover:underline transition-colors"
                          >
                            {category.name}
                          </h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            /{category.slug}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full uppercase tracking-wider">
                            Tematik Syariah
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Memiliki {UMMAH_SUBCATS.length} sub-kategori tematik Islami & Syariah.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 bg-white text-emerald-800 rounded-full border border-emerald-200 shadow-2xs">
                        {count} Artikel
                      </span>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => { setCurrentCategory(category); setIsEditing(true); }} 
                          className="p-2 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/80 rounded-lg transition-colors cursor-pointer"
                          title="Edit Kategori"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id, category.name)} 
                          className="p-2 text-emerald-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="pl-1 text-emerald-700">
                        {isUmmahExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {isUmmahExpanded && (
                    <div className="pl-6 pr-4 pb-4 pt-1 space-y-1 bg-emerald-50/20 border-t border-emerald-100/60">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70 px-4 py-1.5 flex items-center justify-between">
                        <span>Daftar Sub-Kategori {category.name}:</span>
                        <span className="text-[10px] font-normal text-emerald-700">Klik sub-kategori untuk melihat berita terkait</span>
                      </div>
                      {UMMAH_SUBCATS.map((sub) => {
                        const subArticlesCount = getSubCategoryArticles('gummah', sub).length;
                        return (
                          <div
                            key={sub}
                            onClick={() => setSelectedThematicSub({ portal: 'gummah', portalName: 'Gnext Ummah', subName: sub })}
                            className="p-3 px-4 rounded-xl flex items-center justify-between hover:bg-white transition-all cursor-pointer group/sub shadow-2xs border border-emerald-100/40"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover/sub:scale-125 transition-transform" />
                              <span className="font-bold text-xs text-neutral-800 group-hover/sub:text-emerald-700 transition-colors">
                                {sub}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-100/80 text-emerald-800 rounded-md">
                                {subArticlesCount} Berita
                              </span>
                              <ArrowLeft size={14} className="text-emerald-500 rotate-180 group-hover/sub:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (isFinanceCat) {
              return (
                <div key={category.id} className="bg-blue-50/30">
                  <div 
                    onClick={() => setIsFinanceExpanded(!isFinanceExpanded)}
                    className="p-5 flex items-center justify-between hover:bg-blue-50/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <DollarSign size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={(e) => { e.stopPropagation(); setSelectedCategory(category); }}
                            className="font-display font-bold text-blue-950 text-base hover:text-blue-700 hover:underline transition-colors"
                          >
                            {category.name}
                          </h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                            /{category.slug}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded-full uppercase tracking-wider">
                            Ekonomi & Bisnis
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Memiliki {FINANCE_SUBCATS.length} sub-kategori ekonomi & keuangan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-3 py-1 bg-white text-blue-800 rounded-full border border-blue-200 shadow-2xs">
                        {count} Artikel
                      </span>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => { setCurrentCategory(category); setIsEditing(true); }} 
                          className="p-2 text-blue-700 hover:text-blue-950 hover:bg-blue-100/80 rounded-lg transition-colors cursor-pointer"
                          title="Edit Kategori"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id, category.name)} 
                          className="p-2 text-blue-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="pl-1 text-blue-700">
                        {isFinanceExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {isFinanceExpanded && (
                    <div className="pl-6 pr-4 pb-4 pt-1 space-y-1 bg-blue-50/20 border-t border-blue-100/60">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800/70 px-4 py-1.5 flex items-center justify-between">
                        <span>Daftar Sub-Kategori {category.name}:</span>
                        <span className="text-[10px] font-normal text-blue-700">Klik sub-kategori untuk melihat berita terkait</span>
                      </div>
                      {FINANCE_SUBCATS.map((sub) => {
                        const subArticlesCount = getSubCategoryArticles('finance', sub).length;
                        return (
                          <div
                            key={sub}
                            onClick={() => setSelectedThematicSub({ portal: 'finance', portalName: 'Gnext Finance', subName: sub })}
                            className="p-3 px-4 rounded-xl flex items-center justify-between hover:bg-white transition-all cursor-pointer group/sub shadow-2xs border border-blue-100/40"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500 group-hover/sub:scale-125 transition-transform" />
                              <span className="font-bold text-xs text-neutral-800 group-hover/sub:text-blue-700 transition-colors">
                                {sub}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-100/80 text-blue-800 rounded-md">
                                {subArticlesCount} Berita
                              </span>
                              <ArrowLeft size={14} className="text-blue-500 rotate-180 group-hover/sub:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div 
                key={category.id} 
                onClick={() => setSelectedCategory(category)}
                className="p-5 flex items-center justify-between hover:bg-neutral-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                    <Folder size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-neutral-900 text-base group-hover:text-blue-600 transition-colors">{category.name}</h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                        /{category.slug}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full">
                    {count} Artikel
                  </span>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => { setCurrentCategory(category); setIsEditing(true); }} 
                      className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id, category.name)} 
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {(!categories || categories.length === 0) && !loading && (
            <div className="p-12 text-center text-neutral-400 text-sm">
              Belum ada kategori umum. Silakan tambah kategori baru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
