import { ShieldCheck, Users, Zap, TrendingUp, Trophy } from 'lucide-react';

const SummaryBento: React.FC = () => {
  return (
    <section className="py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[auto] md:h-[600px]">
          
          {/* Main Stat Card */}
          <div className="md:col-span-2 md:row-span-2 p-8 rounded-3xl bg-apple-blue/10 border border-apple-blue/20 flex flex-col justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 text-apple-blue opacity-10 group-hover:scale-150 transition-transform duration-700">
               <Trophy size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-apple-blue flex items-center justify-center mb-6">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <h3 className="text-4xl font-black text-white leading-tight">
                Verified BITSian <br />Excellence.
              </h3>
              <p className="text-apple-text-body mt-4 text-lg max-w-sm">
                Every listing is vetted specifically for the BITS Pilani academic calendar and rigor.
              </p>
            </div>
            <div className="relative z-10 pt-8">
               <span className="text-6xl font-black text-white">120+</span>
               <p className="text-apple-blue font-bold uppercase tracking-widest text-xs">Live Opportunities</p>
            </div>
          </div>

          {/* 1st Year Card */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-8 group">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                 <Zap size={16} fill="currentColor" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Priority #1</span>
              </div>
              <h4 className="text-2xl font-bold text-white">1st Year Native</h4>
              <p className="text-apple-text-body text-sm mt-2">Roles architected for the class of 2028/29.</p>
            </div>
            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:rotate-12 transition-transform">
               <Users size={40} />
            </div>
          </div>

          {/* Small Feature Cards */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 group hover:bg-apple-blue/5 transition-colors">
             <TrendingUp className="text-apple-blue mb-4" size={32} />
             <h4 className="text-lg font-bold text-white mb-2">Semantic AI</h4>
             <p className="text-apple-text-body text-xs">Deep intent matching powered by TensorFlow.</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 group hover:bg-apple-blue/5 transition-colors">
             <div className="flex -space-x-2 mb-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800" />
                ))}
             </div>
             <h4 className="text-lg font-bold text-white mb-2">Trusted by 500+</h4>
             <p className="text-apple-text-body text-xs">BITSians already using the "Sniper" engine.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SummaryBento;
