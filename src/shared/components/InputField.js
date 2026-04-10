import React from 'react';

export const InputField = ({ label, id, error, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2 bg-surface-container-low rounded-lg border ${error ? 'border-error ring-1 ring-error' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500/20 text-sm placeholder:text-slate-400 transition-all outline-none`}
        {...props}
      />
      {error && (
        <span className="text-xs text-error mt-1">{error}</span>
      )}
    </div>
  );
};
