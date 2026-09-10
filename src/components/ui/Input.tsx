import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label ? (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#726C5C]">
            {label}
          </label>
        ) : null}
        
        <div className="relative flex items-center">
          {leftIcon ? (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#726C5C]">
              {leftIcon}
            </div>
          ) : null}
          
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-[#FBF8F2] border border-[#E4DAC4] rounded-xl px-3.5 py-2.5 text-sm text-[#2E2C24] placeholder-[#9B9484] transition-colors duration-150 focus:outline-none focus:border-[#6B7A3D] focus:ring-1 focus:ring-[#6B7A3D]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-[#B4553C] focus:border-[#B4553C] focus:ring-[#B4553C]",
              className
            )}
            {...props}
          />

          {rightIcon ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#726C5C]">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs text-[#B4553C] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#726C5C]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
