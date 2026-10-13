import React from 'react';
import { Card } from '@/components/ui/Card';
import { ImportBatch } from '@/types/imports.types';
import { ImportStatusBadge } from './ImportStatusBadge';
import { ICheck, IAlert, IX, IEye } from '@/components/ui/Icons';
import { formatDateTime } from '@/utils/formatters';

export interface ImportResultCardProps {
  batch: ImportBatch;
  onDismiss: () => void;
  onViewErrors?: (batchId: number) => void;
}

export const ImportResultCard: React.FC<ImportResultCardProps> = ({
  batch,
  onDismiss,
  onViewErrors,
}) => {
  const isSuccess = batch.status === 'IMPORTED';
  const hasIssues = batch.unmatchedRows > 0 || batch.failedRows > 0 || batch.status === 'FAILED';

  return (
    <Card className="mb-6 border-slate-300 shadow-md overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner */}
      <div
        className={`px-5 py-4 border-b flex items-start justify-between ${
          isSuccess
            ? 'bg-emerald-50/60 border-emerald-200'
            : hasIssues
            ? 'bg-amber-50/60 border-amber-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full mt-0.5 ${
              isSuccess
                ? 'bg-emerald-100 text-emerald-700'
                : hasIssues
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isSuccess ? <ICheck size={20} /> : <IAlert size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-slate-900 font-jost">
                Import Batch #{batch.id} Results
              </h3>
              <ImportStatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-slate-600 mt-1 font-mono">
              File: <span className="font-semibold text-slate-800">{batch.fileName}</span> · Ingested at{' '}
              {formatDateTime(batch.uploadedAt || batch.createdAt)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded"
          aria-label="Dismiss result"
        >
          <IX size={18} />
        </button>
      </div>

      {/* 4 Metric Cards matching Figma */}
      <div className="p-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Successfully Imported */}
          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/30">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Imported Sales
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-jost tabular-nums mt-1">
              {batch.successfulRows}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Valid tickets saved to DB</div>
          </div>

          {/* Duplicates */}
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/30">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Duplicate Tickets
            </div>
            <div className="text-2xl font-bold text-amber-600 font-jost tabular-nums mt-1">
              {batch.duplicateRows}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Already existing; skipped</div>
          </div>

          {/* Unmatched Non-IATAs */}
          <div
            className={`p-4 rounded-lg border ${
              batch.unmatchedRows > 0
                ? 'border-red-200 bg-red-50/30'
                : 'border-slate-200 bg-slate-50/30'
            }`}
          >
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Unmatched Agencies
            </div>
            <div
              className={`text-2xl font-bold font-jost tabular-nums mt-1 ${
                batch.unmatchedRows > 0 ? 'text-red-600' : 'text-slate-400'
              }`}
            >
              {batch.unmatchedRows}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {batch.unmatchedRows > 0 ? 'Missing name mapping' : 'All agencies mapped'}
            </div>
          </div>

          {/* Total Rows / Failed */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/30">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Rows Processed
            </div>
            <div className="text-2xl font-bold text-slate-900 font-jost tabular-nums mt-1">
              {batch.totalRows}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {batch.failedRows > 0 ? `${batch.failedRows} failed rows` : 'Sheet2 authoritative rows'}
            </div>
          </div>
        </div>

        {/* Action / Error Details link */}
        {(batch.unmatchedRows > 0 || batch.failedRows > 0 || batch.duplicateRows > 0) && onViewErrors && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              {batch.errorSummary ? (
                <span className="text-red-700 font-medium">{batch.errorSummary}</span>
              ) : batch.unmatchedRows > 0 ? (
                <span>
                  Some tickets could not be assigned to a Non-IATA account because their source agency names
                  are not yet mapped in the system.
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onViewErrors(batch.id)}
              className="text-xs font-semibold text-[#0F2E22] hover:text-[#CBA326] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors shrink-0"
            >
              <IEye size={14} />
              Inspect Batch Errors
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
