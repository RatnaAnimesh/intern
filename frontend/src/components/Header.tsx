import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, GraduationCap, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, theme, onToggleTheme }) => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 apple-glass px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center shadow-lg shadow-apple-blue/20">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-apple-text-heading tracking-tighter">
              FirstYear<span className="text-apple-blue">Interns</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-apple-text-body font-bold">
              BITS Pilani Excellence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Theme Toggle Slider/Button */}
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group relative"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-apple-text-heading" />
            ) : (
              <Sun size={20} className="text-apple-text-heading" />
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-wider font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-apple-text-heading">{userEmail?.split('@')[0]}</span>
            <span className="text-[10px] text-apple-text-body font-medium">Guest BITSian</span>
          </div>
          
          <button className="apple-button !px-4 !py-2 flex items-center gap-2 text-xs">
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
