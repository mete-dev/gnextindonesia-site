import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, FileText, AlertCircle, ShieldCheck, ChevronRight, MessageSquare, Copyright } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';

export default function TermsPage() {
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
      badge: 'Syarat & Ketentuan GNEXT NEWS',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      heroTitle: 'Syarat, Ketentuan & Pedoman Siber GNEXT NEWS',
      heroDesc: 'Aturan penggunaan layanan berita, pedoman pemberitaan media siber, hak cipta karya jurnalistik, dan disclaimer portal GNEXT NEWS.',
      seoTitle: 'Syarat & Ketentuan & Pedoman Siber - GNEXT NEWS',
      seoDesc: 'Syarat, ketentuan layanan, dan pedoman pemberitaan media siber GNEXT NEWS.',
      terms: [
        {
          id: 'syarat-layanan-news',
          icon: Scale,
          title: '1. Ketentuan Penggunaan Portal GNEXT NEWS',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Dengan mengakses, membaca, atau memanfaatkan konten di portal berita <strong>GNEXT NEWS</strong> (gnextindonesia.site), Anda dianggap telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan berikut:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Layanan berita GNEXT NEWS disediakan untuk tujuan informasi, edukasi, dan inspirasi publik.</li>
                <li>Pengunjung wajib menggunakan portal ini secara bijak, etis, dan tidak melanggar hukum serta undang-undang yang berlaku di Republik Indonesia.</li>
                <li>Dilarang keras meretas, menginterupsi, atau merusak sistem dan infrastruktur digital GNEXT NEWS.</li>
              </ul>
            </>
          )
        },
        {
          id: 'pedoman-siber-news',
          icon: ShieldCheck,
          title: '2. Pedoman Pemberitaan Media Siber (Siber News Guidelines)',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                GNEXT NEWS berkomitmen menjunjung tinggi standar jurnalistik independen, akurat, dan berimbang sesuai Pedoman Pemberitaan Media Siber Dewan Pers:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li><strong>Akurasi & Verifikasi:</strong> Setiap berita yang dipublikasikan diuji melalui proses verifikasi fakta sebelum ditayangkan.</li>
                <li><strong>Hak Jawab & Koreksi:</strong> Pihak yang dirugikan oleh pemberitaan berhak mengajukan Hak Jawab atau Hak Koreksi. Redaksi GNEXT NEWS akan memuat ralat atau klarifikasi secara proporsional.</li>
                <li><strong>Perlindungan Hak Cipta & Anak:</strong> Kami tidak memuat identitas korban kejahatan asusila atau anak di bawah umur yang berhadapan dengan hukum.</li>
              </ul>
            </>
          )
        },
        {
          id: 'hak-cipta-news',
          icon: Copyright,
          title: '3. Hak Cipta & Pengutipan Karya Jurnalistik',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Seluruh materi di GNEXT NEWS—termasuk teks artikel, foto, video, grafik, dan logo—dilindungi oleh Undang-Undang Hak Cipta.
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Pengutipan artikel untuk kepentingan akademis, diskusi, atau referensi non-komersial diperbolehkan maksimal <strong>25% dari total isi tulisan</strong>.</li>
                <li>Wajib mencantumkan sumber jelas: <strong>"GNEXT NEWS"</strong> disertai <strong>tautan langsung (hyperlink)</strong> ke halaman artikel asli.</li>
                <li>Penggunaan ulang materi untuk kepentingan komersial tanpa izin tertulis dari Redaksi GNEXT NEWS adalah pelanggaran hukum.</li>
              </ul>
            </>
          )
        },
        {
          id: 'komentar-news',
          icon: MessageSquare,
          title: '4. Etika Komentar & Interaksi Pembaca',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                GNEXT NEWS mendorong diskusi publik yang kritis dan konstruktif. Pembaca dilarang mengirimkan komentar yang mengandung:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Ujaran kebencian, diskriminasi SARA, pornografi, atau ancaman kekerasan.</li>
                <li>Berita bohong (hoaks), fitnah, atau pencemaran nama baik.</li>
                <li>Spam, promosi judi, atau tautan berbahaya. Redaksi berhak menghapus komentar yang melanggar.</li>
              </ul>
            </>
          )
        },
        {
          id: 'disclaimer-news',
          icon: AlertCircle,
          title: '5. Disclaimer & Penyangkalan',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Informasi dan artikel di GNEXT NEWS disajikan untuk tujuan penerangan umum.
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Opini, kolom, atau tulisan opini narasumber merupakan tanggung jawab pribadi penulis dan tidak selalu mencerminkan sikap resmi Redaksi.</li>
                <li>GNEXT NEWS tidak bertanggung jawab atas dampak dari penggunaan informasi tanpa verifikasi tambahan oleh pengguna.</li>
              </ul>
            </>
          )
        }
      ]
    },
    yoikijatim: {
      name: 'YO IKI JATIM',
      badge: 'Syarat & Ketentuan YO IKI JATIM',
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
      heroTitle: 'Syarat, Ketentuan & Pedoman Siber YO IKI JATIM',
      heroDesc: 'Aturan layanan berita Jawa Timur, etika partisipasi warga, pedoman media siber, dan ketentuan hak cipta.',
      seoTitle: 'Syarat & Ketentuan & Pedoman Siber - YO IKI JATIM',
      seoDesc: 'Syarat, ketentuan layanan, dan pedoman pemberitaan media siber YO IKI JATIM.',
      terms: [
        {
          id: 'syarat-layanan-jatim',
          icon: Scale,
          title: '1. Penggunaan Portal Berita YO IKI JATIM',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Selamat datang di portal berita <strong>YO IKI JATIM</strong> (yoikijatim.gnextindonesia.site). Dengan mengakses situs ini, Anda menyetujui ketentuan layanan berikut:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Konten disajikan untuk mengabarkan berita, budaya, wisata, kuliner, dan informasi seputar Jawa Timur.</li>
                <li>Pengunjung wajib menaati etika digital dan hukum Indonesia saat menggunakan platform ini.</li>
              </ul>
            </>
          )
        },
        {
          id: 'pedoman-siber-jatim',
          icon: ShieldCheck,
          title: '2. Pedoman Pemberitaan Media Siber Jatim',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Pemberitaan di YO IKI JATIM mengacu pada Kode Etik Jurnalistik dan Pedoman Media Siber:
              </p>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-2">
                <li>Berita daerah disampaikan secara objektif, independen, dan teruji.</li>
                <li>Masyarakat Jawa Timur berhak mengajukan klarifikasi atau Hak Jawab atas berita yang memuat kekeliruan data.</li>
              </ul>
            </>
          )
        },
        {
          id: 'konten-warga-jatim',
          icon: FileText,
          title: '3. Konten Lapor Warga & Komunitas Jatim',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Warga Jawa Timur yang mengunggah atau mengirimi redaksi informasi liputan wajib menjamin bahwa data/foto tersebut akurat dan asli milik pengirim. Redaksi berhak menyunting tulisan sesuai kaidah jurnalistik.
              </p>
            </>
          )
        },
        {
          id: 'hak-cipta-jatim',
          icon: Copyright,
          title: '4. Hak Cipta & Pengutipan',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Setiap kutipan artikel YO IKI JATIM wajib mencantumkan kredit <strong>"YO IKI JATIM"</strong> beserta link aktif ke artikel asal.
              </p>
            </>
          )
        },
        {
          id: 'disclaimer-jatim',
          icon: AlertCircle,
          title: '5. Disclaimer Regional',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Informasi seputar wisata, event, dan harga di Jawa Timur dapat berubah sewaktu-waktu sesuai kondisi di lapangan.
              </p>
            </>
          )
        }
      ]
    },
    lumajangtalks: {
      name: 'LUMAJANG TALKS',
      badge: 'Syarat & Ketentuan LUMAJANG TALKS',
      badgeColor: 'bg-lumajang-50 text-neutral-900 border-lumajang-200',
      heroTitle: 'Syarat, Ketentuan & Pedoman Siber LUMAJANG TALKS',
      heroDesc: 'Etika penggunaan portal Suara & Berita Kota Pisang Lumajang, aturan diskusi warga, dan disclaimer.',
      seoTitle: 'Syarat & Ketentuan & Pedoman Siber - LUMAJANG TALKS',
      seoDesc: 'Syarat, ketentuan layanan, dan pedoman pemberitaan media siber LUMAJANG TALKS.',
      terms: [
        {
          id: 'syarat-lumajang',
          icon: Scale,
          title: '1. Penggunaan Portal LUMAJANG TALKS',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Penggunaan portal <strong>LUMAJANG TALKS</strong> diatur oleh ketentuan berikut untuk menciptakan ruang informasi publik yang sehat di Kabupaten Lumajang.
              </p>
            </>
          )
        },
        {
          id: 'pedoman-siber-lumajang',
          icon: ShieldCheck,
          title: '2. Pedoman Siber & Etika Jurnalisme Lumajang',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Seluruh artikel berita Lumajang Talks ditulis dengan menjunjung kebenaran fakta, keberimbangan, dan kedamaian antar masyarakat Lumajang.
              </p>
            </>
          )
        },
        {
          id: 'suara-warga-lumajang',
          icon: MessageSquare,
          title: '3. Aturan Suara & Aspirasi Warga',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Pesan aspirasi warga yang dikirimkan tidak boleh memuat ujaran fitnah, provokasi konflik, atau hoaks yang meresahkan warga Kota Pisang.
              </p>
            </>
          )
        },
        {
          id: 'hak-cipta-lumajang',
          icon: Copyright,
          title: '4. Hak Cipta Konten Lumajang Talks',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Pengutipan berita Lumajang Talks oleh media lain wajib menyebutkan sumber <strong>"LUMAJANG TALKS"</strong> dan menyertakan tautan aktif.
              </p>
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
      heroTitle: 'Syarat & Ketentuan Gnext Ummah',
      heroDesc: 'Aturan penggunaan, ketentuan hak cipta dakwah, serta pedoman komunitas jamaah pembaca Gnext Ummah.',
      seoTitle: 'Syarat & Ketentuan - Gnext Ummah',
      seoDesc: 'Syarat dan ketentuan hak cipta, batasan tanggung jawab, serta pedoman komunitas pembaca Gnext Ummah.',
      terms: [
        {
          id: 'penggunaan-gummah',
          icon: Scale,
          title: '1. Ketentuan Penggunaan Layanan',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Akses dan pemanfaatan seluruh konten di Gnext Ummah harus diniatkan untuk kebaikan, penambah wawasan keislaman, dan silaturahmi yang membawa manfaat bagi sesama.
              </p>
            </>
          )
        },
        {
          id: 'hakcipta-gummah',
          icon: Copyright,
          title: '2. Hak Cipta & Penyebaran Konten Dakwah',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Sebagian besar artikel dakwah, inspirasi, dan khazanah Islam diperbolehkan untuk disebarluaskan (di-share) demi memperluas syiar kebaikan, dengan kewajiban menyertakan sumber asli Gnext Ummah secara jelas dan jujur.
              </p>
            </>
          )
        },
        {
          id: 'tanggungjawab-gummah',
          icon: AlertCircle,
          title: '3. Batasan Tanggung Jawab',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Opini, tafsir, dan jawaban dalam rubrik konsultasi syariah bersifat edukatif dan referensi awal. Gnext Ummah tidak bertanggung jawab atas keputusan mandiri yang diambil pembaca tanpa konsultasi langsung dengan ulama ahli terkait kondisi khusus masing-masing.
              </p>
            </>
          )
        }
      ]
    },
    studio: {
      name: 'Gnext Creative Studio',
      badge: 'Gnext Creative Studio',
      badgeColor: 'bg-neutral-200 text-neutral-800 border-neutral-300',
      heroTitle: 'Syarat dan Ketentuan',
      heroDesc: 'Ketentuan layanan, pedoman siber, etika digital, dan disclaimer ekosistem Gnext Creative Studio.',
      seoTitle: 'Syarat & Ketentuan - Gnext Creative Studio',
      seoDesc: 'Syarat dan ketentuan penggunaan platform Gnext Creative Studio.',
      terms: [
        {
          id: 'syarat-ketentuan-studio',
          icon: Scale,
          title: 'Syarat dan Ketentuan Studio',
          content: (
            <>
              <p className="mb-4 text-neutral-600 leading-relaxed">
                Dengan mengakses dan menggunakan layanan Gnext Creative Studio, pengguna dianggap telah memahami dan menyetujui syarat dan ketentuan berikut.
              </p>

              <h4 className="text-xl font-bold mb-2 mt-6">Ruang Lingkup Layanan</h4>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-1">
                <li>Media dan distribusi informasi</li>
                <li>Produksi konten kreatif</li>
                <li>Platform edukasi, event, dan kampanye</li>
                <li>Kolaborasi dan kemitraan</li>
              </ul>

              <h4 className="text-xl font-bold mb-2 mt-6">Kewajiban Pengguna</h4>
              <ul className="list-disc pl-5 mb-4 text-neutral-600 space-y-1">
                <li>Menyebarkan hoaks, ujaran kebencian, atau konten ilegal dilarang keras</li>
                <li>Melanggar hak cipta dan kekayaan intelektual dilarang keras</li>
              </ul>
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
        path="/terms"
      />
      <Navbar portal={portal === 'studio' ? undefined : portal} />
      
      <main className="pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Breadcrumb & Header */}
        <section className="w-full max-w-4xl mx-auto px-6 md:px-12 mb-12">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
            <Link to={getPortalHome()} className="hover:underline">Home</Link>
            <ChevronRight size={14} />
            <span className="text-neutral-900 font-medium">Syarat & Ketentuan</span>
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
            {currentConfig.terms.map((term, idx) => {
              const Icon = term.icon;
              return (
                <motion.div
                  key={term.id}
                  id={term.id}
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
                      {term.title}
                    </h2>
                  </div>
                  
                  <div className="prose prose-neutral max-w-none text-neutral-700">
                    {term.content}
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
