import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const IGrid: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
  </svg>
);

export const IUsers: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

export const IFile: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const ICard: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export const IChart: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const ILogout: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const ISearch: React.FC<IconProps> = ({ size = 16, className = 'text-slate-400', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const ICheck: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IAlert: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const ISpinner: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const IPlus: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IArrowLeft: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const IEdit: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const IX: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IChevronLeft: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const IChevronRight: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IEye: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IBuilding: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l8-4v18M13 7l6 3v11" />
    <line x1="9" y1="9" x2="9" y2="9.01" />
    <line x1="9" y1="13" x2="9" y2="13.01" />
    <line x1="9" y1="17" x2="9" y2="17.01" />
  </svg>
);

export const IPhone: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

export const IMail: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const IFileText: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const ILock: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

export const IUpload: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const IFilter: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const IDownload: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const IPlane: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export const IBan: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);



