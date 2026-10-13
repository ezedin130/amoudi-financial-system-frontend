import React from 'react';
import { PaymentStatus } from '@/types/payments.types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'POSTED':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 ${className}`}
        >
          Posted
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-rose-50 text-rose-700 border-rose-200 ${className}`}
        >
          Cancelled
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200 ${className}`}
        >
          {status}
        </span>
      );
  }
};
