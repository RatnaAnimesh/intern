import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { Search, Filter, Loader2 } from 'lucide-react';

import Header from './components/Header';
import JobCard from './components/JobCard';
import SummaryBento from './components/SummaryBento';

interface InternshipData {
  company: string;
  title: string;
  location: string;
  stipend: string;
  duration: string;
  requirements: string;
  apply_link: string;
  branch?: string;
  modality?: string;
  is_first_year?: string;
  embedding?: number[];
  score?: number;
}

const App: React.FC = () => {
  const [internships, setInternships] = useState<InternshipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // --- Theme Management ---
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // --- Data & AI Engine ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEmbedding, setSearchEmbedding] = useState<number[] | null>(null);
  const [filterModality, setFilterModality] = useState('all');
  const [useModel, setUseModel] = useState<use.UniversalSentenceEncoder | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const model = await use.load();
        setUseModel(model);
      } catch (err) { console.error("Model failure:", err); }
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (!useModel || internships.length === 0 || internships[0].embedding) return;
    const generateEmbeddings = async () => {
      try {
        const texts = internships.map(job => `${job.title} ${job.company} ${job.requirements}`);
        const embeddings = await useModel.embed(texts);
        const embeddingsArray = await embeddings.array() as number[][];
        setInternships(internships.map((job, i) => ({ ...job, embedding: embeddingsArray[i] })));
      } catch (err) { console.error("Embed error:", err); }
    };
    generateEmbeddings();
  }, [useModel, internships]);

  useEffect(() => {
    if (!useModel || !searchTerm.trim()) { setSearchEmbedding(null); return; }
    const timer = setTimeout(async () => {
      try {
        const embedding = await useModel.embed([searchTerm]);
        const embeddingArray = await embedding.array() as number[][];
        setSearchEmbedding(embeddingArray[0]);
      } catch (err) { console.error("Search embed error:", err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [useModel, searchTerm]);

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}internships.csv`);
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = (results.data as InternshipData[]).filter(j => j.company && j.title);
            setInternships(parsedData);
            setLoading(false);
          }
        });
      } catch (err) { setLoading(false); }
    };
    fetchInternships();
  }, []);

  const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const filteredInternships = useMemo(() => {
    let results = internships.map(job => {
      let score = 0;
      const kw = job.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 job.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (kw) score += 0.5;
      if (job.is_first_year === 'Priority: 1st Year') score += 1.0;
      if (searchEmbedding && job.embedding) score += cosineSimilarity(searchEmbedding, job.embedding);
      return { ...job, score };
    });
    results = results.filter(job => filterModality === 'all' || job.modality === filterModality);
    results.sort((a, b) => (b.score || 0) - (a.score || 0));
    return results;
  }, [internships, searchTerm, searchEmbedding, filterModality]);

  return (
    <div className="min-h-screen bg-[var(--color-apple-bg)] text-[var(--color-apple-text-primary)] transition-colors duration-500">
      <Header 
        theme={theme} 
        onToggleTheme={() => setTheme(p => p === 'light' ? 'dark' : 'light')} 
      />

      <main className="max-w-7xl mx-auto pb-24">
        {/* iOS-Style Large Title Header */}
        <header className="px-6 pt-12 pb-8">
           <h1 className="text-4xl font-extrabold tracking-tight">Internships</h1>
           <p className="text-apple-text-secondary mt-1 font-medium">Verified roles for BITSians</p>
        </header>

        {/* Integrated Search Bar */}
        <div className="px-6 mb-10">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary" size={18} />
              <input 
                type="text" 
                className="apple-input w-full pl-11 h-12" 
                placeholder="Search roles, skills, or companies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary" size={16} />
                <select 
                  className="apple-input w-full pl-11 h-12 text-sm font-semibold appearance-none cursor-pointer"
                  value={filterModality}
                  onChange={(e) => setFilterModality(e.target.value)}
                >
                  <option value="all">Everywhere</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-apple-blue" size={32} strokeWidth={2} />
              <p className="text-apple-text-secondary text-sm font-semibold">Updating Feed</p>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3, delay: index * 0.01 }}
                    >
                      <JobCard {...job} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-32 bg-apple-secondary-bg/50 rounded-2xl border border-dashed border-black/5 dark:border-white/5">
                  <h3 className="text-lg font-bold text-apple-text-secondary">No Results Found</h3>
                  <p className="text-apple-text-tertiary text-sm mt-1">Try broadening your search.</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      <SummaryBento />
      
      <footer className="py-12 px-6 text-center border-t border-black/[0.03] dark:border-white/[0.03]">
          <p className="text-[10px] font-bold text-apple-text-tertiary uppercase tracking-widest">
            Handcrafted for BITSians
          </p>
      </footer>
    </div>
  );
};

export default App;
