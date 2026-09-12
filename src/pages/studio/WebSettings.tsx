import React, { useState, useEffect } from 'react';
import { Edit2, X, Globe, RefreshCw, CheckCircle2, ExternalLink, FileText, Database, Sliders } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageSetting, User } from './types';
import { logAudit } from '../../lib/audit';
import { BackupRestoreModal, BackupRestoreView } from '../../components/studio/BackupRestoreModal';
import { BackupTable } from '../../lib/dataBackup';

interface WebSettingsProps {
  currentUser: User;
  activeSection?: 'general' | 'seo' | 'backup';
}

export default function WebSettings({ currentUser, activeSection: initialSection = 'general' }: WebSettingsProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'seo' | 'backup'>(initialSection);
  const [settings, setSettings] = useState<PageSetting[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSetting, setCurrentSetting] = useState<Partial<PageSetting>>({});
  const [loading, setLoading] = useState(true);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapStatus, setSitemapStatus] = useState<{ success?: boolean; message?: string; counts?: { gnext: number; yoikijatim: number; lumajangtalks: number; total: number } } | null>(null);
  
  // Backup & Restore state
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupModalTable, setBackupModalTable] = useState<BackupTable>('all');

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('web_settings').select('*').order('path');
      if (data) setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSitemap = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch('/api/update-sitemap', { method: 'POST' });
      const json = await res.json();
      setSitemapStatus(json);
      await logAudit(currentUser.name, 'UPDATE', 'Web Settings', 'Dynamic Sitemap generated & synchronized across all portals');
    } catch (err: any) {
      setSitemapStatus({ success: false, message: err.message || 'Gagal membuat sitemap' });
    } finally {
      setSitemapLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentSetting.title || !currentSetting.id) return;
    
    try {
      await supabase
        .from('web_settings')
        .update({
          title: currentSetting.title,
          description: currentSetting.description,
          content: currentSetting.content,
        })
        .eq('id', currentSetting.id);
        
      await logAudit(currentUser.name, 'UPDATE', 'Web Settings', `Updated setting for path: ${currentSetting.path}`);
        
      await loadSettings();
      setIsEditing(false);
      setCurrentSetting({});
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (currentUser.role !== 'Administrator') {
    return <div className="p-8 text-center text-neutral-500">Anda tidak memiliki akses ke halaman ini. (Khusus Administrator)</div>;
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 md:p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-display font-bold">
            {currentSetting.path?.endsWith('-locations') 
              ? `Edit Kategori Wilayah: ${currentSetting.title}` 
              : `Edit Pengaturan Halaman: ${currentSetting.path}`}
          </h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-neutral-700">
              {currentSetting.path?.endsWith('-locations') ? 'Nama Pengaturan' : 'Meta Title'}
            </label>
            <input
              type="text"
              value={currentSetting.title || ''}
              onChange={e => setCurrentSetting({ ...currentSetting, title: e.target.value })}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-neutral-700">
              {currentSetting.path?.endsWith('-locations') ? 'Deskripsi Pengaturan' : 'Meta Description'}
            </label>
            <textarea
              rows={4}
              value={currentSetting.description || ''}
              onChange={e => setCurrentSetting({ ...currentSetting, description: e.target.value })}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-neutral-700">
              {currentSetting.path?.endsWith('-locations') 
                ? 'Daftar Kategori Lokasi/Daerah (pisahkan dengan koma)' 
                : 'Konten Tambahan (Opsional)'}
            </label>
            <textarea
              rows={4}
              value={currentSetting.content || ''}
              onChange={e => setCurrentSetting({ ...currentSetting, content: e.target.value })}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-y"
              placeholder={currentSetting.path?.endsWith('-locations') 
                ? 'Contoh: Surabaya, Malang, Banyuwangi, Kediri...' 
                : 'Konten kustom untuk halaman ini...'}
            />
            {currentSetting.path?.endsWith('-locations') && (
              <p className="text-[11px] text-neutral-500 mt-1.5 leading-normal">
                Penting: Pisahkan setiap wilayah dengan tanda koma ( , ). Wilayah yang ditambahkan di sini akan langsung menjadi opsi filter di portal publik dan dashboard penulis.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Settings Sub Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
            {activeSection === 'seo' ? 'SEO & Sitemaps' : activeSection === 'backup' ? 'Backup & Restore Data' : 'Pengaturan Halaman (Web Settings)'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {activeSection === 'seo' 
              ? 'Kelola peta situs sitemap XML dinamis dan optimasi SEO mesin pencari.' 
              : activeSection === 'backup' 
              ? 'Pencadangan database otomatis dan pemulihan cerdas non-destruktif.' 
              : 'Kelola metadata title, description, dan daftar kategori wilayah portal.'}
          </p>
        </div>
      </div>

      {/* Section 1: General Settings (Halaman & Wilayah) */}
      {activeSection === 'general' && (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-2xl overflow-hidden max-w-5xl shadow-3xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-5">Path Halaman</th>
                  <th className="py-3 px-5">Meta Title</th>
                  <th className="py-3 px-5">Meta Description / Konten</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {settings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-5 font-mono text-[11px] text-neutral-800 font-semibold">{setting.path}</td>
                    <td className="py-3 px-5 font-medium max-w-[200px] truncate text-neutral-900">{setting.title}</td>
                    <td className="py-3 px-5 text-neutral-500 text-[11px] max-w-[320px] truncate">{setting.description || setting.content}</td>
                    <td className="py-3 px-5 text-right">
                      <button onClick={() => { setCurrentSetting(setting); setIsEditing(true); }} className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-2.5">
            {settings.map((setting) => (
              <div key={setting.id} className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-3xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md font-medium">
                    {setting.path}
                  </span>
                  <button
                    onClick={() => { setCurrentSetting(setting); setIsEditing(true); }}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg active:scale-95 transition-transform"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <h3 className="font-bold text-neutral-900 text-xs">{setting.title}</h3>
                {setting.description && (
                  <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">{setting.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Backup & Restore (Full Web Page View, Not Pop-up) */}
      {activeSection === 'backup' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 max-w-5xl shadow-3xs space-y-6">
          <BackupRestoreView currentUser={currentUser} onRestoreComplete={loadSettings} />
        </div>
      )}

      {/* Section 3: Dynamic Sitemap & SEO Panel */}
      {activeSection === 'seo' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 max-w-5xl shadow-3xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="text-neutral-900" size={18} />
                <h3 className="text-base font-bold font-display text-neutral-900">Dynamic Sitemap & SEO Control</h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Sitemap.xml otomatis memperbarui indeks Google & Bing untuk seluruh artikel berita yang dipublikasikan di Gnext News, YoikiJatim, LumajangTalks, dan seluruh jaringan portal.
              </p>
            </div>
            <button
              onClick={handleRegenerateSitemap}
              disabled={sitemapLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-3xs self-start sm:self-auto"
            >
              <RefreshCw size={13} className={sitemapLoading ? 'animate-spin' : ''} />
              {sitemapLoading ? 'Generasi...' : 'Sinkronisasi Sitemap'}
            </button>
          </div>

          {sitemapStatus && (
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${sitemapStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 size={15} className={sitemapStatus.success ? 'text-emerald-600' : 'text-red-600'} />
                {sitemapStatus.success ? 'Sitemap Berhasil Diperbarui & Disinkronkan!' : 'Gagal Memperbarui Sitemap'}
              </div>
              <p className="text-neutral-600 text-[11px]">{sitemapStatus.message}</p>

              {sitemapStatus.counts && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5 pt-2.5 border-t border-emerald-200/60 font-mono text-center">
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                    <span className="block text-[10px] text-neutral-500">GNEXT NEWS</span>
                    <strong className="text-emerald-900 text-xs">{sitemapStatus.counts.gnext} Artikel</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                    <span className="block text-[10px] text-neutral-500">YO IKI JATIM</span>
                    <strong className="text-emerald-900 text-xs">{sitemapStatus.counts.yoikijatim} Artikel</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                    <span className="block text-[10px] text-neutral-500">LUMAJANG TALKS</span>
                    <strong className="text-emerald-900 text-xs">{sitemapStatus.counts.lumajangtalks} Artikel</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                    <span className="block text-[10px] text-neutral-500">TOTAL URL INDEKS</span>
                    <strong className="text-emerald-900 text-xs">{sitemapStatus.counts.total} URL</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Sitemap URLs */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <FileText size={13} /> Akses Tautan XML & Robots.txt Secara Langsung
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors font-medium text-neutral-800"
              >
                <span>Master Dynamic Sitemap (/sitemap.xml)</span>
                <ExternalLink size={13} className="text-neutral-400" />
              </a>
              <a
                href="/sitemap-news.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors font-medium text-neutral-800"
              >
                <span>Sitemap GNEXT NEWS (/sitemap-news.xml)</span>
                <ExternalLink size={13} className="text-neutral-400" />
              </a>
              <a
                href="/sitemap-yoikijatim.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors font-medium text-neutral-800"
              >
                <span>Sitemap YO IKI JATIM (/sitemap-yoikijatim.xml)</span>
                <ExternalLink size={13} className="text-neutral-400" />
              </a>
              <a
                href="/sitemap-lumajangtalks.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors font-medium text-neutral-800"
              >
                <span>Sitemap LUMAJANG TALKS (/sitemap-lumajangtalks.xml)</span>
                <ExternalLink size={13} className="text-neutral-400" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors font-medium text-neutral-800 sm:col-span-2"
              >
                <span>Robots.txt Configuration (/robots.txt)</span>
                <ExternalLink size={13} className="text-neutral-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Restore Modal Dialog */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        currentUser={currentUser}
        defaultTable={backupModalTable}
        onRestoreComplete={() => {
          loadSettings();
        }}
      />
    </div>
  );
}