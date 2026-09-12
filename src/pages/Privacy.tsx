import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, FileText, Lock, Eye, UserCheck, Mail, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';

export default function PrivacyPage() {
  const location = useLocation();

  const getActivePortal = (): 'gnext' | 'yoikijatim' | 'lumajangtalks' | 'studio' | 'gummah' => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const portalParam = searchParams.get('portal')?.toLowerCase();
      if (portalParam === 'yoikijatim') return 'yoikijatim';
      if (portalParam === 'lumajangtalks') return 'lumajangtalks';
      if (portalParam === 'gummah' || portalParam === 'ummah') return 'gummah';
      if (portalParam === 'gnext' || portalParam === 'news') return 'gnext';

      const hostname = window.location.hostname.toLowerCase();
      if (hostname.startsWith('news.')) return 'gnext';
      if (hostname.startsWith('yoikijatim.')) return 'yoikijatim';
      if (hostname.startsWith('lumajangtalks.')) return 'lumajangtalks';
      if (hostname.startsWith('gummah.') || hostname.startsWith('g-ummah.') || hostname.startsWith('ummah.')) return 'gummah';
    }
    const pathname = location.pathname.toLowerCase();
    if (pathname.includes('/yoikijatim')) return 'yoikijatim';
    if (pathname.includes('/lumajangtalks')) return 'lumajangtalks';
    if (pathname.includes('/gummah') || pathname.includes('/g-ummah') || pathname.includes('/ummah')) return 'gummah';
    if (pathname.includes('/news')) return 'gnext';
    return 'studio';
  };

  const portal = getActivePortal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, portal]);

  // Config per portal
  const portalConfig = {
    gnext: {
      name: 'GNEXT NEWS',
      badge: 'Portal Berita GNEXT NEWS',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      accentBg: 'bg-red-600',
      accentText: 'text-red-600',
      hoverText: 'hover:text-red-600',
      heroTitle: 'Kebijakan Privasi GNEXT NEWS',
      heroDesc: 'Komitmen transparansi dan perlindungan privasi data pembaca portal berita GNEXT NEWS.',
      seoTitle: 'Kebijakan Privasi - GNEXT NEWS',
      seoDesc: 'Kebijakan privasi dan perlindungan data pembaca portal berita GNEXT NEWS.',
      policies: [
        {
          id: 'pengumpulan-data',
          icon: Shield,
          title: '1. Pengumpulan Data Pembaca',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                GNEXT NEWS mengumpulkan informasi dari pembaca untuk memberikan pengalaman membaca berita terbaik, aman, dan relevan. Data yang kami kumpulkan meliputi:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li><strong>Data Teknis & Perangkat:</strong> Alamat IP, jenis peramban (browser), sistem operasi, dan log aktivitas kunjungan halaman berita.</li>
                <li><strong>Interaksi Konten:</strong> Kategori berita yang sering dibaca, durasi membaca, serta pencarian kata kunci di situs.</li>
                <li><strong>Informasi Sukarela:</strong> Alamat email dan nama yang Anda berikan saat berlangganan newsletter berita, mendaftar akun, atau mengirim tanggapan ke redaksi.</li>
              </ul>
            </>
          )
        },
        {
          id: 'penggunaan-informasi',
          icon: Eye,
          title: '2. Penggunaan Informasi Jurnalistik & Layanan',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Data yang dikumpulkan oleh GNEXT NEWS digunakan secara bertanggung jawab untuk:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Menyajikan berita dan artikel terkini yang sesuai dengan minat baca Anda.</li>
                <li>Mengirimkan buletin berita (newsletter) mingguan atau pemberitahuan berita utama (breaking news) jika diizinkan.</li>
                <li>Menganalisis performa artikel dan lalu lintas situs guna meningkatkan kualitas karya jurnalistik digital kami.</li>
                <li>Mencegah aktivitas jahat, penyalahgunaan situs, atau pelanggaran hak cipta.</li>
              </ul>
            </>
          )
        },
        {
          id: 'perlindungan-data',
          icon: Lock,
          title: '3. Perlindungan & Kerahasiaan Data',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Kami menerapkan standar keamanan teknis dan organisasi yang ketat untuk melindungi data pembaca dari akses tanpa izin, perubahan, pengungkapan, atau penghancuran.
              </p>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                GNEXT NEWS <strong>tidak akan pernah menjual, menyewakan, atau memperdagangkan</strong> data pribadi pembaca kepada pihak ketiga untuk kepentingan pemasaran tanpa persetujuan eksplisit dari Anda.
              </p>
            </>
          )
        },
        {
          id: 'cookies-pelacak',
          icon: FileText,
          title: '4. Cookies & Teknologi Pelacak',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Kami menggunakan cookies dan teknologi serupa untuk mengingat preferensi Anda (seperti mode tampilan, ukuran font, dan riwayat baca) serta mengukur efektivitas situs. Anda dapat mengatur atau mematikan penggunaan cookies melalui pengaturan peramban web Anda.
              </p>
            </>
          )
        },
        {
          id: 'hak-pembaca',
          icon: UserCheck,
          title: '5. Hak-Hak Pembaca',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Sebagai pembaca GNEXT NEWS, Anda memiliki hak penuh untuk:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Meminta informasi mengenai data pribadi Anda yang tersimpan di sistem kami.</li>
                <li>Meminta koreksi atau pembaharuan data yang tidak akurat.</li>
                <li>Meminta penghapusan data pribadi Anda dari daftar langganan berita kami (unsubscribe).</li>
              </ul>
            </>
          )
        },
        {
          id: 'kontak-privasi',
          icon: Mail,
          title: '6. Kontak Redaksi & Tim Privasi',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Jika Anda memiliki pertanyaan, pengaduan, atau permintaan terkait Kebijakan Privasi di GNEXT NEWS, silakan hubungi tim redaksi kami melalui:
              </p>
              <div className="bg-neutral-100 p-4 rounded-xl text-neutral-800 font-mono text-sm space-y-1">
                <p>Email: redaksi.news@gnextindonesia.site</p>
                <p>Subjek: Pengaduan Privasi - GNEXT NEWS</p>
              </div>
            </>
          )
        }
      ]
    },
    yoikijatim: {
      name: 'YO IKI JATIM',
      badge: 'Portal Berita YO IKI JATIM',
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
      accentBg: 'bg-orange-600',
      accentText: 'text-orange-600',
      hoverText: 'hover:text-orange-600',
      heroTitle: 'Kebijakan Privasi YO IKI JATIM',
      heroDesc: 'Perlindungan data pribadi dan privasi pengunjung portal berita & informasi terdepan Jawa Timur.',
      seoTitle: 'Kebijakan Privasi - YO IKI JATIM',
      seoDesc: 'Kebijakan privasi dan perlindungan data pembaca portal berita YO IKI JATIM.',
      policies: [
        {
          id: 'pengumpulan-data-jatim',
          icon: Shield,
          title: '1. Pengumpulan Data Pengunjung & Komunitas Jatim',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                YO IKI JATIM mengumpulkan informasi teknis dan interaksi pengguna untuk menghadirkan kabar terkini dari seluruh pelosok Kabupaten/Kota di Jawa Timur:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li><strong>Informasi Log Situs:</strong> IP address, jenis perangkat, dan lokasi umum wilayah untuk penyesuaian berita daerah (Surabaya, Malang, Kediri, Banyuwangi, dll).</li>
                <li><strong>Lapor Warga & Liputan Komunitas:</strong> Nama, kontak, dan isi pesan saat Anda mengirimkan informasi kejadian atau usulan kabar daerah ke redaksi Yo Iki Jatim.</li>
                <li><strong>Statistik Pembacaan:</strong> Artikel berita populer, kategori pilihan (wisata, kuliner, budaya, kabar daerah).</li>
              </ul>
            </>
          )
        },
        {
          id: 'penggunaan-informasi-jatim',
          icon: Eye,
          title: '2. Penggunaan Informasi Daerah',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Informasi yang dikumpulkan dimanfaatkan untuk:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Menampilkan berita regional Jawa Timur yang relevan dengan domisili pembaca.</li>
                <li>Memproses laporan dan kontribusi warga untuk bahan verifikasi liputan lapangan.</li>
                <li>Meningkatkan kenyamanan navigasi portal Yo Iki Jatim baik di perangkat ponsel maupun komputer.</li>
              </ul>
            </>
          )
        },
        {
          id: 'kerahasiaan-narasumber',
          icon: Lock,
          title: '3. Kerahasiaan Narasumber & Warga',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Kami menjunjung tinggi prinsip perlindungan narasumber sesuai Kode Etik Jurnalistik. Identitas warga yang melaporkan informasi sensitif akan dijaga kerahasiaannya dan tidak dipublikasikan tanpa izin eksplisit.
              </p>
            </>
          )
        },
        {
          id: 'cookies-jatim',
          icon: FileText,
          title: '4. Penggunaan Cookies',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Cookies digunakan di YO IKI JATIM untuk menyimpan sesi bacaan dan preferensi wilayah. Anda dapat mengontrol atau menghapus cookies melalui setelan browser Anda kapan saja.
              </p>
            </>
          )
        },
        {
          id: 'kontak-yoikijatim',
          icon: Mail,
          title: '5. Kontak Redaksi YO IKI JATIM',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Pertanyaan terkait kebijakan privasi dan pengelolaan data pembaca YO IKI JATIM dapat disampaikan ke:
              </p>
              <div className="bg-neutral-100 p-4 rounded-xl text-neutral-800 font-mono text-sm space-y-1">
                <p>Email: yoikijatim@gnextindonesia.site</p>
                <p>Subjek: Privasi Pembaca - YO IKI JATIM</p>
              </div>
            </>
          )
        }
      ]
    },
    lumajangtalks: {
      name: 'LUMAJANG TALKS',
      badge: 'Portal Berita LUMAJANG TALKS',
      badgeColor: 'bg-lumajang-50 text-neutral-900 border-lumajang-200',
      accentBg: 'bg-lumajang-400 text-neutral-950',
      accentText: 'text-lumajang-700',
      hoverText: 'hover:text-lumajang-600',
      heroTitle: 'Kebijakan Privasi LUMAJANG TALKS',
      heroDesc: 'Perlindungan privasi dan keamanan data masyarakat pembaca portal Suara & Berita Kota Pisang Lumajang.',
      seoTitle: 'Kebijakan Privasi - LUMAJANG TALKS',
      seoDesc: 'Kebijakan privasi dan perlindungan data pembaca portal berita LUMAJANG TALKS.',
      policies: [
        {
          id: 'pengumpulan-lumajang',
          icon: Shield,
          title: '1. Pengumpulan Informasi Pembaca Lumajang',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                LUMAJANG TALKS mengumpulkan informasi dasar saat Anda membaca berita, mengirimkan aspirasi warga, atau berinteraksi dengan portal berita kami:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li><strong>Data Akses:</strong> Informasi IP, tipe browser, dan halaman kabar Lumajang yang dikunjungi (Senduro, Pasrujambe, Semeru, dll).</li>
                <li><strong>Aspirasi & Usulan Warga:</strong> Identitas dan rincian pesan yang Anda kirimkan ke rubrik Suara Lumajang.</li>
              </ul>
            </>
          )
        },
        {
          id: 'penggunaan-lumajang',
          icon: Eye,
          title: '2. Pengolahan Data untuk Layanan Informasi Publik',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Data digunakan untuk memastikan penyampaian berita seputar Kabupaten Lumajang berlangsung cepat, tepat, dan dapat diandalkan oleh masyarakat.
              </p>
            </>
          )
        },
        {
          id: 'keamanan-lumajang',
          icon: Lock,
          title: '3. Keamanan & Perlindungan Privasi Komunitas',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                LUMAJANG TALKS berkomitmen menjaga keamanan data masyarakat dan tidak membagikan informasi pribadi pembaca kepada pihak ketiga tanpa izin.
              </p>
            </>
          )
        },
        {
          id: 'kontak-lumajang',
          icon: Mail,
          title: '4. Layanan Pengaduan Privasi',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Untuk pertanyaan seputar privasi data di LUMAJANG TALKS, silakan hubungi redaksi:
              </p>
              <div className="bg-neutral-100 p-4 rounded-xl text-neutral-800 font-mono text-sm space-y-1">
                <p>Email: lumajangtalks@gnextindonesia.site</p>
                <p>Subjek: Privasi - LUMAJANG TALKS</p>
              </div>
            </>
          )
        }
      ]
    },
    gummah: {
      name: 'Gnext Ummah',
      badge: 'Portal Berita Islami Gnext Ummah',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accentBg: 'bg-emerald-600 text-white',
      accentText: 'text-emerald-600',
      hoverText: 'hover:text-emerald-600',
      heroTitle: 'Kebijakan Privasi Gnext Ummah',
      heroDesc: 'Perlindungan privasi dan keamanan data pembaca portal berita Islami, kajian keagamaan, dan gaya hidup syariah.',
      seoTitle: 'Kebijakan Privasi - Gnext Ummah',
      seoDesc: 'Kebijakan privasi dan perlindungan data pembaca portal berita Islami Gnext Ummah.',
      policies: [
        {
          id: 'pengumpulan-gummah',
          icon: Shield,
          title: '1. Pengumpulan Informasi Pembaca Gnext Ummah',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Gnext Ummah mengumpulkan informasi dasar saat Anda membaca berita, mendaftar konsultasi syariah, atau berinteraksi dengan portal berita kami:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li><strong>Data Akses:</strong> Informasi IP, tipe perangkat, dan halaman berita Gnext Ummah yang Anda kunjungi.</li>
                <li><strong>Data Konsultasi/Interaksi:</strong> Identitas nama, email, dan detail pertanyaan yang Anda ajukan pada rubrik konsultasi atau oase inspirasi.</li>
              </ul>
            </>
          )
        },
        {
          id: 'penggunaan-gummah',
          icon: Eye,
          title: '2. Penggunaan Informasi Secara Amanah',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Setiap data yang dikumpulkan diproses secara amanah untuk meningkatkan kualitas informasi dakwah, artikel inspiratif, dan rubrik edukasi yang bermanfaat bagi umat.
              </p>
            </>
          )
        },
        {
          id: 'keamanan-gummah',
          icon: Lock,
          title: '3. Perlindungan Kerahasiaan Data Jamaah',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Kami berkomitmen penuh melindungi kerahasiaan data pribadi Anda. Kami tidak akan membagikan, menjual, atau memberikan data jamaah kepada pihak ketiga tanpa persetujuan eksplisit.
              </p>
            </>
          )
        },
        {
          id: 'kontak-gummah',
          icon: Mail,
          title: '4. Hubungi Redaksi Gnext Ummah',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Jika memiliki pertanyaan seputar perlindungan data atau ingin memperbarui informasi Anda di Gnext Ummah, silakan hubungi kami:
              </p>
              <div className="bg-neutral-100 p-4 rounded-xl text-neutral-800 font-mono text-sm space-y-1">
                <p>Email: redaksi@gnextummah.id</p>
                <p>Subjek: Tanya Privasi - Gnext Ummah</p>
              </div>
            </>
          )
        }
      ]
    },
    studio: {
      name: 'Gnext Creative Studio',
      badge: 'Gnext Creative Studio',
      badgeColor: 'bg-neutral-200 text-neutral-800 border-neutral-300',
      accentBg: 'bg-neutral-900',
      accentText: 'text-neutral-900',
      hoverText: 'hover:text-neutral-900',
      heroTitle: 'Kebijakan Privasi',
      heroDesc: 'Ketentuan terkait privasi dan perlindungan data pengguna ekosistem Gnext Creative Studio.',
      seoTitle: 'Kebijakan Privasi - Gnext Creative Studio',
      seoDesc: 'Kebijakan privasi dan perlindungan data pengguna Gnext Creative Studio.',
      policies: [
        {
          id: 'kebijakan-privasi-studio',
          icon: Shield,
          title: 'Kebijakan Privasi Studio',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Gnext Creative Studio menghargai dan melindungi privasi setiap pengguna, mitra, dan pengunjung platform kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi.
              </p>
              
              <h4 className="text-xl font-bold mb-2 mt-6">Informasi yang Kami Kumpulkan</h4>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-1">
                <li>Data identitas (nama, email, nomor kontak)</li>
                <li>Informasi akun dan interaksi digital</li>
                <li>Data yang dikirimkan melalui formulir, pendaftaran event, kolaborasi, atau layanan</li>
                <li>Data teknis seperti alamat IP, jenis perangkat, dan aktivitas situs</li>
              </ul>

              <h4 className="text-xl font-bold mb-2 mt-6">Penggunaan Informasi</h4>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-1">
                <li>Keperluan komunikasi dan layanan</li>
                <li>Pengelolaan konten, event, dan kampanye</li>
                <li>Pengembangan platform dan pengalaman pengguna</li>
                <li>Kepentingan administratif dan legal</li>
              </ul>

              <h4 className="text-xl font-bold mb-2 mt-6">Perlindungan Data</h4>
              <p className="mb-4 text-neutral-600">
                Kami berkomitmen menjaga keamanan data pengguna dan tidak menjual atau menyebarkan data pribadi kepada pihak ketiga tanpa persetujuan, kecuali diwajibkan oleh hukum.
              </p>
            </>
          )
        }
      ]
    }
  };

  const currentConfig = portalConfig[portal];

  const getPortalHome = () => {
    if (typeof window !== 'undefined' && (
      window.location.hostname.startsWith('news.') ||
      window.location.hostname.startsWith('yoikijatim.') ||
      window.location.hostname.startsWith('lumajangtalks.') ||
      window.location.hostname.startsWith('gummah.') ||
      window.location.hostname.startsWith('g-ummah.') ||
      window.location.hostname.startsWith('ummah.')
    )) {
      return '/';
    }
    if (portal === 'yoikijatim') return '/yoikijatim';
    if (portal === 'lumajangtalks') return '/lumajangtalks';
    if (portal === 'gummah') {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/ummah')) {
        return '/ummah';
      }
      return '/gummah';
    }
    if (portal === 'gnext') return '/news';
    return '/';
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <SEO 
        title={currentConfig.seoTitle} 
        description={currentConfig.seoDesc}
        path="/privacy"
      />
      <Navbar portal={portal === 'studio' ? undefined : portal} />
      
      <main className="pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Breadcrumb & Header */}
        <section className="w-full max-w-4xl mx-auto px-6 md:px-12 mb-12">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
            <Link to={getPortalHome()} className="hover:underline">Home</Link>
            <ChevronRight size={14} />
            <span className="text-neutral-900 font-medium">Kebijakan Privasi</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${currentConfig.badgeColor}`}>
              {currentConfig.badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4">
              {currentConfig.heroTitle}
            </h1>
            <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-2xl">
              {currentConfig.heroDesc}
            </p>
          </motion.div>
        </section>

        {/* Content list */}
        <section className="w-full max-w-4xl mx-auto px-6 md:px-12">
          <div className="flex flex-col gap-8">
            {currentConfig.policies.map((policy, idx) => {
              const Icon = policy.icon;
              return (
                <motion.div
                  key={policy.id}
                  id={policy.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="bg-white p-6 md:p-10 rounded-2xl border border-neutral-200/80 shadow-sm"
                >
                  <div className="flex items-center gap-3.5 mb-6 border-b border-neutral-100 pb-5">
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-800 shrink-0">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-display font-bold text-neutral-900">
                      {policy.title}
                    </h2>
                  </div>
                  
                  <div className="prose prose-neutral max-w-none text-neutral-700">
                    {policy.content}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer portal={portal === 'studio' ? undefined : portal} />
    </div>
  );
}
