import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusStyles = (statusId) => {
    switch (statusId.toLowerCase()) {
      case 'active':
        return "bg-emerald-50 text-emerald-600";
      case 'review':
        return "bg-indigo-50 text-indigo-600";
      case 'draft':
        return "bg-slate-100 text-slate-600";
      case 'expired':
      case 'urgent':
        return "bg-tertiary-fixed text-tertiary";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getStatusStyles(status)}`}>
      {status}
    </span>
  );
};
