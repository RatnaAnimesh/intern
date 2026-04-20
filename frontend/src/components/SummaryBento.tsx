import React from 'react';
import { ShieldCheck, Zap, Info, ArrowUpRight, GraduationCap } from 'lucide-react';

const SummaryBento: React.FC = () => {
  return (
    <section className="px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Verification Group */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.05] flex flex-col gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center">
            <ShieldCheck className="text-apple-blue" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-apple-text-primary tracking-tight">Tier-1 Verified</h3>
            <p className="text-apple-text-secondary text-sm leading-relaxed mt-2">
              Every role is filtered for Target School relevance (BITS/IIT/NIT) and academic compatibility.
            </p>
          </div>
        </div>

        {/* Global Impact Group */}
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-black/[0.05] dark:border-white/[0.05] flex flex-col gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Zap className="text-orange-500" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-apple-text-primary tracking-tight">Expertise Levels</h3>
            <p className="text-apple-text-secondary text-sm leading-relaxed mt-2">
              From exploratory 1st year roles to high-stakes Pre-Placement Offers for final years.
            </p>
          </div>
        </div>

        {/* Link / Meta Group */}
        <div className="p-8 rounded-3xl bg-apple-blue text-white flex flex-col justify-between group cursor-pointer hover:bg-apple-blue-hover transition-all shadow-xl shadow-apple-blue/20 active:scale-[0.98]">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
               <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Target School Perks</h3>
              <p className="text-white/80 text-sm leading-relaxed mt-2 font-medium">
                Access the "Pilani Mafia" network and dedicated Tier-1 recruitment cycles.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
             <span className="text-xs font-bold uppercase tracking-widest">Explore Paths</span>
             <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
          </div>
        </div>

      </div>
    </section>
  );
};

export default SummaryBento;

