import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative h-[100dvh] min-h-[500px] flex flex-col justify-center items-center pt-20 pb-24 overflow-hidden select-none">
      {/* Subtle Ambient Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] h-[75vw] max-w-[650px] max-h-[650px] bg-accent/15 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Main Typography Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center text-center relative z-10 mb-8 sm:mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[9.5vw] min-[400px]:text-[10vw] sm:text-[9vw] lg:text-[7vw] xl:text-[8rem] leading-[1.05] sm:leading-[0.95] tracking-tighter uppercase font-display font-black text-neutral-900 flex flex-col sm:block gap-1 sm:gap-0 w-full"
        >
          <span className="block sm:inline text-neutral-900 whitespace-nowrap">Creative.</span>{' '}
          <span className="block sm:inline italic font-serif text-neutral-600 sm:text-neutral-500 font-normal whitespace-nowrap">Create.</span>{' '}
          <span className="block sm:inline text-neutral-900 whitespace-nowrap">Contribution.</span>
        </motion.h1>
      </div>

      {/* Minimalist Scroll Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center w-full"
      >
        <button
          onClick={scrollToContent}
          className="group flex items-center gap-3 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-neutral-900 text-white border border-neutral-800/80 shadow-md transition-all hover:bg-black hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Scroll ke konten selanjutnya"
        >
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-neutral-200 group-hover:text-accent transition-colors">
            Jelajahi Lebih Lanjut
          </span>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent text-neutral-950 flex items-center justify-center"
          >
            <ChevronDown size={14} className="sm:w-4 sm:h-4" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}





