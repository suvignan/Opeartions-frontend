import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export const Layout = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r-0 flex flex-col py-6 z-50">
        <div className="px-6 mb-10">
          <h1 className="text-xl font-bold tracking-tight text-on-background">Architect</h1>
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Operations Hub</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 font-semibold transition-all group ${isActive ? 'text-primary border-r-4 border-primary bg-white/50' : 'text-on-surface-variant hover:bg-white/80'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/contracts" 
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 font-semibold transition-all group ${isActive ? 'text-primary border-r-4 border-primary bg-white/50' : 'text-on-surface-variant hover:bg-white/80'}`}
          >
            <span className="material-symbols-outlined">description</span>
            <span>Contracts</span>
          </NavLink>

          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/80 transition-colors group text-left">
            <span className="material-symbols-outlined">payments</span>
            <span>Finance</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/80 transition-colors group text-left">
            <span className="material-symbols-outlined">groups</span>
            <span>HR</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/80 transition-colors group text-left">
            <span className="material-symbols-outlined">analytics</span>
            <span>Analytics</span>
          </button>
        </nav>

        <div className="mt-auto px-4 space-y-1">
          <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/80 transition-colors group text-left">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3 mt-4">
            <img alt="User avatar" className="w-8 h-8 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC09R5nB2QAfPt5dr2YlxEmaG2MNdmCzGmcK-0JzO5shABqhdJlAPeot1t9Lx6ELygw-wZoNA_-HArsHzmoP68t02rNafRqnXVbevYNj-9PHX1fg9eiTdeOCWC_Ghcv72tqrr1yNTP-AfySpgQQJWDD7ekWhjRfXMJrQ34DxV989JYMHSnbARrTs4r8HRzDzYm0XTTHrKPTeVRCv-ifYqFKg-Qinoo90rDfpBDZ3MAC2uhH7ma-r4WcikmlVaLk8F6LZOgvD35DT_Dt" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-on-surface">Alex Chen</p>
              <p className="text-xs text-on-surface-variant truncate">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Navigation */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-8 z-40 border-b border-surface-container">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input 
              className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
              placeholder="Search architecture..." 
              type="text" 
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-all"
            title="Toggle Dark Mode"
          >
            <span className="material-symbols-outlined">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-64 pt-20 p-8 min-h-screen w-full flex flex-col">
        <Outlet />
      </main>



    </div>
  );
};
