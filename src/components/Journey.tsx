import React from 'react';
import { motion } from 'motion/react';

const stats = [
  { value: '4+', label: 'Years Experience' },
  { value: '10+', label: 'Program Pelatihan' },
  { value: '100+', label: 'Orang Terlibat' },
  { value: '1000+', label: 'Produksi Konten' },
  { value: '10000+', label: 'Penerima Manfaat' },
  { value: '100000+', label: 'Audiens Dijangkau' }
];

export default function Journey() {
  return (
    <section className="relative w-full min-h-[100dvh] flex items-center py-28 md:py-36 bg-black text-white overflow-hidden select-none">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
          alt="Earth from space" 
          className="w-full h-full object-cover object-center mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        {/* Left side text */}
        <div className="lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-sm font-medium tracking-widest uppercase text-accent">Perjalanan Kami</h2>

            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.05] tracking-tight">
              Kami tidak hanya menciptakan konten — kami membangun <span className="text-accent italic font-light">ekosistem kreatif.</span>
            </h3>

            <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-xl pt-2">
              Pertumbuhan berkelanjutan bersama para kreator, talenta, dan mitra strategis di seluruh wilayah Indonesia.
            </p>
          </motion.div>
        </div>

        {/* Right side stats list */}
        <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="p-6 bg-neutral-900/60 rounded-2xl border border-neutral-800 hover:border-accent/40 transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl font-display font-extrabold text-accent mb-2">{stat.value}</div>
              <span className="text-sm font-semibold text-neutral-300 tracking-wide uppercase font-mono">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


