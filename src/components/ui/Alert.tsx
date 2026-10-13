import React from 'react';
import { IAlert, ICheck, IX } from './Icons';

export interface AlertProps {
  variant?: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
  message: string;
  details?: string[];
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'danger',
  title,
  message,
  details,
  onDismiss,
  className = '',
}) => {
  const variantStyles = {
    danger: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <IAlert className="text-red-500 shrink-0" size={18} />,
      titleColor: 'text-red-900',
      detailColor: 'text-red-700',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <ICheck className="text-emerald-500 shrink-0" size={18} />,
      titleColor: 'text-emerald-900',
      detailColor: 'text-emerald-700',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <IAlert className="text-amber-500 shrink-0" size={18} />,
      titleColor: 'text-amber-900',
      detailColor: 'text-amber-700',
    },
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-800',
      icon: <IAlert className="text-sky-500 shrink-0" size={18} />,
      titleColor: 'text-sky-900',
      detailColor: 'text-sky-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-lg border text-sm ${style.container} ${className}`}
    >
      <div className="pt-0.5">{style.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className={`font-semibold mb-0.5 ${style.titleColor}`}>{title}</h4>}
        <p className="leading-relaxed">{message}</p>
        {details && details.length > 0 && (
          <ul className={`list-disc list-inside mt-2 space-y-0.5 text-xs ${style.detailColor}`}>
            {details.map((detail, idx) => (
              <li key={idx}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded transition-colors"
        >
          <IX size={16} />
        </button>
      )}
    </div>
  );
};
