import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Clock, ExternalLink, Sparkles } from 'lucide-react';

interface JobCardProps {
  company: string;
  title: string;
  location: string;
  stipend: string;
  duration: string;
  requirements: string;
  apply_link: string;
  is_first_year?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  company,
  title,
  location,
  stipend,
  duration,
  requirements,
  apply_link,
  is_first_year
}) => {
  const isPriority = is_first_year === 'Priority: 1st Year';

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`apple-card p-6 flex flex-col h-full group ${isPriority ? 'ring-2 ring-apple-blue/20 bg-apple-blue/[0.02]' : ''}`}
    >
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-apple-blue/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Exclusive
          </span>
          {isPriority && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-apple-blue bg-apple-blue/10 px-2 py-0.5 rounded-full">
              <Sparkles size={10} />
              Top Batch Choice
            </span>
          )}
        </div>
        <div className="text-sm font-bold text-apple-blue uppercase tracking-tight">
          {company}
        </div>
        <h3 className="text-xl font-extrabold text-apple-text-heading leading-tight tracking-tighter">
          {title}
        </h3>
      </div>
      
      <div className="flex-grow space-y-3 mb-8">
        <div className="flex items-center gap-2.5 text-apple-text-body text-sm font-medium">
          <MapPin size={16} className="text-gray-400 group-hover:text-apple-blue transition-colors" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2.5 text-apple-text-body text-sm font-medium">
          <CreditCard size={16} className="text-gray-400 group-hover:text-apple-blue transition-colors" />
          <span className="text-apple-text-heading font-semibold">{stipend}</span>
        </div>
        <div className="flex items-center gap-2.5 text-apple-text-body text-sm font-medium">
          <Clock size={16} className="text-gray-400 group-hover:text-apple-blue transition-colors" />
          <span>{duration}</span>
        </div>
        
        <div className="pt-4 flex flex-wrap gap-2">
          <p className="text-xs text-apple-text-body/80 line-clamp-2 leading-relaxed italic">
             "{requirements}"
          </p>
          <div className="w-full flex gap-2 mt-2">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              isPriority 
                ? 'bg-apple-blue text-white border-apple-blue' 
                : 'bg-green-500/10 text-green-500 border-green-500/20'
            }`}>
              {is_first_year || 'Verified Entry Level'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5">
        <a 
          href={apply_link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="apple-button w-full flex items-center justify-center gap-2 text-sm no-underline"
        >
          View & Apply
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  );
};

export default JobCard;
