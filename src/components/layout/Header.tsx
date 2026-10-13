import React from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Badge } from '@/components/ui/Badge';

interface HeaderProps {
  onToggleMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Amoudi Financial System
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={user?.role === 'FINANCE' ? 'primary' : 'warning'}>
          {user?.role === 'FINANCE' ? 'Finance' : 'General Manager'}
        </Badge>
        <span className="text-xs font-medium text-slate-600 hidden sm:inline-block">
          {user?.fullName || user?.username}
        </span>
      </div>
    </header>
  );
};
