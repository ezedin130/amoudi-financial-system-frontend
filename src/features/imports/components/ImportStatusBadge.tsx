import React from 'react';
import { ImportStatus } from '@/types/imports.types';

interface ImportStatusBadgeProps {
  status: ImportStatus;
  className?: string;
}

export const ImportStatusBadge: React.FC<ImportStatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'IMPORTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIALLY_IMPORTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FAILED':
      case 'VALIDATION_FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PROCESSING':
      case 'UPLOADED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'READY':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'IMPORTED':
        return 'Imported';
      case 'PARTIALLY_IMPORTED':
        return 'Partially Imported';
      case 'VALIDATION_FAILED':
        return 'Validation Failed';
      case 'FAILED':
        return 'Failed';
      case 'PROCESSING':
        return 'Processing';
      case 'UPLOADED':
        return 'Uploaded';
      case 'READY':
        return 'Ready';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
