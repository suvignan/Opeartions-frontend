import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, isProcessing = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing ? onClose : undefined}
      ></div>

      {/* Dialog Body */}
      <div className="relative bg-surface-container-lowest w-full max-w-sm rounded-2xl shadow-xl p-6 m-4 transform transition-all text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-container/50 mb-4">
          <AlertTriangle className="h-6 w-6 text-error" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="w-full justify-center">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isProcessing} className="w-full justify-center">
            {isProcessing ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};
