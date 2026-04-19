import React from 'react';
import { ExternalLink, MapPin, Calendar, Clock, GraduationCap, Building2 } from 'lucide-react';

interface JobCardProps {
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
  skills?: string;
  viability_score?: number;
  score?: number;
}

const JobCard: React.FC<JobCardProps> = (job) => {
  const isPriority = job.is_first_year === 'Priority: 1st Year';
  const vScore = job.viability_score || 5;

  return (
    <article className={`apple-card p-6 flex flex-col h-full hover:bg-white/[0.6] dark:hover:bg-white/[0.04] transition-all group active:scale-[0.99] cursor-default relative overflow-hidden ${vScore >= 8 ? 'ring-2 ring-apple-blue/5' : ''}`}>
      
      {/* High Viability Glow */}
      {vScore >= 9 && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-apple-blue/5 blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-apple-tertiary-bg dark:bg-apple-tertiary-bg flex items-center justify-center flex-shrink-0">
             <Building2 size={20} className="text-apple-text-secondary" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
               <p className="text-apple-blue font-bold text-[10px] uppercase tracking-widest">
                {job.company}
              </p>
              {vScore >= 8 && (
                <span className="flex items-center gap-1 text-[9px] font-black text-orange-500 uppercase tracking-tighter bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                  <Sparkles size={8} fill="currentColor" />
                  High Match
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold leading-tight line-clamp-2 text-apple-text-primary tracking-tight">
              {job.title}
            </h3>
          </div>
        </div>
        {isPriority && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-apple-blue/10 text-apple-blue border border-apple-blue/10 flex-shrink-0">
            <GraduationCap size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-tighter">1st Year</span>
          </div>
        )}
      </div>

      {/* Skills Grid */}
      {job.skills && job.skills !== 'General' && (
        <div className="flex flex-wrap gap-1.5 mb-6">
           {job.skills.split(',').map(skill => (
             <span key={skill} className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/5 border border-black/[0.05] dark:border-white/[0.05] text-[10px] font-semibold text-apple-text-secondary">
               {skill.trim()}
             </span>
           ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 mb-6 relative z-10">
        <div className="flex items-center gap-2.5 text-apple-text-secondary">
          <MapPin size={14} className="opacity-50" />
          <span className="text-xs font-semibold">{job.location} • {job.modality || 'In-Person'}</span>
        </div>
        <div className="flex items-center gap-2.5 text-apple-text-secondary">
          <Clock size={14} className="opacity-50" />
          <span className="text-xs font-semibold">{job.duration}</span>
        </div>
        <div className="flex items-center gap-2.5 text-apple-text-secondary">
          <Calendar size={14} className="opacity-50" />
          <span className="text-xs font-semibold text-apple-blue">{job.stipend}</span>
        </div>
      </div>

      <div className="flex-grow">
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] mb-6 border border-black/[0.03] dark:border-white/[0.03]">
          <p className="text-xs leading-relaxed text-apple-text-secondary line-clamp-3 font-medium">
            {job.requirements}
          </p>
        </div>
      </div>

      <a
        href={job.apply_link}
        target="_blank"
        rel="noopener noreferrer"
        className={`apple-button-primary w-full flex items-center justify-center gap-2 text-sm py-3 transition-all font-bold ${vScore >= 8 ? 'shadow-lg shadow-apple-blue/20 group-hover:shadow-apple-blue/30' : 'bg-apple-tertiary-bg text-apple-text-primary hover:bg-apple-tertiary-bg/80 shadow-none'}`}
      >
        <span>{vScore >= 8 ? 'Apply Now' : 'View Details'}</span>
        <ExternalLink size={14} strokeWidth={2.5} />
      </a>
    </article>
  );
};

export default JobCard;

