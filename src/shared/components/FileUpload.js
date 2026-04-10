import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export const FileUpload = ({ label, onFileSelect, accept = ".pdf,.docx,.doc" }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDisplaySelection = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Pass the File object up to the parent form for future multipart/form-data sending
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <div 
        onClick={handleClick}
        className="w-full border-2 border-dashed border-indigo-200 bg-surface-container-low hover:bg-slate-50 transition-colors p-8 rounded-xl flex flex-col items-center justify-center cursor-pointer group"
      >
        <UploadCloud className="text-indigo-400 group-hover:text-indigo-600 transition-colors mb-3" size={32} />
        <p className="text-sm text-slate-600 font-medium mb-1">Click to upload document</p>
        <p className="text-xs text-slate-400">Standard formats ({accept})</p>
        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          accept={accept} 
          onChange={handleDisplaySelection} 
        />
      </div>
    </div>
  );
};
