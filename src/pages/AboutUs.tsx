import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-accent selection:text-neutral-900">
      <SEO 
        title="About Us" 
        description="Gnext Indonesia adalah induk media digital dan creative studio yang berdedikasi untuk membangun generasi yang kreatif, adaptif, dan berdampak."
        path="/about"
      />
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Header Section */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-display font-extrabold leading-[0.9] tracking-tighter uppercase mb-8">
              Tentang <br className="hidden md:block" />
              <span className="italic font-light text-neutral-500">Kami</span>
            </h1>
            <p className="text-xl md:text-3xl font-display max-w-4xl leading-snug">
              Gnext Indonesia adalah induk media digital dan creative studio dibawah naungan Gnext Media Group (PT Gnext Creative Studio).
            </p>
          </motion.div>
        </section>

        {/* Image / Intro Section */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-24 md:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="prose prose-lg max-w-none text-neutral-600"
            >
              <p className="lead text-2xl text-neutral-900 mb-8 font-display font-medium">
                Kami lahir dari semangat untuk menjadikan kreativitas sebagai kekuatan yang mampu membawa perubahan, bukan hanya sebagai karya visual, tetapi sebagai kontribusi nyata bagi masyarakat.
              </p>
              <p>
                Sejak berdiri, Gnext Indonesia berfokus pada pengembangan konten, pelatihan, dan kolaborasi kreatif. Kami mengolah ide, suara, dan gagasan anak muda menjadi karya yang relevan, berdampak, dan memiliki nilai.
              </p>
              <p>
                Kami percaya bahwa setiap individu memiliki potensi kreatif. Melalui pendekatan partisipatif, kolaboratif, dan adaptif terhadap perkembangan media, Gnext Indonesia hadir untuk membangun ekosistem kreatif yang inklusif serta berorientasi pada hasil.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl overflow-hidden aspect-[4/5] lg:aspect-square relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Tim Gnext Indonesia" 
                className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
              />
              <div className="absolute inset-0 bg-neutral-900/5"></div>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="w-full bg-accent text-neutral-900 py-24 md:py-32 rounded-[3rem] -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 uppercase tracking-tight">Visi Kami</h2>
                <p className="text-2xl md:text-3xl font-medium leading-snug">
                  Menjadi ruang kreatif yang memberdayakan generasi muda untuk berkarya, berkembang, dan berkontribusi melalui media dan kreativitas.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 uppercase tracking-tight">Misi Kami</h2>
                <ul className="flex flex-col gap-6 text-xl md:text-2xl font-medium">
                  <li className="flex items-start gap-4">
                    <span className="text-neutral-500 font-display font-bold">01</span>
                    Mengembangkan potensi kreatif generasi muda melalui pelatihan dan pendampingan.
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-neutral-500 font-display font-bold">02</span>
                    Memproduksi konten yang edukatif, inspiratif, dan berdampak.
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-neutral-500 font-display font-bold">03</span>
                    Membangun kolaborasi dengan komunitas dan berbagai institusi.
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-neutral-500 font-display font-bold">04</span>
                    Menciptakan ekosistem media kreatif yang adaptif terhadap perkembangan zaman.
                  </li>
                </ul>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-32 text-center"
            >
              <h3 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold uppercase tracking-tighter leading-[0.9] mb-8">
                Where Creativity <br/>
                <span className="italic font-light">Becomes</span> Contribution.
              </h3>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto font-medium text-neutral-700">
                Bagi kami, kreativitas tidak berhenti pada ide atau karya. Kreativitas menemukan maknanya ketika ia memberi dampak, menjangkau banyak orang, dan menjadi bagian dari perubahan.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-center">
              Our Team
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Mete - Scorpio", role: "Corporate Direction", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
              { name: "Jane Doe", role: "Creative Director", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
              { name: "John Smith", role: "Content Strategist", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
              { name: "Sarah Lee", role: "Art Director", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col items-center text-center"
              >
                <div className="w-full aspect-square rounded-[2rem] overflow-hidden mb-6 relative bg-neutral-200">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-2xl font-display font-bold mb-1">{member.name}</h3>
                <p className="text-neutral-500 font-medium uppercase tracking-wider text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
