import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface NeoButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  
  const baseStyles = "font-bold border-2 border-neo-black relative transition-all duration-200 flex items-center justify-center gap-2 font-mono uppercase tracking-tight";
  
  const variants = {
    primary: "bg-neo-black text-white hover:-translate-y-1 hover:shadow-neo hover:bg-zinc-800",
    secondary: "bg-white text-neo-black hover:-translate-y-1 hover:shadow-neo",
    accent: "bg-travel-orange text-white hover:-translate-y-1 hover:shadow-neo",
    outline: "bg-transparent text-neo-black hover:bg-neo-black hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95, translateY: 0, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};