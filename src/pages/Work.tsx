import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WorkComponent from '../components/Work';
import { SEO } from '../components/SEO';
import { Instagram, Heart, MessageCircle, Send, Bookmark, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Work, Partner } from './studio/types';

const formatIgEmbedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.replace(/\/$/, '');
    return `https://www.instagram.com${pathname}/embed/`;
  } catch {
    return url;
  }
};

const getIgShortcode = (url: string) => {
  try {
    const match = url.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : '';
  } catch {
    return '';
  }
};

const InstagramWorkCard = ({ work, index }: { work: Work; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const embedUrl = formatIgEmbedUrl(work.instagram_url);
  const shortcode = getIgShortcode(work.instagram_url);

  return (
    <div className="relative flex justify-center bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200 h-[420px] sm:h-[500px] w-[260px] sm:w-[320px] md:w-[350px] flex-shrink-0 group">
      {/* Sleek Instant Card Fallback & Preview */}
      <div className={`absolute inset-0 flex flex-col justify-between p-5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white transition-opacity duration-500 ${isLoaded && !hasError ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-lumajang-500 via-rose-500 to-purple-600 p-0.5">
              <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                <Instagram size={16} className="text-white" />
              </div>
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-white">@gnextindonesiacom</p>
              <p className="text-[10px] text-neutral-400">Instagram Post</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-800/80 text-accent border border-neutral-700/60">
            Karya #{index + 1}
          </span>
        </div>

        <div className="my-auto text-center py-6 px-3 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-lumajang-500/20 via-rose-500/20 to-purple-600/20 border border-neutral-700/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Instagram size={30} className="text-pink-500" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Postingan Instagram Karya</p>
          <p className="text-xs text-neutral-400 mb-5 line-clamp-2 max-w-[220px]">
            {shortcode ? `Kode Post: ${shortcode}` : 'Klik untuk membuka karya lengkap di Instagram'}
          </p>
          <a
            href={work.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95"
          >
            <span>Buka di Instagram</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <div className="flex items-center justify-between text-neutral-400 text-[11px] pt-3 border-t border-neutral-800">
          <span>Gnext Catalog</span>
          <span className="text-accent font-medium">www.gnextindonesia.site</span>
        </div>
      </div>

      {/* Embed Iframe */}
      {!hasError && Boolean(embedUrl) && (
        <iframe
          loading="lazy"
          src={embedUrl}
          title={`Instagram Post ${index}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full relative z-10 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          frameBorder="0"
          scrolling="no"
          allow="encrypted-media"
        ></iframe>
      )}
    </div>
  );
};

const services = [
  {
    title: 'Marketing Strategy',
    description: 'Perencanaan strategi pemasaran berbasis riset untuk meningkatkan brand awareness, engagement, dan konversi secara terukur.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Creative Content Production',
    description: 'Produksi konten kreatif untuk kebutuhan digital, mulai dari desain grafis, foto & video, copywriting, hingga konten kampanye yang relevan dengan audiens.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Platform Production',
    description: 'Pengembangan dan pengelolaan platform digital seperti website, landing page, media portal, dan sistem berbasis digital sesuai kebutuhan brand.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Digital Advertising',
    description: 'Perencanaan dan pengelolaan iklan digital (Meta Ads, Google Ads, dll) yang terarah, efektif, dan berbasis data.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Social Media Handling',
    description: 'Manajemen akun media sosial secara menyeluruh, meliputi perencanaan konten, publikasi, interaksi audiens, dan analisis performa.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Community Handling',
    description: 'Pengelolaan dan pengembangan komunitas digital untuk membangun interaksi yang sehat, loyalitas audiens, dan engagement jangka panjang.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Mutual Benefit Collaboration',
    description: 'Kerja sama strategis dengan berbagai pihak berdasarkan prinsip saling menguntungkan, berorientasi pada pertumbuhan dan dampak bersama.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const clientLogos = [
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=200&h=100&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=200&h=100&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&q=80&auto=format",
  "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=200&h=100&fit=crop&q=80&auto=format",
];

const igPosts = [
  {
    id: 1,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "21.381",
    brand: "Gnext Media Group |",
    caption: "Strategic planning session with the team. Turning ideas into impact. 💡🚀"
  },
  {
    id: 2,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "7.881",
    brand: "Sony Pictures |",
    caption: "Udah siap buat masuk dunia membeku yang penuh dengan hantu? Karena Ghostbusters: Frozen Empire bakalan tayang segera!"
  },
  {
    id: 3,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "6.344",
    brand: "Jenius |",
    caption: "\"Yakin mau hidup gini terus? Saatnya keluar dari pola pikir yang sama untuk wujudin apa yang kamu mau.\""
  },
  {
    id: 4,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "26.166",
    brand: "Clozette |",
    caption: "Seorang content creator bernama Naktekpang kerap kali melakukan uji lab secara mandiri dengan alat pribadi."
  },
  {
    id: 5,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "6.817",
    brand: "Danamon |",
    caption: "Di sana bakalan ada 400+ vendor pernikahan dari 20+ kategori, dan 50+ tenant makanan, seru banget gak sih?"
  },
  {
    id: 6,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "22.957",
    brand: "Binus University |",
    caption: "BINUS University baru saja meluncurkan program terbarunya yaitu #MulaiLebihAwal, sebuah enrichment program untuk mahasiswa."
  },
  {
    id: 7,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "15.420",
    brand: "Gnext Indonesia |",
    caption: "Siap untuk membasmi segala rintangan! Mari kita bangun platform dan komunitas yang positif. 💪🔥"
  },
  {
    id: 8,
    link: "https://instagram.com/gnextindonesiacom",
    image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    likes: "12.030",
    brand: "Creative Hub |",
    caption: "Kita usahakan cowok ganteng... eh maksudnya konten menarik yang bikin followers betah mantengin timeline!"
  }
];

const InstagramPostCard = ({ post, idx }: { post: any, idx: number }) => (
  <a 
    key={`${post.id}-${idx}`} 
    href={post.link} 
    target="_blank" 
    rel="noreferrer"
    className="flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300 group w-[300px] sm:w-[350px] flex-shrink-0"
  >
    {/* Header */}
    <div className="flex items-center gap-3 p-3">
      <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0">
        <img 
          src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop" 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </div>
      <span className="font-bold text-sm text-neutral-900 group-hover:text-accent transition-colors">
        gnextindonesiacom
      </span>
    </div>
    
    {/* Image */}
    <div className="w-full aspect-square bg-neutral-100 relative overflow-hidden">
      <img 
        src={post.image} 
        alt="Post media" 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
    </div>

    {/* Footer / Caption */}
    <div className="p-4 flex flex-col flex-grow whitespace-normal text-left">
      <div className="flex items-center justify-between mb-3 text-neutral-900">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold mr-1">{post.likes}</span>
          <Heart size={20} className="hover:text-pink-500 transition-colors" />
          <MessageCircle size={20} className="hover:text-neutral-500 transition-colors" />
          <Send size={20} className="hover:text-neutral-500 transition-colors" />
        </div>
        <Bookmark size={20} className="hover:text-neutral-500 transition-colors" />
      </div>
      
      <div className="text-sm text-neutral-800 leading-relaxed line-clamp-3 mt-1">
        <span className="font-bold mr-1">{post.brand}</span>
        {post.caption}
      </div>
    </div>
  </a>
);

export default function WorkPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [worksRes, partnersRes] = await Promise.all([
        supabase.from('works').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('created_at', { ascending: true })
      ]);
      if (worksRes.data) setWorks(worksRes.data);
      if (partnersRes.data) setPartners(partnersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const logos = partners.filter(p => p.logo_url);
  
  // If no database partners yet, use fallback
  const displayLogos = logos.length > 0 ? logos.map(p => p.logo_url as string) : clientLogos;
  const displayTexts = partners.length > 0 ? partners.map(p => p.name) : [
    "Chemarome Indonesia PT", "Dewata Kencana Distribusi PT", "Faay Beatycare Lumajang", 
    "Graha Duta Bangsa PT", "Habib Ios Store CV", "Mustika Motor Lumajang", "Sukun Wartono PT"
  ];

  // Duplicate items for marquee if necessary
  const marqueeWorks = works.length > 0
    ? (works.length < 4 ? [...works, ...works, ...works, ...works] : [...works, ...works])
    : [];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent selection:text-neutral-900">
      <SEO 
        title="Our Work & Services" 
        description="Jelajahi berbagai layanan yang kami tawarkan, mulai dari Marketing Strategy, Creative Content Production, hingga Digital Advertising."
        path="/work"
      />
      <Navbar />
      
      <main className="pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Header Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-12 sm:mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-4 sm:gap-6"
          >
            <h2 className="text-xs sm:text-sm md:text-base font-bold tracking-widest uppercase text-neutral-500">
              Uncover what we can serve
            </h2>
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[0.95] md:leading-[0.9] tracking-tighter uppercase max-w-4xl">
              SIAP UNTUK PROJECT <span className="italic font-light text-neutral-500">BARU.</span>
            </h1>
          </motion.div>
        </section>

        {/* Services List */}
        <section className="w-full">
          <div className="flex flex-col">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="group border-t border-neutral-200 hover:bg-neutral-900 hover:text-neutral-50 transition-colors duration-500"
              >
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 md:gap-12 items-center">
                  <div className="md:col-span-5 lg:col-span-4">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold leading-snug group-hover:text-accent transition-colors duration-500">
                      {service.title}
                    </h3>
                  </div>
                  
                  <div className="md:col-span-7 lg:col-span-5">
                    <p className="text-base sm:text-lg md:text-xl text-neutral-600 group-hover:text-neutral-300 transition-colors duration-500 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="md:col-span-12 lg:col-span-3 hidden lg:block overflow-hidden rounded-2xl h-32 w-full max-w-xs ml-auto opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="border-t border-neutral-200"></div>
          </div>
        </section>

        {/* 500+ Content Marquee */}
        <section className="py-12 sm:py-20 md:py-32 overflow-hidden bg-neutral-50">
          <div className="relative flex overflow-hidden whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 20,
              }}
              className="flex whitespace-nowrap"
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-4xl sm:text-7xl md:text-9xl font-display font-extrabold uppercase tracking-tighter mx-4 sm:mx-8 text-neutral-900">
                    {works.length > 0 ? works.length : 500}+ Content in a month!
                  </span>
                  <span className="text-4xl sm:text-7xl md:text-9xl font-display font-extrabold uppercase tracking-tighter mx-4 sm:mx-8 text-accent italic">
                    Creative
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Instagram Portfolio */}
        <section className="w-full py-8 sm:py-12 md:py-20 bg-neutral-50 flex flex-col gap-4 sm:gap-6 overflow-hidden">
          {marqueeWorks.length > 0 ? (
            <>
              <div className="relative flex overflow-x-hidden">
                <motion.div
                  animate={{ x: ["-50%", "0%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
                  className="flex gap-4 sm:gap-6 px-2 w-max"
                >
                  {marqueeWorks.map((work, idx) => (
                    <InstagramWorkCard key={`row1-${idx}`} work={work} index={idx} />
                  ))}
                </motion.div>
              </div>
              
              <div className="relative flex overflow-x-hidden">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
                  className="flex gap-4 sm:gap-6 px-2 w-max"
                >
                  {[...marqueeWorks].reverse().map((work, idx) => (
                    <InstagramWorkCard key={`row2-${idx}`} work={work} index={idx} />
                  ))}
                </motion.div>
              </div>

              <div className="relative flex overflow-x-hidden">
                <motion.div
                  animate={{ x: ["-50%", "0%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 35 }}
                  className="flex gap-4 sm:gap-6 px-2 w-max"
                >
                  {marqueeWorks.map((work, idx) => (
                    <InstagramWorkCard key={`row3-${idx}`} work={work} index={idx} />
                  ))}
                </motion.div>
              </div>
            </>
          ) : (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
              <div className="text-center py-16 text-neutral-400 border-2 border-dashed border-neutral-200 rounded-2xl">
                Belum ada karya yang diunggah.
              </div>
            </div>
          )}
        </section>

        {/* Client Logos & Partners Section */}
        <section className="w-full bg-accent py-16 sm:py-24 md:py-32 mt-12 sm:mt-20 rounded-[2rem] md:rounded-[3rem] px-4 sm:px-6 md:px-12 overflow-hidden">
          <div className="w-full max-w-7xl mx-auto text-center mb-10 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold uppercase tracking-tight mb-2 sm:mb-4">
                Trusted By
              </h2>
              <p className="text-neutral-800 text-base sm:text-lg md:text-xl font-medium">Partner dan Referensi Kami</p>
            </motion.div>
          </div>
          
          {displayLogos.length > 0 && (
            <div className="relative flex overflow-x-hidden whitespace-nowrap mb-12 sm:mb-20">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 15,
                }}
                className="flex whitespace-nowrap gap-8 sm:gap-16 px-4 items-center"
              >
                {[...displayLogos, ...displayLogos, ...displayLogos].map((logo, i) => (
                  <div key={i} className="w-28 sm:w-40 md:w-48 h-12 sm:h-16 md:h-20 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    <img src={logo} alt="Client Logo" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {displayTexts.length > 0 && (
            <div className="w-full max-w-7xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-sm sm:text-lg md:text-2xl font-medium text-neutral-800 leading-relaxed max-w-5xl mx-auto">
                  {displayTexts.map((text, i) => (
                    <React.Fragment key={i}>
                      <span>{text}</span>
                      {i < displayTexts.length - 1 && <span className="text-neutral-900/20">•</span>}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </section>

        {/* Portfolio Section using WorkComponent */}
        <div className="pt-16 sm:pt-24 md:pt-32">
          <WorkComponent noTopMargin />
        </div>
      </main>

      <Footer />
    </div>
  );
}

