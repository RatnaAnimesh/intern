import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles } from 'lucide-react';

import Header from './components/Header';
import JobCard from './components/JobCard';
import SummaryBento from './components/SummaryBento';
import SourceFilter from './components/SourceFilter';
import { useInternshipEngine } from './hooks/useInternshipEngine';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);

  const { filteredInternships, loading, search } = useInternshipEngine();

  // --- Theme Management ---
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // --- Scroll Management (Collapsing Header) ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Search Debouncing ---
  useEffect(() => {
    const timer = setTimeout(() => {
      search(searchTerm, filterSource);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterSource, search]);

  return (
    <div className="min-h-screen bg-[var(--color-apple-bg)] text-[var(--color-apple-text-primary)] transition-colors duration-500 font-sans">
      <Header 
        theme={theme} 
        onToggleTheme={() => setTheme(p => p === 'light' ? 'dark' : 'light')} 
        isScrolled={isScrolled}
      />

      <main className="max-w-7xl mx-auto pb-24">
        
        {/* Value Proposition Hero (SummaryBento Relocated) */}
        <div className="pt-24 pb-8 mb-4">
           <SummaryBento />
        </div>

        {/* Dynamic Title Section */}
        <div className={`px-6 transition-all duration-500 transform ${isScrolled ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
           <div className="flex items-center gap-3 mb-2">
             <div className="px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue border border-apple-blue/20 flex items-center gap-1.5">
                <Sparkles size={12} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Enhanced Discovery</span>
             </div>
           </div>
           <h1 className="text-5xl font-extrabold tracking-tight mb-2">Internships</h1>
           <p className="text-apple-text-secondary text-lg font-medium opacity-80">Verified early-career opportunities for BITS Pilani.</p>
        </div>

        {/* Search & Filter Bar (Sticky and Integrated) */}
        <div className={`sticky top-20 z-40 px-6 my-10 transition-all duration-300 ${isScrolled ? 'max-w-3xl mx-auto translate-y-[-70px]' : ''}`}>
          <div className="mb-4">
            {!isScrolled && <SourceFilter selectedSource={filterSource} onSourceChange={setFilterSource} />}
          </div>
          <div className={`flex flex-col md:flex-row gap-3 items-center p-2 rounded-2xl transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.1] shadow-2xl shadow-black/10' : ''}`}>
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary" size={18} />
              <input 
                type="text" 
                className={`apple-input w-full pl-11 h-12 transition-all ${isScrolled ? 'bg-transparent border-none' : ''}`} 
                placeholder="Search roles, skills, or companies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Keeping the empty div to preserve flex layout for the sticky search bar */}
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 min-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-48 gap-4">
              <div className="relative">
                 <Loader2 className="animate-spin text-apple-blue" size={40} strokeWidth={2} />
                 <div className="absolute inset-0 blur-lg bg-apple-blue/20 animate-pulse rounded-full" />
              </div>
              <div className="text-center">
                 <p className="text-apple-text-primary text-sm font-bold tracking-tight">Syncing with Scout...</p>
                 <p className="text-apple-text-tertiary text-xs mt-1">Calculating semantic relevance scores</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredInternships.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredInternships.map((job, index) => (
                    <motion.div
                      key={`${job.company}-${job.title}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                         duration: 0.4, 
                         delay: Math.min(index * 0.05, 0.5),
                         type: "spring",
                         stiffness: 100,
                         damping: 20
                      }}
                    >
                      <JobCard {...job} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-40 bg-apple-secondary-bg/30 rounded-3xl border border-dashed border-black/10 dark:border-white/10"
                >
                  <div className="w-16 h-16 bg-apple-tertiary-bg rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search className="text-apple-text-tertiary" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-apple-text-primary">No Matching Interships</h3>
                  <p className="text-apple-text-secondary text-sm mt-2 max-w-xs mx-auto">
                    Try using broader keywords or removing your filters to see more roles.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      <footer className="py-20 px-6 text-center border-t border-black/[0.05] dark:border-white/[0.05] bg-apple-secondary-bg/20">
          <div className="max-w-xs mx-auto">
            <p className="text-[10px] font-black text-apple-text-tertiary uppercase tracking-[0.3em] mb-4">
              Designed by Ratna
            </p>
            <div className="flex items-center justify-center gap-4 opacity-50">
               <div className="w-1 h-1 rounded-full bg-apple-text-tertiary" />
               <div className="w-1 h-1 rounded-full bg-apple-text-tertiary" />
               <div className="w-1 h-1 rounded-full bg-apple-text-tertiary" />
            </div>
          </div>
      </footer>
    </div>
  );
};

export default App;

