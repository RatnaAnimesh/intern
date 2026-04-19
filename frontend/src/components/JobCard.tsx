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
  score?: number;
}

const JobCard: React.FC<JobCardProps> = (job) => {
  const isPriority = job.is_first_year === 'Priority: 1st Year';

  return (
    <article className="apple-card p-6 flex flex-col h-full hover:bg-white/[0.6] dark:hover:bg-white/[0.04] transition-all group active:scale-[0.99] cursor-default">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-apple-tertiary-bg dark:bg-apple-tertiary-bg flex items-center justify-center flex-shrink-0">
             <Building2 size={20} className="text-apple-text-secondary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-apple-blue font-bold text-[10px] uppercase tracking-widest">
              {job.company}
            </p>
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

      <div className="grid grid-cols-1 gap-2.5 mb-6">
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
        className="apple-button-primary w-full flex items-center justify-center gap-2 text-sm py-3 shadow-lg shadow-apple-blue/20 group-hover:shadow-apple-blue/30 transition-all font-bold"
      >
        <span>Apply Now</span>
        <ExternalLink size={14} strokeWidth={2.5} />
      </a>
    </article>
  );
};

export default JobCard;

