import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart, Settings, UserCircle, LogOut } from 'lucide-react';

export const Sidebar = () => {
  const getNavLinkClass = ({ isActive }) => {
    return `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out font-medium tracking-tight text-sm ${
      isActive 
        ? "text-indigo-700 bg-white shadow-sm" 
        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50"
    }`;
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 py-8 px-4 z-50 border-r border-slate-200/50">
      <div className="mb-10 px-2">
        <h1 className="text-lg font-bold tracking-tighter text-indigo-700">Editorial Intelligence</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">The Digital Jurist</p>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink to="/dashboard" className={getNavLinkClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/contracts" className={getNavLinkClass}>
          <FileText size={20} />
          <span>Contracts</span>
        </NavLink>
        {/* Placeholders for future extensibility */}
        <NavLink to="/analytics" className={getNavLinkClass}>
          <BarChart size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/settings" className={getNavLinkClass}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="mt-auto space-y-1 border-t border-slate-200 pt-4">
        <button className="flex items-center w-full gap-3 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50 rounded-lg transition-colors">
          <UserCircle size={20} />
          <span className="font-inter text-sm font-medium tracking-tight">Profile</span>
        </button>
        <button className="flex items-center w-full gap-3 px-3 py-2 text-slate-500 hover:text-error hover:bg-error-container/50 rounded-lg transition-colors">
          <LogOut size={20} />
          <span className="font-inter text-sm font-medium tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  );
};
