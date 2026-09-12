import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATALOG_ITEMS = [
  {
    id: 'posnesia',
    name: 'Posnesia',
    description: 'Sistem point of sales modern dan terintegrasi untuk bisnis Anda.',
    category: 'Aplikasi Bisnis',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800',
    tags: ['Kasir', 'Manajemen Stok', 'Laporan Keuangan'],
    link: '#'
  },
  {
    id: 'siakad',
    name: 'Siakad',
    description: 'Sistem Informasi Akademik cerdas untuk sekolah dan institusi pendidikan.',
    category: 'Pendidikan',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    tags: ['E-Learning', 'Manajemen Siswa', 'Jadwal Kuliah'],
    link: '#'
  },
  {
    id: 'webprofile',
    name: 'Web Profile',
    description: 'Website company profile premium untuk meningkatkan kredibilitas brand Anda.',
    category: 'Website',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    tags: ['Company Profile', 'Portofolio', 'SEO Optimized'],
    link: '#'
  }
];

export default function Katalog() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter text-neutral-900 mb-6"
            >
              Katalog <br/>
              <span className="text-neutral-400">Produk.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-neutral-600 max-w-2xl font-serif"
            >
              Jelajahi berbagai solusi digital unggulan dari Gnext Indonesia untuk mendukung pertumbuhan bisnis dan instansi Anda.
            </motion.p>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATALOG_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col bg-neutral-50 rounded-3xl overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                <div className="aspect-[4/3] bg-neutral-200 overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-neutral-900 text-xs font-bold uppercase tracking-wider rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-display font-black text-neutral-900 mb-3 group-hover:text-red-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed mb-6 flex-1">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-neutral-200/50 text-neutral-600 text-xs font-medium rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a 
                    href={item.link}
                    className="inline-flex items-center justify-between w-full p-4 bg-white border border-neutral-200 rounded-xl font-bold text-sm text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white group-hover:border-neutral-900 transition-all"
                  >
                    <span>Pelajari Lebih Lanjut</span>
                    <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
