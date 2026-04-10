import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-indigo-200 hover:shadow-lg",
    secondary: "bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50",
    danger: "bg-error text-white border border-error hover:bg-red-700",
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
