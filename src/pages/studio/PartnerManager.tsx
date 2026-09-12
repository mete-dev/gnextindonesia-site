import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Partner, User } from './types';
import { logAudit } from '../../lib/audit';
import { compressImageToMax20KB } from '../../lib/imageCompressor';

const compressLogoHighQuality = async (file: File): Promise<string> => {
  return compressImageToMax20KB(file);
};

export default function PartnerManager({ currentUser }: { currentUser: User }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner.name) return;

    try {
      if (currentPartner.id) {
        await supabase.from('partners').update({ 
          name: currentPartner.name, 
          logo_url: currentPartner.logo_url || null 
        }).eq('id', currentPartner.id);
        await logAudit(currentUser.name, 'UPDATE', currentPartner.id, `Updated partner: ${currentPartner.name}`);
      } else {
        const { data, error } = await supabase.from('partners').insert([{ 
          name: currentPartner.name, 
          logo_url: currentPartner.logo_url || null 
        }]).select().single();
        if (error) throw error;
        if (data) {
          await logAudit(currentUser.name, 'CREATE', data.id, `Created partner: ${currentPartner.name}`);
        }
      }
      setIsEditing(false);
      setCurrentPartner({});
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('Gagal menyimpan data.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus partner ini?')) {
      try {
        await supabase.from('partners').delete().eq('id', id);
        await logAudit(currentUser.name, 'DELETE', id, 'Deleted partner');
        fetchPartners();
      } catch (error) {
        console.error('Error deleting partner:', error);
        alert('Gagal menghapus data.');
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressLogoHighQuality(file);
      setCurrentPartner({ ...currentPartner, logo_url: dataUrl });
    } catch (err) {
      console.error('Failed to compress logo:', err);
      alert('Gagal memproses logo.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredPartners = partners.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">{currentPartner.id ? 'Edit Partner' : 'Tambah Partner'}</h2>
          <button onClick={() => { setIsEditing(false); setCurrentPartner({}); }} className="text-neutral-500 hover:text-neutral-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Perusahaan / Partner <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={currentPartner.name || ''}
              onChange={(e) => setCurrentPartner({ ...currentPartner, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition-all"
              placeholder="Masukkan nama partner..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Logo Partner (Opsional)</label>
            <div className="flex items-center gap-4">
              {Boolean(currentPartner.logo_url && currentPartner.logo_url.trim()) && (
                <div className="relative group">
                  <img src={currentPartner.logo_url!} alt="Logo preview" className="h-20 w-auto object-contain bg-neutral-100 p-2 rounded-xl" />
                  <button 
                    type="button" 
                    onClick={() => setCurrentPartner({ ...currentPartner, logo_url: null })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Format gambar bebas, otomatis di-compress. Jika kosong akan menampilkan teks nama.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button type="button" onClick={() => { setIsEditing(false); setCurrentPartner({}); }} className="px-6 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 font-medium">Batal</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 font-medium">Simpan</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Data Partner</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Cari partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-sm focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none w-full sm:w-64"
            />
          </div>
          <button onClick={() => { setCurrentPartner({}); setIsEditing(true); }} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 text-sm font-medium whitespace-nowrap">
            <Plus size={18} />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Logo</th>
              <th className="px-6 py-4 font-medium">Nama Partner</th>
              <th className="px-6 py-4 font-medium w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-neutral-500">Memuat data...</td></tr>
            ) : filteredPartners.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-neutral-500">Tidak ada partner yang ditemukan.</td></tr>
            ) : (
              filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    {partner.logo_url && partner.logo_url.trim() ? (
                       <img src={partner.logo_url} alt={partner.name} className="h-10 w-auto object-contain" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {partner.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setCurrentPartner(partner); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(partner.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Hapus">
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
