import React from 'react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="min-h-[100dvh] py-24 md:py-32 flex items-center bg-neutral-900 text-neutral-50 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <h2 className="text-sm font-medium tracking-widest uppercase text-accent">About Gnext</h2>

            <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-[1.08] tracking-tight">
              Where Creativity Becomes <br/>
              <span className="text-accent italic font-light">Contribution.</span>
            </h3>

            <p className="text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed">
              Creative. Create. Contribution. Ini bukan sekadar mantra — ini cara kami bergerak. Kami membantu individu, komunitas, dan institusi mengembangkan potensi kreatif melalui ekosistem konten dan media.
            </p>
          </motion.div>

          {/* Visual Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4 h-[440px] sm:h-[500px]"
          >
            <div className="bg-neutral-800 rounded-3xl overflow-hidden h-full relative group">
              <img 
                src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80" 
                alt="Indonesian Traditional Craft & Culture" 
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>

            <div className="grid grid-rows-2 gap-4 h-full">
              <div className="bg-accent rounded-3xl p-6 flex flex-col justify-between">
                <span className="text-xs font-mono font-bold text-neutral-950 uppercase tracking-widest">[ VIBE & MOVEMENT ]</span>
                <h4 className="text-neutral-950 font-display text-2xl font-black leading-tight">
                  Creative <br/>Movement.
                </h4>
              </div>

              <div className="bg-neutral-800 rounded-3xl overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80" 
                  alt="Indonesian Batik Pattern Art" 
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


