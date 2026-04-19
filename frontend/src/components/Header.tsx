import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isScrolled?: boolean;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, isScrolled }) => {
  return (
    <nav className={`apple-navbar ${isScrolled ? 'h-14 border-b' : 'h-16 border-transparent'} flex items-center transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <div className={`flex items-center gap-3 transition-all duration-500 ${isScrolled ? 'translate-x-0 opacity-100' : 'translate-x-[-10px] opacity-0'}`}>
          <div className="w-8 h-8 rounded-lg bg-apple-blue flex items-center justify-center shadow-lg shadow-apple-blue/20">
            <Monitor size={18} className="text-white" />
          </div>
          <span className="font-bold tracking-tight text-apple-text-primary text-sm uppercase tracking-widest">Internships</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-6 w-[1px] bg-black/5 dark:bg-white/10 hidden md:block" />
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all text-apple-text-secondary active:scale-90"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;

