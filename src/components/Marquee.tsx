import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Flame, Star } from 'lucide-react';

export default function Marquee() {
  const items = [
    "Gnext Indonesia",
    "Creative",
    "Create",
    "Contribution",
  ];
  
  return (
    <div className="w-full bg-accent py-4 md:py-6 overflow-hidden border-y-2 border-neutral-900 shadow-md">
      <div className="flex whitespace-nowrap select-none">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 60,
          }}
          className="flex items-center whitespace-nowrap"
        >
          {[...items, ...items, ...items, ...items].map((text, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-2xl sm:text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tight px-4 text-neutral-950 flex items-center gap-3">
                {text}
              </span>
              <span className="text-neutral-950 px-2 font-bold text-xl">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

