import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ALL_PORTALS, getPortalById } from '../lib/portals';
import { Country, State, City } from 'country-state-city';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portalQuery = searchParams.get('portal') || 'gnext';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    passwordConfirm: '',
    jenis_kelamin: 'Laki-laki',
    tanggal_lahir: '',
    email: '',
    whatsapp: '',
    instagram_link: '',
    instagram_followers: 0,
  });

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

  // Emsifa API fetch logic for Indonesia
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

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    if (domNegara === 'Indonesia' && (!domKecamatan || !domDesa)) {
      setError("Kecamatan dan Desa wajib diisi untuk domisili Indonesia.");
      return;
    }

    const domisiliJson = JSON.stringify({
      negara: domNegara,
      provinsi: domProvinsi,
      kota: domKota,
      kecamatan: domKecamatan,
      desa: domDesa,
      detail: domDetail
    });

    setLoading(true);

    try {
      // Check if username exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username);

      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        setError("Username sudah digunakan. Silakan pilih username lain.");
        setLoading(false);
        return;
      }

      const insertData = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: 'Penulis Pers', // Force role
        portal: portalQuery,
        jenis_kelamin: formData.jenis_kelamin,
        tanggal_lahir: formData.tanggal_lahir,
        domisili: domisiliJson,
        email: formData.email,
        whatsapp: formData.whatsapp,
        instagram_link: formData.instagram_link,
        instagram_followers: formData.instagram_followers,
      };

      
      let payload = { ...insertData };
      let successInsert = false;
      let attempts = 0;
      
      while (!successInsert && attempts < 10) {
        attempts++;
        const { error: insertError } = await supabase.from('users').insert([payload]);
        if (!insertError) {
          successInsert = true;
          break;
        }
        
        const errStr = `${insertError.code || ''} ${insertError.message || ''} ${insertError.details || ''}`.toLowerCase();
        if (insertError.code === 'PGRST204' || insertError.code === '42703' || errStr.includes('column') || errStr.includes('schema cache')) {
          const match = insertError.message?.match(/Could not find the '([^']+)' column/i)
            || insertError.message?.match(/column ["']?([^"'\s]+)["']? of relation/i)
            || insertError.message?.match(/column ["']?([^"'\s]+)["']? does not exist/i);

          if (match && match[1]) {
            const missingCol = match[1];
            if (missingCol in payload) {
              console.warn(`Kolom '${missingCol}' tidak ditemukan di tabel users, mencoba tanpa kolom tersebut...`);
              delete payload[missingCol as keyof typeof payload];
              continue;
            }
          }
        }
        throw insertError;
      }


      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError("Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const portalData = getPortalById(portalQuery);

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl shadow-lg border border-neutral-200 max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">Pendaftaran Berhasil!</h2>
          <p className="text-neutral-600 mb-8">
            Terima kasih telah bergabung sebagai Penulis Pers di <strong>{portalData.name}</strong>. Anda sekarang dapat masuk ke Studio untuk mulai berkarya.
          </p>
          <Link 
            to="/loginstudio"
            className="inline-flex items-center justify-center w-full px-6 py-4 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Masuk ke Studio
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to={`/${portalQuery === 'gnext' ? 'news' : portalQuery}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} />
            Kembali ke Portal
          </Link>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-neutral-900 tracking-tight">Daftar Penulis Pers</h1>
          <p className="text-neutral-500 mt-2">Bergabunglah bersama <strong>{portalData.name}</strong> dan suarakan tulisanmu ke seluruh jaringan.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 sm:p-10">
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-start gap-3">
                <Info size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Data Akun */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm">1</span>
                  Informasi Akun
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Pilih username unik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Buat password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Konfirmasi Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.passwordConfirm}
                      onChange={e => setFormData({...formData, passwordConfirm: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Ketik ulang password"
                    />
                  </div>
                </div>
              </section>

              {/* Data Pribadi & Kontak */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm">2</span>
                  Data Pribadi & Kontak
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="nama@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Nomor WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="0812xxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Jenis Kelamin *</label>
                    <select
                      required
                      value={formData.jenis_kelamin}
                      onChange={e => setFormData({...formData, jenis_kelamin: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Tanggal Lahir *</label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_lahir}
                      onChange={e => setFormData({...formData, tanggal_lahir: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </section>

              {/* Domisili */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm">3</span>
                  Domisili (Tempat Tinggal)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Negara *</label>
                    <select
                      required
                      value={domNegara}
                      onChange={e => { setDomNegara(e.target.value); setDomProvinsi(''); setDomKota(''); setDomKecamatan(''); setDomDesa(''); }}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      <option value="">Pilih Negara</option>
                      {Country.getAllCountries().map(c => (
                        <option key={c.isoCode} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Provinsi *</label>
                    <select
                      required
                      value={domProvinsi}
                      onChange={e => { setDomProvinsi(e.target.value); setDomKota(''); setDomKecamatan(''); setDomDesa(''); }}
                      disabled={!domNegara}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                    >
                      <option value="">Pilih Provinsi</option>
                      {domNegara === 'Indonesia' ? (
                        indoProvinces.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))
                      ) : (
                        State.getStatesOfCountry(selectedCountryCode).map(s => (
                          <option key={s.isoCode} value={s.name}>{s.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Kabupaten/Kota *</label>
                    <select
                      required
                      value={domKota}
                      onChange={e => { setDomKota(e.target.value); setDomKecamatan(''); setDomDesa(''); }}
                      disabled={!domProvinsi}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                    >
                      <option value="">Pilih Kab/Kota</option>
                      {domNegara === 'Indonesia' ? (
                        indoCities.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))
                      ) : (
                        City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {domNegara === 'Indonesia' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-neutral-700">Kecamatan *</label>
                        <select
                          required
                          value={domKecamatan}
                          onChange={e => { setDomKecamatan(e.target.value); setDomDesa(''); }}
                          disabled={!domKota}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                        >
                          <option value="">Pilih Kecamatan</option>
                          {indoDistricts.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-neutral-700">Desa/Kelurahan *</label>
                        <select
                          required
                          value={domDesa}
                          onChange={e => setDomDesa(e.target.value)}
                          disabled={!domKecamatan}
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                        >
                          <option value="">Pilih Desa</option>
                          {indoVillages.map(v => (
                            <option key={v.id} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-neutral-700">Detail Alamat Lengkap *</label>
                    <textarea
                      required
                      value={domDetail}
                      onChange={e => setDomDetail(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="Nama Jalan, Gedung, RT/RW, Nomor Rumah"
                    />
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-neutral-900 text-white rounded-xl text-base font-bold hover:bg-neutral-800 disabled:opacity-70 transition-colors shadow-sm"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                  <span>{loading ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}</span>
                </button>
                <div className="mt-6 text-center">
                  <p className="text-neutral-600 text-sm">
                    Sudah punya akun?{' '}
                    <Link to="/loginstudio" className="font-bold text-neutral-900 hover:underline">
                      Masuk ke Community
                    </Link>
                  </p>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
