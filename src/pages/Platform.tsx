import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Instagram, Facebook, Twitter, Youtube, MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';

const platforms = [
  {
    name: 'Instagram',
    icon: Instagram,
    stats: [
      { label: 'Followers', value: '16K+' },
      { label: 'Views', value: '3M+' }
    ],
    color: 'bg-pink-500',
    link: 'https://instagram.com/gnextindonesiacom'
  },
  {
    name: 'TikTok',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    stats: [
      { label: 'Followers', value: '6.3K+' },
      { label: 'Likes', value: '325K+' }
    ],
    color: 'bg-black',
    link: '#'
  },
  {
    name: 'WhatsApp Channel',
    icon: MessageCircle,
    stats: [
      { label: 'Followers', value: '150+' },
      { label: 'Views', value: '1K+' }
    ],
    color: 'bg-green-500',
    link: '#'
  },
  {
    name: 'Facebook',
    icon: Facebook,
    stats: [
      { label: 'Followers', value: '1.1K+' }
    ],
    color: 'bg-blue-600',
    link: '#'
  },
  {
    name: 'Threads',
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.633-6.42a4.425 4.425 0 0 1-3.69-4.32c0-2.455 1.93-4.444 4.312-4.444 2.38 0 4.31 1.99 4.31 4.444v1.86c0 .885-.718 1.603-1.604 1.603-.886 0-1.603-.718-1.603-1.603V11.26a2.805 2.805 0 0 0-2.804-2.804c-1.55 0-2.805 1.254-2.805 2.804 0 1.55 1.255 2.805 2.805 2.805.518 0 1.002-.138 1.417-.38" />
      </svg>
    ),
    stats: [
      { label: 'Followers', value: '120+' },
      { label: 'Views', value: '192K+' }
    ],
    color: 'bg-neutral-900',
    link: '#'
  },
  {
    name: 'X (Twitter)',
    icon: Twitter,
    stats: [
      { label: 'Coming Soon', value: '-' }
    ],
    color: 'bg-neutral-800',
    link: '#'
  },
  {
    name: 'YouTube',
    icon: Youtube,
    stats: [
      { label: 'Coming Soon', value: '-' }
    ],
    color: 'bg-red-600',
    link: '#'
  }
];

export default function PlatformPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent selection:text-neutral-900">
      <SEO 
        title="Our Platforms" 
        description="Jelajahi berbagai platform digital kami yang menjangkau jutaan audiens setiap bulannya."
        path="/platform"
      />
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Header Section */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <h2 className="text-sm md:text-base font-bold tracking-widest uppercase text-neutral-500">
              Platform & Media
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold leading-[0.9] tracking-tighter uppercase max-w-5xl">
              EXPERIENCE THE FUTURE OF INNOVATION IN EVERY <span className="italic font-light text-neutral-500">INTERACTION.</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mt-4 leading-relaxed font-medium">
              Inovasi mentransformasi kemungkinan menjadi kenyataan.
            </p>
          </motion.div>
        </section>

        {/* Platforms Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {platforms.map((platform, idx) => {
              const Icon = platform.icon;
              return (
                <motion.a
                  key={platform.name}
                  href={platform.link}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group relative flex flex-col bg-white rounded-[2rem] p-8 border border-neutral-200 hover:border-transparent overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${platform.color}`} />
                  
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg ${platform.color}`}>
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all duration-300">
                      <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>

                  <div className="relative z-10 flex-grow">
                    <h3 className="text-3xl font-display font-bold mb-8 group-hover:text-neutral-900 transition-colors">
                      {platform.name}
                    </h3>

                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      {platform.stats.map((stat, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-3xl font-bold tracking-tight text-neutral-900">
                            {stat.value}
                          </span>
                          <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider mt-1">
                            {stat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
