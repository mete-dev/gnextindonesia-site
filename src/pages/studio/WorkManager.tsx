import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Work, User } from './types';
import { logAudit } from '../../lib/audit';

export default function WorkManager({ currentUser }: { currentUser: User }) {
  const [works, setWorks] = useState<Work[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWork, setCurrentWork] = useState<Partial<Work>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('works').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWork.instagram_url) return;

    try {
      if (currentWork.id) {
        await supabase.from('works').update({ instagram_url: currentWork.instagram_url }).eq('id', currentWork.id);
        await logAudit(currentUser.name, 'UPDATE', currentWork.id, `Updated work URL: ${currentWork.instagram_url}`);
      } else {
        const { data, error } = await supabase.from('works').insert([{ instagram_url: currentWork.instagram_url }]).select().single();
        if (error) throw error;
        if (data) {
          await logAudit(currentUser.name, 'CREATE', data.id, `Created work URL: ${currentWork.instagram_url}`);
        }
      }
      setIsEditing(false);
      setCurrentWork({});
      fetchWorks();
    } catch (error) {
      console.error('Error saving work:', error);
      alert('Gagal menyimpan data.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus karya ini?')) {
      try {
        await supabase.from('works').delete().eq('id', id);
        await logAudit(currentUser.name, 'DELETE', id, 'Deleted work');
        fetchWorks();
      } catch (error) {
        console.error('Error deleting work:', error);
        alert('Gagal menghapus data.');
      }
    }
  };

  const filteredWorks = works.filter(w => w.instagram_url.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">{currentWork.id ? 'Edit Karya' : 'Tambah Karya'}</h2>
          <button onClick={() => { setIsEditing(false); setCurrentWork({}); }} className="text-neutral-500 hover:text-neutral-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">URL Postingan Instagram</label>
            <input
              type="url"
              required
              value={currentWork.instagram_url || ''}
              onChange={(e) => setCurrentWork({ ...currentWork, instagram_url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all"
              placeholder="https://www.instagram.com/p/..."
            />
            <p className="text-xs text-neutral-500 mt-2">Pastikan URL valid dari postingan Instagram (Reels atau Post).</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button type="button" onClick={() => { setIsEditing(false); setCurrentWork({}); }} className="px-6 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 font-medium">Batal</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 font-medium">Simpan</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Katalog Karya</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Cari URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none w-full sm:w-64"
            />
          </div>
          <button onClick={() => { setCurrentWork({}); setIsEditing(true); }} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 text-sm font-medium whitespace-nowrap">
            <Plus size={18} />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Instagram URL</th>
              <th className="px-6 py-4 font-medium w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={2} className="px-6 py-8 text-center text-neutral-500">Memuat data...</td></tr>
            ) : filteredWorks.length === 0 ? (
              <tr><td colSpan={2} className="px-6 py-8 text-center text-neutral-500">Tidak ada karya yang ditemukan.</td></tr>
            ) : (
              filteredWorks.map((work) => (
                <tr key={work.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <a href={work.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline line-clamp-1">
                      {work.instagram_url}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setCurrentWork(work); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(work.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
