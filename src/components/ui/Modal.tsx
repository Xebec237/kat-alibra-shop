'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#2E2C24]/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full max-w-lg bg-[#FBF8F2] border border-[#E4DAC4] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E4DAC4]/60 mb-4">
          <div>
            {title ? (
              <h3 className="text-lg font-bold text-[#2E2C24] font-display">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="text-xs text-[#726C5C] mt-0.5">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#726C5C] hover:text-[#2E2C24] hover:bg-[#E4DAC4]/30 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
