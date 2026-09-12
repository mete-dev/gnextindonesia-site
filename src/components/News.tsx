import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchPublishedArticlesAndMetadata } from '../lib/cachedFetch';
import { slugify } from '../data/news';
import { formatDate } from '../lib/trending';

export default function News() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPublishedArticlesAndMetadata();
      if (data.articles) {
        setArticles(data.articles);
      }
      if (data.categories) {
        setCategories(data.categories);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  const mappedArticles = articles.map(a => ({
    id: a.id,
    title: a.title,
    categoryId: a.category_id,
    category: getCategoryName(a.category_id),
    date: a.date,
    image: a.cover_image || 'https://images.unsplash.com/photo-1432828684207-6b4510008518?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }));

  const availableCategoryNames = Array.from(new Set(mappedArticles.map(a => a.category)));
  const displayCategories = ['Semua', ...availableCategoryNames];

  const filteredArticles = activeCategory === 'Semua' 
    ? mappedArticles 
    : mappedArticles.filter(a => a.category === activeCategory);

  return (
    <section id="news" className="min-h-[100dvh] flex flex-col justify-center py-24 md:py-32 bg-neutral-50 text-neutral-900 rounded-t-[3rem] -mt-10 relative z-[15]">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-sm font-medium tracking-widest uppercase text-neutral-500 mb-4">News & Insights</h2>
            <h3 className="text-5xl md:text-6xl font-display font-bold leading-tight">
              Kabar <br />
              <span className="italic font-light text-neutral-500">terbaru.</span>
            </h3>
          </motion.div>
          
          <Link to="/news" className="hidden md:flex items-center gap-2 text-neutral-900 font-bold hover:text-accent transition-colors pb-4">
            Lihat semua berita <ArrowUpRight size={20} />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {displayCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === category 
                  ? 'bg-neutral-900 text-neutral-50 border-neutral-900' 
                  : 'bg-transparent text-neutral-600 border-neutral-900/10 hover:border-neutral-900/30'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArticles.slice(0, 3).map((article) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={article.id}
                className="group flex flex-col h-full"
              >
                <Link to={`/news/${slugify(article.category)}/${slugify(article.title)}`} className="flex flex-col h-full">
                  <div className="relative overflow-hidden rounded-3xl mb-6 aspect-[4/3]">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-medium text-neutral-900 uppercase tracking-wider">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                      <span className="font-calibri text-neutral-500">{formatDate(article.date)}</span>
                    </div>
                    <h4 className="text-2xl font-display font-bold leading-snug mb-4 group-hover:text-accent transition-colors duration-300">
                      {article.title}
                    </h4>
                    <div className="mt-auto inline-flex items-center gap-2 text-sm font-medium hover:text-neutral-500 transition-colors">
                      Baca selengkapnya <ArrowUpRight size={16} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="mt-12 flex justify-center md:hidden">
          <Link to="/news" className="inline-flex items-center gap-2 text-neutral-900 font-bold hover:text-accent transition-colors">
            Lihat semua berita <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
