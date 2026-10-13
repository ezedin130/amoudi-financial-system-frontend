import React from 'react';
import { NonIataStatus } from '@/types/nonIata.types';

interface NonIataStatusBadgeProps {
  status: NonIataStatus;
  className?: string;
}

export const NonIataStatusBadge: React.FC<NonIataStatusBadgeProps> = ({ status, className = '' }) => {
  const isAct = status === 'ACTIVE';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        isAct
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isAct ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </span>
  );
};
