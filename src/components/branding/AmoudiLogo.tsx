import React from 'react';
import { AmoudiMark } from './AmoudiMark';

interface AmoudiLogoProps {
  onDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const AmoudiLogo: React.FC<AmoudiLogoProps> = ({
  onDark = false,
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const markSizes = {
    sm: 28,
    md: 36,
    lg: 56,
  };

  const titleSizes = {
    sm: 'text-xs tracking-wider',
    md: 'text-sm tracking-widest',
    lg: 'text-2xl tracking-widest',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AmoudiMark size={markSizes[size]} onDark={onDark} />
      <div>
        <div
          className={`font-josefin font-bold leading-none ${titleSizes[size]}`}
          style={{ color: onDark ? '#FFFFFF' : '#0F2E22' }}
        >
          AMOUDI
        </div>
        <div
          className={`font-medium mt-1 leading-none ${subtitleSizes[size]}`}
          style={{ color: '#CBA326' }}
        >
          Finance Management
        </div>
        {showTagline && (
          <div
            className="text-xs font-medium mt-1 leading-tight"
            style={{ color: '#CBA326' }}
          >
            Travel made for every one!
          </div>
        )}
      </div>
    </div>
  );
};
