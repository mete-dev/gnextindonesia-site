import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Kampanye Generasi Muda',
    category: 'Marketing Strategy',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    colSpan: 'md:col-span-2',
  },
  {
    id: 2,
    title: 'Kolaborasi Brand Lokal',
    category: 'Content Production',
    image: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    colSpan: 'md:col-span-1',
  },
  {
    id: 3,
    title: 'Platform Media Digital',
    category: 'Platform Production',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    colSpan: 'md:col-span-1',
  },
  {
    id: 4,
    title: 'Strategi Iklan Kreatif',
    category: 'Digital Advertising',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    colSpan: 'md:col-span-2',
  }
];

interface WorkProps {
  noTopMargin?: boolean;
}

export default function Work({ noTopMargin = false }: WorkProps) {
  return (
    <section id="work" className={`min-h-[100dvh] flex flex-col justify-center py-16 sm:py-24 md:py-32 bg-neutral-950 text-neutral-50 relative z-10 ${noTopMargin ? 'rounded-[2rem] md:rounded-[3rem] mx-0' : 'rounded-t-[2rem] md:rounded-t-[3rem] -mt-10'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xs sm:text-sm font-medium tracking-widest uppercase text-accent mb-2 sm:mb-4">Selected Work</h2>
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold leading-tight">
              Karya Menjadi <br />
              <span className="italic font-light text-neutral-400">Kontribusi.</span>
            </h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl ${project.colSpan} h-[320px] sm:h-[420px] md:h-[500px] cursor-pointer`}
            >
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent flex flex-col justify-end p-5 sm:p-8">
                <div className="transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-accent text-sm sm:text-base font-medium mb-1 sm:mb-2">{project.category}</p>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xl sm:text-3xl font-display font-bold">{project.title}</h4>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-neutral-900 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform translate-x-0 sm:-translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300 flex-shrink-0">
                      <ArrowUpRight size={20} className="sm:w-6 sm:h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
