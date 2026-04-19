import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  ExternalLink, 
  GraduationCap, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface JobCardProps {
  company: string;
  title: string;
  location: string;
  stipend: string;
  duration: string;
  requirements: string;
  apply_link: string;
  is_verified?: string;
  institutional_validation?: string;
  match_percentage?: number;
}

const JobCard: React.FC<JobCardProps> = (job) => {
  const isVerified = job.is_verified === 'Yes';
  const match = job.match_percentage || 0;

  return (
    <article className={`apple-card p-6 flex flex-col h-full hover:bg-white/[0.6] dark:hover:bg-white/[0.04] transition-all group active:scale-[0.99] cursor-default relative overflow-hidden ${match >= 85 ? 'ring-2 ring-apple-blue/5' : ''}`}>
      
      {/* Search match glow */}
      {match >= 90 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/10 blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-apple-tertiary-bg dark:bg-apple-tertiary-bg flex items-center justify-center flex-shrink-0 shadow-sm">
             <Building2 size={24} className="text-apple-text-secondary" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
               <p className="text-apple-blue font-bold text-[11px] uppercase tracking-wider">
                {job.company}
              </p>
              {isVerified && (
                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
                  <ShieldCheck size={10} fill="currentColor" fillOpacity={0.2} />
                  {job.institutional_validation}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold leading-tight line-clamp-2 text-apple-text-primary tracking-tight">
              {job.title}
            </h3>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-grow bg-black/[0.03] dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${match >= 80 ? 'bg-apple-blue' : 'bg-apple-text-secondary/50'}`}
            style={{ width: `${match}%` }}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Zap size={14} className={match >= 80 ? 'text-apple-blue' : 'text-apple-text-secondary'} fill={match >= 80 ? 'currentColor' : 'none'} />
          <span className={`text-xs font-black tracking-tighter ${match >= 80 ? 'text-apple-blue' : 'text-apple-text-secondary'}`}>
            {match}% MATCH
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2.5 text-apple-text-secondary">
          <MapPin size={16} className="opacity-40" />
          <span className="text-sm font-medium">{job.location}</span>
        </div>
        <div className="flex items-center gap-2.5 text-apple-text-secondary">
          <Calendar size={16} className="opacity-40" />
          <span className="text-sm font-bold text-apple-blue">{job.stipend}</span>
        </div>
      </div>

      <div className="flex-grow">
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] mb-6 border border-black/[0.03] dark:border-white/[0.03]">
          <p className="text-sm leading-relaxed text-apple-text-secondary line-clamp-4 font-medium italic">
            "{job.requirements}"
          </p>
        </div>
      </div>

      <a
        href={job.apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className={`apple-button-primary w-full flex items-center justify-center gap-2 text-sm py-3.5 transition-all font-bold ${match >= 80 ? 'shadow-lg shadow-apple-blue/20 group-hover:shadow-apple-blue/30' : 'bg-apple-tertiary-bg text-apple-text-primary hover:bg-apple-tertiary-bg/80 shadow-none'}`}
      >
        <span>Secure Seat</span>
        <ExternalLink size={16} strokeWidth={2.5} />
      </a>
    </article>
  );
};

export default JobCard;
