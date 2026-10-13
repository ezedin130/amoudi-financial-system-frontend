import React from 'react';
import amoudiLogoSrc from '@/assets/brand/amoudi-logo.jpeg';

export interface AmoudiMarkProps {
  size?: number;
  onDark?: boolean;
  className?: string;
  alt?: string;
}

/**
 * Official Amoudi brand logo mark component.
 * Uses the authentic brand asset provided in src/assets/brand/amoudi-logo.jpeg.
 * Preserves original proportions and displays cleanly across both light and dark surfaces.
 */
export const AmoudiMark: React.FC<AmoudiMarkProps> = ({
  size = 36,
  onDark = false,
  className = '',
  alt = 'Amoudi Brand Mark',
}) => {
  if (onDark) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md bg-[#F7F7F7] p-0.5 shadow-xs shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={amoudiLogoSrc}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  return (
    <img
      src={amoudiLogoSrc}
      alt={alt}
      role="img"
      aria-label={alt}
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

