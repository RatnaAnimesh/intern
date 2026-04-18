import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Zap } from 'lucide-react';
import TextScramble from './ui/TextScramble';

const LandingHero: React.FC = () => {
  return (
    <section className="relative h-[110vh] flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Immersive Background Blur Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-apple-blue/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      
      <div className="relative z-10 text-center space-y-8 px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium backdrop-blur-md mb-4"
        >
          <Sparkles size={14} className="text-apple-blue" />
          <span className="text-apple-text-body">The Next Generation of Internship Discovery</span>
        </motion.div>

        <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] text-white">
          FUTURE<br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">READY.</span>
        </h1>

        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-xl md:text-3xl text-apple-text-body font-medium leading-tight">
            Exclusive access for <span className="text-white"><TextScramble text="1st Year BITSians" /></span> to world-class roles.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <button className="apple-button h-14 px-10 text-lg flex items-center gap-3">
              Get Started <Zap size={20} fill="currentColor" />
            </button>
            <button className="h-14 px-10 rounded-full border border-white/10 bg-white/5 text-lg font-medium backdrop-blur-md hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest font-black text-white/40">Discover</span>
        <motion.div
           animate={{ y: [0, 8, 0] }}
           transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="text-apple-blue" size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LandingHero;
