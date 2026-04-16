import React from 'react';
import { Search, Bell } from 'lucide-react';

export const Header = () => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm shadow-indigo-900/5">
      <div className="flex items-center justify-between px-8 w-full h-full">
        
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg border-none focus:ring-2 focus:ring-indigo-500/20 text-sm placeholder:text-slate-400 transition-all outline-none" 
              placeholder="Search contracts, parties, or clauses..." 
              type="text" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
            <Bell size={20} />
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-indigo-100 bg-slate-200">
            <img 
              alt="User Avatar" 
              className="h-full w-full object-cover" 
              src="https://ui-avatars.com/api/?name=Jurist&background=eef0ff&color=3525cd" 
            />
          </div>
        </div>

      </div>
    </header>
  );
};
