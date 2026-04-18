import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { Search, Filter, Sparkles, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

import Header from './components/Header';
import JobCard from './components/JobCard';
import LandingHero from './components/LandingHero';
import SummaryBento from './components/SummaryBento';

gsap.registerPlugin(ScrollTrigger);

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
  const [error] = useState<string | null>(null);
  const [userEmail] = useState<string | undefined>("bitsian.guest@pilani.bits-pilani.ac.in");

  // Global Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Dashboard Visibility (GSAP Controlled)
  const [isShowingDashboard, setIsShowingDashboard] = useState(false);

  // Refs for Animations
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // --- Smooth Scroll & ScrollTrigger Orchestration ---
  useGSAP(() => {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Initial Dashboard Reveal Trigger
    ScrollTrigger.create({
      trigger: dashboardRef.current,
      start: "top 80%",
      onEnter: () => setIsShowingDashboard(true),
    });

    // Landing to Dashboard Parallax/Zoom Effect
    gsap.to(".landing-hero-content", {
      scrollTrigger: {
        trigger: ".landing-hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      scale: 0.8,
      opacity: 0,
      y: 100
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, { scope: mainContainerRef });

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // --- Search & Semantic State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEmbedding, setSearchEmbedding] = useState<number[] | null>(null);
  const [filterModality, setFilterModality] = useState('all');
  const [useModel, setUseModel] = useState<use.UniversalSentenceEncoder | null>(null);
  const [, setIsModelLoading] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      try {
        await tf.ready();
        const model = await use.load();
        setUseModel(model);
      } catch (err) {
        console.error("TF model failed:", err);
      } finally {
        setIsModelLoading(false);
      }
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
      } catch (err) { console.error("Embedding generation failed:", err); }
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
      } catch (err) { console.error("Search embedding failed:", err); }
    }, 400);
    return () => clearTimeout(timer);
  }, [useModel, searchTerm]);

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const response = await fetch('/internships.csv');
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
    <div ref={mainContainerRef} className="bg-black transition-colors duration-500 selection:bg-apple-blue selection:text-white">
      
      {/* 1. Cinematic Landing Phase */}
      <div className="landing-hero-section">
        <div className="landing-hero-content">
          <LandingHero />
        </div>
      </div>

      <SummaryBento />

      {/* 2. Main Dashboard Phase */}
      <Header 
        userEmail={userEmail} 
        theme={theme} 
        onToggleTheme={() => setTheme(p => p === 'light' ? 'dark' : 'light')} 
      />

      <div ref={dashboardRef} className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        
        {/* Dashboard Entry Animation - Reveal on Scroll */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: isShowingDashboard ? 1 : 0, y: isShowingDashboard ? 0 : 40 }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* AI Search Overlay */}
          <div className="pt-24 pb-12 text-center">
            {useModel && (
              <div className="inline-flex justify-center">
                <div className="semantic-status ready">
                  <Sparkles size={14} className="text-apple-blue" />
                  Contextual AI Discovery Active
                </div>
              </div>
            )}
          </div>

          <div className="mb-20">
            <div className="flex flex-col md:flex-row gap-6 items-center max-w-5xl mx-auto">
              <div className="relative flex-grow w-full group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-apple-text-body transition-colors group-focus-within:text-apple-blue" size={24} />
                <input 
                  type="text" 
                  className="apple-input w-full pl-14 h-16 text-xl shadow-2xl shadow-apple-blue/10 border border-white/5" 
                  placeholder={useModel ? "What kind of role are you imagining?" : "Search roles..."} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-60 group">
                  <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-apple-text-body" size={20} />
                  <select 
                    className="apple-input w-full pl-14 h-16 text-sm font-bold appearance-none cursor-pointer border border-white/5"
                    value={filterModality}
                    onChange={(e) => setFilterModality(e.target.value)}
                  >
                    <option value="all">Everywhere</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Remote">Remote Only</option>
                    <option value="Hybrid">Hybrid Roles</option>
                  </select>
              </div>
            </div>
          </div>
        </motion.div>

        {error ? (
          <div className="text-center py-24 text-destructive font-bold">{error}</div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-apple-blue" size={48} strokeWidth={1} />
            <p className="text-apple-text-body font-medium">Curating verified BITSian roles...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredInternships.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredInternships.map((job, index) => (
                  <motion.div
                    key={`${job.company}-${job.title}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <JobCard {...job} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 rounded-3xl border border-dashed border-white/10"
              >
                <h3 className="text-2xl font-bold text-apple-text-heading mb-2">Nothing matches your intent</h3>
                <p className="text-apple-text-body">Try refining your search terms.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default App;
