import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  portal?: string;
  className?: string;
}

export default function Breadcrumbs({ items, portal = 'gnext', className = '' }: BreadcrumbsProps) {
  // Brand accent colors based on the current portal
  const isLentera = portal.startsWith('lentera');
  const isGummah = portal === 'gummah';
  const isYoiki = portal === 'yoikijatim';
  const isLumajang = portal === 'lumajangtalks';
  const isFinance = portal === 'finance';

  const accentTextClass = 
    isLentera ? 'text-[#8C4A21]' : 
    isGummah ? 'text-emerald-800' : 
    isYoiki ? 'text-orange-600' : 
    isLumajang ? 'text-lumajang-400 font-bold' : 
    isFinance ? 'text-blue-600' :
    'text-red-600';

  const hoverTextClass = 
    isLentera ? 'hover:text-[#8C4A21]' : 
    isGummah ? 'hover:text-emerald-700' : 
    isYoiki ? 'hover:text-orange-500' : 
    isLumajang ? 'hover:text-lumajang-300' : 
    isFinance ? 'hover:text-blue-500' :
    'hover:text-red-500';

  // Container motion variants for smooth staggered load
  const containerVariants = {
    hidden: { opacity: 0, y: -4 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -4 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  };

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-neutral-500 font-medium overflow-x-auto whitespace-nowrap py-1.5 px-1 -mx-1 select-none scrollbar-none ${className}`}
    >
      {/* Root/Home Icon */}
      <motion.div variants={itemVariants} className="flex items-center">
        <Link
          to={items[0]?.path || '/'}
          className="flex items-center gap-1 text-neutral-400 hover:text-neutral-800 transition-colors duration-200"
        >
          <Home size={13} className="shrink-0" />
        </Link>
      </motion.div>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {/* Divider */}
            <motion.span
              variants={itemVariants}
              className="text-neutral-300 flex items-center shrink-0"
            >
              <ChevronRight size={11} className="stroke-[2.5px]" />
            </motion.span>

            {/* Breadcrumb Item */}
            <motion.div variants={itemVariants} className="flex items-center min-w-0">
              {isLast || !item.path ? (
                <span
                  className={`truncate max-w-[150px] sm:max-w-[280px] md:max-w-[400px] font-semibold text-neutral-800 ${
                    item.active ? accentTextClass : 'text-neutral-600'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={`truncate max-w-[120px] sm:max-w-[200px] text-neutral-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] transition-colors duration-200 ${hoverTextClass}`}
                >
                  {item.label}
                </Link>
              )}
            </motion.div>
          </React.Fragment>
        );
      })}
    </motion.nav>
  );
}
