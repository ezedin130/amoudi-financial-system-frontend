import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ImportStatusBadge } from './ImportStatusBadge';
import { ImportBatch, ImportBatchError } from '@/types/imports.types';
import { PageResponse } from '@/types/api.types';
import { getBatchErrors } from '@/api/importsApi';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { IAlert, IChevronLeft, IChevronRight } from '@/components/ui/Icons';

export interface ImportBatchDetailModalProps {
  batch: ImportBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImportBatchDetailModal: React.FC<ImportBatchDetailModalProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  const [errorPage, setErrorPage] = useState<PageResponse<ImportBatchError> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (batch && isOpen) {
      setCurrentPage(0);
      loadErrors(batch.id, 0);
    } else {
      setErrorPage(null);
    }
  }, [batch, isOpen]);

  const loadErrors = async (batchId: number, page: number) => {
    setIsLoadingErrors(true);
    setErrorMsg(null);
    try {
      const data = await getBatchErrors(batchId, page, 20);
      setErrorPage(data);
      setCurrentPage(page);
    } catch {
      setErrorMsg('Failed to load row-level error details');
    } finally {
      setIsLoadingErrors(false);
    }
  };

  if (!batch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import Batch #${batch.id} Details`}
      description={`File: ${batch.fileName}`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Batch Overview Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-slate-900">{batch.fileName}</span>
                <ImportStatusBadge status={batch.status} />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Report Date: <span className="text-slate-700 font-medium">{formatDate(batch.reportDate)}</span> ·
                Uploaded by <span className="text-slate-700 font-medium">{batch.uploadedByUsername || `User #${batch.uploadedById}`}</span> on{' '}
                {formatDateTime(batch.uploadedAt || batch.createdAt)}
              </div>
            </div>
          </div>

          {/* Metrics Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
            <div className="p-2.5 bg-white rounded border border-slate-200">
              <span className="text-slate-400 block">Total Rows:</span>
              <span className="text-lg font-bold font-jost text-slate-900 tabular-nums">
                {batch.totalRows}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded border border-emerald-200 bg-emerald-50/20">
              <span className="text-emerald-700 block">Imported:</span>
              <span className="text-lg font-bold font-jost text-emerald-600 tabular-nums">
                {batch.successfulRows}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded border border-amber-200 bg-amber-50/20">
              <span className="text-amber-700 block">Duplicates:</span>
              <span className="text-lg font-bold font-jost text-amber-600 tabular-nums">
                {batch.duplicateRows}
              </span>
            </div>
            <div className="p-2.5 bg-white rounded border border-red-200 bg-red-50/20">
              <span className="text-red-700 block">Unmatched Agencies:</span>
              <span className="text-lg font-bold font-jost text-red-600 tabular-nums">
                {batch.unmatchedRows}
              </span>
            </div>
          </div>

          {batch.errorSummary && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              <span className="font-semibold">Error Summary:</span> {batch.errorSummary}
            </div>
          )}
        </div>

        {/* Row Errors Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <IAlert size={14} className="text-amber-500" />
              Row-Level Ingestion Rejections &amp; Unmatched Agencies
            </h4>
            {errorPage && (
              <span className="text-xs text-slate-400">
                {errorPage.totalElements} {errorPage.totalElements === 1 ? 'issue' : 'issues'} recorded
              </span>
            )}
          </div>

          {errorMsg && <Alert variant="danger" message={errorMsg} />}

          {isLoadingErrors ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Loading error items from server...
            </div>
          ) : !errorPage || errorPage.content.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              No row rejection errors recorded for this batch. All rows were either imported or handled cleanly.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Row #</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Ticket Number</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Source Agency Text</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Classification</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {errorPage.content.map((err) => (
                      <tr key={err.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-500">{err.rowNumber}</td>
                        <td className="px-3 py-2 font-mono font-medium text-slate-800">
                          {err.ticketNumber || '—'}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-700 bg-slate-50/50">
                          {err.sourceAgencyName || '—'}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded font-mono text-[10px] font-medium border ${
                              err.errorType === 'UNMATCHED_AGENCY'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : err.errorType === 'DUPLICATE_TRANSACTION'
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            {err.errorType}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Error Pagination */}
              {errorPage.totalPages > 1 && (
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Page {currentPage + 1} of {errorPage.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={errorPage.isFirst}
                      onClick={() => loadErrors(batch.id, currentPage - 1)}
                      className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
                    >
                      <IChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={errorPage.isLast}
                      onClick={() => loadErrors(batch.id, currentPage + 1)}
                      className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
                    >
                      <IChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
