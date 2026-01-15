import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  noShadow?: boolean;
  hoverEffect?: boolean;
}

export const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  className = '', 
  noShadow = false,
  hoverEffect = false
}) => {
  return (
    <div className={`
      bg-white border-2 border-neo-black
      ${!noShadow ? 'shadow-neo' : ''}
      ${hoverEffect ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-neo-lg' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};