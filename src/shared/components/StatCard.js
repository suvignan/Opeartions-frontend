import React from 'react';
import { LucideIcon } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, trend, variant = 'default', children }) => {
  const isTertiary = variant === 'warning';
  
  const cardClasses = isTertiary 
    ? "bg-tertiary-fixed p-6 rounded-xl shadow-sm relative overflow-hidden" 
    : "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100/50";

  return (
    <div className={cardClasses}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className={`p-2 rounded-lg ${isTertiary ? 'bg-tertiary-container/10 text-tertiary' : 'bg-indigo-50 text-indigo-600'}`}>
            {Icon && <Icon size={20} />}
          </span>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        <p className={`text-sm font-medium mb-1 ${isTertiary ? 'text-tertiary/70' : 'text-slate-500'}`}>
          {title}
        </p>
        <h3 className={`text-3xl font-bold ${isTertiary ? 'text-tertiary' : 'text-on-surface'}`}>
          {value}
        </h3>
        {children}
      </div>
      {isTertiary && (
        <div className="absolute -right-4 -bottom-4 opacity-5">
           {Icon && <Icon size={120} />}
        </div>
      )}
    </div>
  );
};
