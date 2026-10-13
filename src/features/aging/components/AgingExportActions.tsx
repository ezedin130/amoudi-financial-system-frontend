import React, { useState } from 'react';
import { AgingFilterParams } from '@/types/aging.types';
import { exportAgingExcel, exportAgingPdf } from '@/api/agingApi';
import { downloadBlob } from '@/utils/download';
import { IDownload, ISpinner } from '@/components/ui/Icons';

export interface AgingExportActionsProps {
  filters: AgingFilterParams;
  disabled?: boolean;
}

export const AgingExportActions: React.FC<AgingExportActionsProps> = ({
  filters,
  disabled = false,
}) => {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    setError(null);
    try {
      const res = await exportAgingExcel(filters);
      const filename =
        res.filename || `aging_report_${filters.asOfDate || new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(res.blob, filename);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export aging Excel.';
      setError(msg);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setError(null);
    try {
      const res = await exportAgingPdf(filters);
      const filename =
        res.filename || `aging_report_${filters.asOfDate || new Date().toISOString().split('T')[0]}.pdf`;
      downloadBlob(res.blob, filename);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export aging PDF.';
      setError(msg);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={disabled || isExportingExcel || isExportingPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="Export A/R aging report as Excel spreadsheet"
        >
          {isExportingExcel ? <ISpinner size={13} /> : <IDownload size={13} />}
          {isExportingExcel ? 'Exporting...' : 'Export Excel'}
        </button>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={disabled || isExportingExcel || isExportingPdf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="Export A/R aging report as PDF document"
        >
          {isExportingPdf ? <ISpinner size={13} /> : <IDownload size={13} />}
          {isExportingPdf ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {error && <span className="text-[11px] text-rose-600">{error}</span>}
    </div>
  );
};
