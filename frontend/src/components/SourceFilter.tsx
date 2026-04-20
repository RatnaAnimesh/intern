import React from 'react';
import { motion } from 'framer-motion';

interface SourceFilterProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

const sources = [
  { id: 'all', label: 'All Roles' },
  { id: 'Structured Program', label: 'Structured Programs' },
  { id: 'Research Program', label: 'Research (IITs/IISc)' },
  { id: 'Open Source', label: 'Open Source' },
  { id: 'Internshala', label: 'Startups' },
];

const SourceFilter: React.FC<SourceFilterProps> = ({ selectedSource, onSourceChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-8 bg-black/[0.03] dark:bg-white/[0.03] p-1.5 rounded-2xl border border-black/[0.05] dark:border-white/[0.05] w-fit">
      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() => onSourceChange(source.id)}
          className={`relative px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
            selectedSource === source.id
              ? 'text-apple-blue'
              : 'text-apple-text-secondary hover:text-apple-text-primary'
          }`}
        >
          {selectedSource === source.id && (
            <motion.div
              layoutId="active-source"
              className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-black/[0.05] dark:border-white/[0.1] z-0"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 tracking-wide">{source.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SourceFilter;
