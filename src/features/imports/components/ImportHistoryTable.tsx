import React from 'react';
import { ImportBatch } from '@/types/imports.types';
import { ImportStatusBadge } from './ImportStatusBadge';
import { formatDate, formatDateTime, formatNumber } from '@/utils/formatters';
import { IEye, IFileText } from '@/components/ui/Icons';

export interface ImportHistoryTableProps {
  batches: ImportBatch[];
  isLoading: boolean;
  onViewBatch: (batch: ImportBatch) => void;
}

export const ImportHistoryTable: React.FC<ImportHistoryTableProps> = ({
  batches,
  isLoading,
  onViewBatch,
}) => {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                File Name
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Report Date
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Uploaded By
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Time
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Total Rows
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Imported
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Duplicates
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Errors
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                <td className="px-4 py-3"><div className="h-5 bg-slate-200 rounded w-16" /></td>
                <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
          <IFileText size={24} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No upload history found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No Galileo/BSP daily sales reports have been uploaded to the system yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              File Name
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Report Date
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Uploaded By
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Time
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
              Total Rows
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
              Imported
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
              Duplicates
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
              Errors
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Status
            </th>
            <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {batches.map((batch) => {
            const errorCount = batch.unmatchedRows + batch.failedRows;
            return (
              <tr
                key={batch.id}
                onClick={() => onViewBatch(batch)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {/* File Name */}
                <td className="px-4 py-3 font-medium text-slate-900 text-xs font-mono whitespace-nowrap">
                  {batch.fileName}
                </td>

                {/* Report Date */}
                <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                  {formatDate(batch.reportDate)}
                </td>

                {/* Uploaded By */}
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {batch.uploadedByUsername || `User #${batch.uploadedById}`}
                </td>

                {/* Upload Time */}
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {formatDateTime(batch.uploadedAt || batch.createdAt)}
                </td>

                {/* Total Rows */}
                <td className="px-4 py-3 text-right tabular-nums text-xs text-slate-700">
                  {formatNumber(batch.totalRows)}
                </td>

                {/* Imported */}
                <td className="px-4 py-3 text-right tabular-nums text-xs text-emerald-600 font-medium">
                  {formatNumber(batch.successfulRows)}
                </td>

                {/* Duplicates */}
                <td
                  className={`px-4 py-3 text-right tabular-nums text-xs ${
                    batch.duplicateRows > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  {batch.duplicateRows}
                </td>

                {/* Errors (Unmatched + Failed) */}
                <td
                  className={`px-4 py-3 text-right tabular-nums text-xs ${
                    errorCount > 0 ? 'text-red-600 font-medium' : 'text-slate-400'
                  }`}
                >
                  {errorCount}
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <ImportStatusBadge status={batch.status} />
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewBatch(batch);
                    }}
                    className="text-xs font-medium text-[#0F2E22] hover:text-[#CBA326] px-2 py-1 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                  >
                    <IEye size={13} />
                    Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
