import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Search, Users, Shield, UserCheck, 
  MapPin, Mail, Phone, Calendar, Globe, Eye, Filter, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User, Role } from './types';
import { logAudit } from '../../lib/audit';
import { ALL_PORTALS, getPortalById } from '../../lib/portals';
import { Country, State, City } from 'country-state-city';

// --- Helper for single column domisili ---
const parseDomisili = (jsonStr?: string) => {
  if (!jsonStr) return { negara: '', provinsi: '', kota: '', kecamatan: '', desa: '', detail: '' };
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return { negara: '', provinsi: '', kota: '', kecamatan: '', desa: '', detail: jsonStr };
  }
};

export default function UserManager({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> & { passwordConfirm?: string }>({});
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [portalFilter, setPortalFilter] = useState<string>('ALL');

  // Form State for Domisili
  const [domNegara, setDomNegara] = useState('');
  const [domProvinsi, setDomProvinsi] = useState('');
  const [domKota, setDomKota] = useState('');
  const [domKecamatan, setDomKecamatan] = useState('');
  const [domDesa, setDomDesa] = useState('');
  const [domDetail, setDomDetail] = useState('');

  // API State for Indonesia (Emsifa)
  const [indoProvinces, setIndoProvinces] = useState<any[]>([]);
  const [indoCities, setIndoCities] = useState<any[]>([]);
  const [indoDistricts, setIndoDistricts] = useState<any[]>([]);
  const [indoVillages, setIndoVillages] = useState<any[]>([]);

  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  // --- Initial population when editingUser changes ---
  useEffect(() => {
    if (editingUser.id || isEditing) {
      const parsed = parseDomisili(editingUser.domisili);
      setDomNegara(parsed.negara || '');
      setDomProvinsi(parsed.provinsi || '');
      setDomKota(parsed.kota || '');
      setDomKecamatan(parsed.kecamatan || '');
      setDomDesa(parsed.desa || '');
      setDomDetail(parsed.detail || '');
    }
  }, [editingUser.id, editingUser.domisili, isEditing]);

  // --- Set country and state codes based on string values for Global Country-State-City API ---
  useEffect(() => {
    if (domNegara) {
      const c = Country.getAllCountries().find(c => c.name === domNegara);
      if (c) setSelectedCountryCode(c.isoCode);
      else setSelectedCountryCode('');
    } else {
      setSelectedCountryCode('');
    }
  }, [domNegara]);

  useEffect(() => {
    if (selectedCountryCode && domProvinsi) {
      const s = State.getStatesOfCountry(selectedCountryCode).find(s => s.name === domProvinsi);
      if (s) setSelectedStateCode(s.isoCode);
      else setSelectedStateCode('');
    } else {
      setSelectedStateCode('');
    }
  }, [selectedCountryCode, domProvinsi]);

  // --- Emsifa API fetch logic for Indonesia ---
  useEffect(() => {
    if (domNegara === 'Indonesia') {
      fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
        .then(res => res.json())
        .then(data => setIndoProvinces(data))
        .catch(err => console.error(err));
    } else {
      setIndoProvinces([]);
      setIndoCities([]);
      setIndoDistricts([]);
      setIndoVillages([]);
    }
  }, [domNegara]);

  useEffect(() => {
    if (domNegara === 'Indonesia' && domProvinsi) {
      const p = indoProvinces.find(p => p.name === domProvinsi);
      if (p) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${p.id}.json`)
          .then(res => res.json())
          .then(data => setIndoCities(data))
          .catch(err => console.error(err));
      } else {
        setIndoCities([]);
      }
    }
  }, [domProvinsi, indoProvinces]);

  useEffect(() => {
    if (domNegara === 'Indonesia' && domKota) {
      const c = indoCities.find(c => c.name === domKota);
      if (c) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${c.id}.json`)
          .then(res => res.json())
          .then(data => setIndoDistricts(data))
          .catch(err => console.error(err));
      } else {
        setIndoDistricts([]);
      }
    }
  }, [domKota, indoCities]);

  useEffect(() => {
    if (domNegara === 'Indonesia' && domKecamatan) {
      const d = indoDistricts.find(d => d.name === domKecamatan);
      if (d) {
        fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${d.id}.json`)
          .then(res => res.json())
          .then(data => setIndoVillages(data))
          .catch(err => console.error(err));
      } else {
        setIndoVillages([]);
      }
    }
  }, [domKecamatan, indoDistricts]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingUser.username || !editingUser.name || !editingUser.role) {
      alert("Harap lengkapi Nama Lengkap, Username, dan Role.");
      return;
    }

    if (editingUser.password && editingUser.password !== editingUser.passwordConfirm) {
      alert("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    // Merge Domisili to 1 JSON string
    const domisiliJson = JSON.stringify({
      negara: domNegara,
      provinsi: domProvinsi,
      kota: domKota,
      kecamatan: domKecamatan,
      desa: domDesa,
      detail: domDetail
    });

    if (!editingUser.id) {
      if (!editingUser.password || !editingUser.passwordConfirm) {
        alert("Password wajib diisi untuk pendaftar baru.");
        return;
      }
      if (!editingUser.jenis_kelamin || !editingUser.tanggal_lahir || !domNegara || !domProvinsi || !domKota || !editingUser.email || !editingUser.whatsapp) {
        alert("Harap lengkapi semua data profil wajib untuk pendaftar baru.");
        return;
      }
      if (domNegara === 'Indonesia' && (!domKecamatan || !domDesa)) {
         alert("Kecamatan dan Desa wajib diisi untuk domisili Indonesia.");
         return;
      }
    }
    
    try {
      const updateData: any = {
        name: editingUser.name,
        username: editingUser.username,
        role: editingUser.role,
        portal: editingUser.portal || 'gnext',
        jenis_kelamin: editingUser.jenis_kelamin,
        tanggal_lahir: editingUser.tanggal_lahir,
        domisili: domisiliJson,
        email: editingUser.email,
        whatsapp: editingUser.whatsapp,
        instagram_link: editingUser.instagram_link,
        instagram_followers: editingUser.instagram_followers,
      };

      if (editingUser.password) {
        updateData.password = editingUser.password;
      }

      if (editingUser.id) {
        await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);
        
        await logAudit(currentUser.name, 'UPDATE', 'User', `Updated user: ${editingUser.name} (${editingUser.portal || 'gnext'})`);
      } else {
        await supabase
          .from('users')
          .insert([updateData]);
          
        await logAudit(currentUser.name, 'CREATE', 'User', `Created user: ${editingUser.name} (${editingUser.portal || 'gnext'})`);
      }
      
      await loadUsers();
      setIsEditing(false);
      setEditingUser({});
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUser.id) {
      alert('Anda tidak bisa menghapus akun Anda sendiri.');
      return;
    }
    if (confirm(`Yakin ingin menghapus pengguna "${name}"?`)) {
      try {
        await supabase.from('users').delete().eq('id', id);
        await logAudit(currentUser.name, 'DELETE', 'User', `Deleted user: ${name || id}`);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  // Filtered list
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesPortal = portalFilter === 'ALL' || user.portal === portalFilter;

    return matchesSearch && matchesRole && matchesPortal;
  });

  // Role badge styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-neutral-900 text-white border-neutral-900';
      case 'Manajer Pers':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Penulis Pers':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  // Portal badge styling
  const getPortalBadge = (user: User) => {
    if (user.role === 'Administrator') {
      return 'bg-neutral-900 text-white border-neutral-900';
    }
    const p = user.portal || 'gnext';
    if (p === 'yoikijatim') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (p === 'lumajangtalks') return 'bg-amber-50 text-amber-800 border-amber-200';
    if (p === 'gummah') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (p === 'finance') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (p.startsWith('lentera')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  if (currentUser.role !== 'Administrator') {
    return <div className="p-8 text-center text-neutral-500">Anda tidak memiliki akses ke halaman ini. (Khusus Administrator)</div>;
  }

  // Edit / Create Form View
  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 md:p-8 max-w-3xl shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-neutral-900">
                {editingUser.id ? 'Edit Data Pengguna' : 'Tambah Anggota / SDM Baru'}
              </h2>
              <p className="text-xs text-neutral-500">Lengkapi data akun redaksi dan profil identitas</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Nama Lengkap *</label>
              <input
                type="text"
                value={editingUser.name || ''}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Nama lengkap..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Username *</label>
              <input
                type="text"
                value={editingUser.username || ''}
                onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="username unik..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Password {!editingUser.id && '*'}</label>
              <input
                type="password"
                value={editingUser.password || ''}
                onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                placeholder={editingUser.id ? "Kosongkan jika tidak diubah" : "Password baru"}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Konfirmasi Password {!editingUser.id && '*'}</label>
              <input
                type="password"
                value={editingUser.passwordConfirm || ''}
                onChange={e => setEditingUser({ ...editingUser, passwordConfirm: e.target.value })}
                placeholder={editingUser.id ? "Kosongkan jika tidak diubah" : "Ulangi password"}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Jenis Kelamin {!editingUser.id && '*'}</label>
              <select
                value={editingUser.jenis_kelamin || ''}
                onChange={e => setEditingUser({ ...editingUser, jenis_kelamin: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Tanggal Lahir {!editingUser.id && '*'}</label>
              <input
                type="date"
                value={editingUser.tanggal_lahir || ''}
                onChange={e => setEditingUser({ ...editingUser, tanggal_lahir: e.target.value })}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>
          
          <div className="border-t border-neutral-100 pt-4">
            <h3 className="font-bold text-xs mb-3 text-neutral-800">Kontak & Media Sosial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-neutral-700">Email {!editingUser.id && '*'}</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-neutral-700">No WhatsApp {!editingUser.id && '*'}</label>
                <input
                  type="text"
                  value={editingUser.whatsapp || ''}
                  onChange={e => setEditingUser({ ...editingUser, whatsapp: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-100 pt-4">
            <h3 className="font-bold text-xs mb-3 text-neutral-800">Domisili</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold mb-1.5 text-neutral-700">Negara {!editingUser.id && '*'}</label>
                <select
                  value={domNegara}
                  onChange={e => {
                    const countryName = e.target.value;
                    setDomNegara(countryName);
                    setDomProvinsi('');
                    setDomKota('');
                    setDomKecamatan('');
                    setDomDesa('');
                  }}
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="">Pilih Negara</option>
                  {Country.getAllCountries().map(country => (
                    <option key={country.isoCode} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </div>

              {/* JIKA BUKAN INDONESIA */}
              {domNegara && domNegara !== 'Indonesia' && (
                <>
                  {State.getStatesOfCountry(selectedCountryCode).length > 0 && (
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-neutral-700">Provinsi/State {!editingUser.id && '*'}</label>
                      <select
                        value={domProvinsi}
                        onChange={e => {
                          setDomProvinsi(e.target.value);
                          setDomKota('');
                        }}
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <option value="">Pilih Provinsi</option>
                        {State.getStatesOfCountry(selectedCountryCode).map(state => (
                          <option key={state.isoCode} value={state.name}>{state.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {domProvinsi && City.getCitiesOfState(selectedCountryCode, selectedStateCode).length > 0 && (
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-neutral-700">Kabupaten/Kota {!editingUser.id && '*'}</label>
                      <select
                        value={domKota}
                        onChange={e => setDomKota(e.target.value)}
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <option value="">Pilih Kota</option>
                        {City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(city => (
                          <option key={city.name} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* JIKA INDONESIA */}
              {domNegara === 'Indonesia' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-neutral-700">Provinsi {!editingUser.id && '*'}</label>
                    <select
                      value={domProvinsi}
                      onChange={e => {
                        setDomProvinsi(e.target.value);
                        setDomKota('');
                        setDomKecamatan('');
                        setDomDesa('');
                      }}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      <option value="">Pilih Provinsi</option>
                      {indoProvinces.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-neutral-700">Kabupaten/Kota {!editingUser.id && '*'}</label>
                    <select
                      value={domKota}
                      onChange={e => {
                        setDomKota(e.target.value);
                        setDomKecamatan('');
                        setDomDesa('');
                      }}
                      disabled={!domProvinsi}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                    >
                      <option value="">Pilih Kota</option>
                      {indoCities.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-neutral-700">Kecamatan {!editingUser.id && '*'}</label>
                    <select
                      value={domKecamatan}
                      onChange={e => {
                        setDomKecamatan(e.target.value);
                        setDomDesa('');
                      }}
                      disabled={!domKota}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                    >
                      <option value="">Pilih Kecamatan</option>
                      {indoDistricts.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-neutral-700">Desa/Kelurahan {!editingUser.id && '*'}</label>
                    <select
                      value={domDesa}
                      onChange={e => setDomDesa(e.target.value)}
                      disabled={!domKecamatan}
                      className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                    >
                      <option value="">Pilih Desa</option>
                      {indoVillages.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {domNegara && (
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-neutral-700">Detail Alamat Lengkap {!editingUser.id && '*'}</label>
                  <textarea
                    value={domDetail}
                    onChange={e => setDomDetail(e.target.value)}
                    placeholder="Contoh: Jl. Diponegoro No. 12, RT 01 / RW 02"
                    rows={2}
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Role Akses *</label>
              <select
                value={editingUser.role || ''}
                onChange={e => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="">Pilih Role</option>
                <option value="Administrator">Administrator (Akses Penuh)</option>
                <option value="Manajer Pers">Manajer Pers (Manajemen Konten & Kategori)</option>
                <option value="Penulis Pers">Penulis Pers (Kirim & Edit Draft)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-neutral-700">Portal Akses Berita *</label>
              <select
                value={editingUser.portal || 'gnext'}
                onChange={e => setEditingUser({ ...editingUser, portal: e.target.value as any })}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <optgroup label="Portal Utama & Regional">
                  <option value="gnext">GNEXT NEWS (Nasional)</option>
                  <option value="gummah">GNEXT UMMAH (Syariah & Islami)</option>
                  <option value="finance">GNEXT FINANCE (Ekonomi & Bisnis)</option>
                  <option value="yoikijatim">YO IKI JATIM (Jawa Timur)</option>
                  <option value="lumajangtalks">LUMAJANG TALKS (Lumajang)</option>
                </optgroup>
                <optgroup label="Jaringan Lentera (Nasional & Daerah)">
                  {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name.toUpperCase()} ({p.id})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6 text-xs font-semibold">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
          >
            Simpan Data Pengguna
          </button>
        </div>
      </div>
    );
  }

  // Calculate quick stats
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'Administrator').length;
  const totalManagers = users.filter(u => u.role === 'Manajer Pers').length;
  const totalWriters = users.filter(u => u.role === 'Penulis Pers').length;

  return (
    <div className="space-y-4">
      
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
            Manajemen SDM & Akses Redaksi
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Kelola data profil, peran otoritas, dan portal penugasan jurnalis/penulis Gnext Indonesia.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl transition-colors shadow-3xs"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button 
            onClick={() => { setEditingUser({}); setIsEditing(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-3xs text-xs font-bold active:scale-98"
          >
            <Plus size={15} />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-3xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Total SDM</span>
            <span className="text-base font-bold font-display text-neutral-900">{totalUsers}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-3xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center shrink-0">
            <Shield size={16} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Administrator</span>
            <span className="text-base font-bold font-display text-neutral-900">{totalAdmins}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-3xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <UserCheck size={16} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Manajer Pers</span>
            <span className="text-base font-bold font-display text-purple-700">{totalManagers}</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-3xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Penulis Pers</span>
            <span className="text-base font-bold font-display text-blue-700">{totalWriters}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-neutral-200 shadow-3xs flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama, username, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 focus:outline-none"
          >
            <option value="ALL">Semua Role</option>
            <option value="Administrator">Administrator</option>
            <option value="Manajer Pers">Manajer Pers</option>
            <option value="Penulis Pers">Penulis Pers</option>
          </select>

          {/* Portal Filter */}
          <select
            value={portalFilter}
            onChange={e => setPortalFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 focus:outline-none"
          >
            <option value="ALL">Semua Portal</option>
            <option value="gnext">GNEXT NEWS</option>
            <option value="yoikijatim">YO IKI JATIM</option>
            <option value="lumajangtalks">LUMAJANG TALKS</option>
            <option value="gummah">GNEXT UMMAH</option>
            <option value="finance">GNEXT FINANCE</option>
            {ALL_PORTALS.filter(p => p.id.startsWith('lentera')).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-3xs">
        <div className="overflow-x-auto min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <th className="py-2.5 px-4 w-10 text-center">#</th>
                <th className="py-2.5 px-4">Pengguna</th>
                <th className="py-2.5 px-4">Role Akses</th>
                <th className="py-2.5 px-4">Portal Penugasan</th>
                <th className="py-2.5 px-4">Kontak</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">Memuat data pengguna...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">Tidak ada data pengguna yang cocok.</td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const domisili = parseDomisili(user.domisili);
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-[11px] text-neutral-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-neutral-900 text-xs truncate leading-tight">{user.name}</p>
                            <p className="text-[10px] text-neutral-400 font-mono">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPortalBadge(user)}`}>
                          {user.role === 'Administrator' ? 'SEMUA PORTAL' : getPortalById(user.portal || 'gnext').name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="text-[11px] text-neutral-600 space-y-0.5">
                          {user.email && <div className="truncate max-w-[160px] text-neutral-500">{user.email}</div>}
                          {user.whatsapp && <div className="text-[10px] font-mono text-neutral-400">{user.whatsapp}</div>}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => { setEditingUser(user); setIsEditing(true); }}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Edit Pengguna"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-2">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-3 rounded-xl border border-neutral-200 shadow-3xs space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-neutral-900 text-xs truncate">{user.name}</h3>
                  <p className="text-[10px] text-neutral-500">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setViewingUser(user)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => { setEditingUser(user); setIsEditing(true); }}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-neutral-100">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPortalBadge(user)}`}>
                {user.role === 'Administrator' ? 'SEMUA' : getPortalById(user.portal || 'gnext').name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* User Details Modal View */}
      {viewingUser && (
        <div className="fixed inset-0 z-[9999] bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  {viewingUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">{viewingUser.name}</h3>
                  <p className="text-[10px] text-neutral-500">@{viewingUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Role</span>
                  <span className="font-bold text-neutral-900">{viewingUser.role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Portal Akses</span>
                  <span className="font-bold text-neutral-900">
                    {viewingUser.role === 'Administrator' ? 'Seluruh Jaringan (Semua Portal)' : getPortalById(viewingUser.portal || 'gnext').name}
                  </span>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-800 text-xs">Informasi Profil</h4>
                <div className="space-y-1.5 text-[11px] text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-neutral-400" />
                    <span>Email: <strong>{viewingUser.email || '-'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-neutral-400" />
                    <span>WhatsApp: <strong>{viewingUser.whatsapp || '-'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-neutral-400" />
                    <span>Tgl Lahir / Gender: <strong>{viewingUser.tanggal_lahir || '-'} ({viewingUser.jenis_kelamin || '-'})</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span>Domisili:</span>
                      {(() => {
                        const d = parseDomisili(viewingUser.domisili);
                        const parts = [d.desa, d.kecamatan, d.kota, d.provinsi, d.negara].filter(Boolean);
                        return (
                          <p className="font-semibold text-neutral-800 mt-0.5">
                            {parts.join(', ') || '-'} {d.detail ? `(${d.detail})` : ''}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  const target = viewingUser;
                  setViewingUser(null);
                  setEditingUser(target);
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-bold hover:bg-neutral-800"
              >
                Edit Akun Ini
              </button>
              <button
                onClick={() => setViewingUser(null)}
                className="px-3 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

