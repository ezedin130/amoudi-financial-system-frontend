import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold font-josefin text-[#0F2E22] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-2 font-jost">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested page does not exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
