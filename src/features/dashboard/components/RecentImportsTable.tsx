import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ImportBatch } from '@/types/imports.types';
import { getRecentImports } from '@/api/dashboardApi';
import { formatDateTime } from '@/utils/formatters';
import { IFile } from '@/components/ui/Icons';
import { Alert } from '@/components/ui/Alert';

export interface RecentImportsTableProps {
  refreshTrigger?: number;
}

export const RecentImportsTable: React.FC<RecentImportsTableProps> = ({ refreshTrigger }) => {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecentImports(5);
      setBatches(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load recent import batches';
      setError(msg);
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImports();
  }, [fetchImports, refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IMPORTED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed
          </span>
        );
      case 'FAILED':
      case 'VALIDATION_FAILED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Failed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 font-jost">
            Recent Sales Report Ingestions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of Galileo/BSP Excel daily sales reports uploaded by Finance
          </p>
        </div>
        <Link
          to="/sales-reports"
          className="text-xs font-semibold hover:underline"
          style={{ color: '#0F2E22' }}
        >
          View all imports →
        </Link>
      </div>

      {error && (
        <div className="p-4 space-y-2">
          <Alert
            variant="danger"
            title="Failed to load import batches"
            message={error}
          />
          <div className="flex justify-end">
            <button
              onClick={fetchImports}
              className="text-xs font-semibold px-3 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Upload Date & Time</th>
              <th className="px-4 py-3 text-left">File Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Total Rows</th>
              <th className="px-4 py-3 text-right">Imported</th>
              <th className="px-4 py-3 text-right">Duplicates</th>
              <th className="px-4 py-3 text-right">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-3.5"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-36" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                </tr>
              ))
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-xs">
                  No sales reports uploaded yet.
                </td>
              </tr>
            ) : (
              batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                    {formatDateTime(batch.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-medium text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <IFile size={14} />
                      <span className="font-mono">{batch.fileName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {getStatusBadge(batch.status)}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-xs text-slate-700 font-medium">
                    {batch.totalRows}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-xs text-emerald-700 font-semibold">
                    {batch.successfulRows}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-xs text-amber-700">
                    {batch.duplicateRows}
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-xs text-rose-700 font-medium">
                    {batch.failedRows + (batch.unmatchedRows || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {batches.length} most recent report uploads
        </div>
        <Link
          to="/sales-reports"
          className="font-semibold hover:underline"
          style={{ color: '#0F2E22' }}
        >
          View all import batches →
        </Link>
      </div>
    </div>
  );
};
