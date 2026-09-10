import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7A3D]/40";
    
    const variants = {
      primary: "bg-[#6B7A3D] text-white hover:bg-[#54602F] shadow-sm",
      secondary: "bg-[#EBF0DE] text-[#54602F] hover:bg-[#DDE6C9]",
      outline: "border border-[#E4DAC4] bg-[#FBF8F2] text-[#2E2C24] hover:bg-[#F6F1E7] hover:border-[#D3C7AF]",
      ghost: "text-[#726C5C] hover:text-[#2E2C24] hover:bg-[#E4DAC4]/30",
      whatsapp: "bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-sm font-semibold",
      danger: "bg-[#B4553C] text-white hover:bg-[#9c4731]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2.5 h-10 gap-2",
      lg: "text-base px-5 py-3.5 h-12 gap-2.5 w-full sm:w-auto",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
