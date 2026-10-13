import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ILock, IBuilding, IPlane, IFileText } from '@/components/ui/Icons';
import { getSaleById } from '@/api/salesApi';
import { SalesTransaction } from '@/types/sales.types';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';

export interface SalesDetailModalProps {
  saleId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SalesDetailModal: React.FC<SalesDetailModalProps> = ({ saleId, isOpen, onClose }) => {
  const [sale, setSale] = useState<SalesTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (saleId && isOpen) {
      setIsLoading(true);
      setError(null);
      getSaleById(saleId)
        .then((data) => setSale(data))
        .catch((err) => setError(err.message || 'Failed to load transaction details'))
        .finally(() => setIsLoading(false));
    } else {
      setSale(null);
    }
  }, [saleId, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sales Transaction Details"
      description={sale ? `Ticket #${sale.ticketNumber}` : 'Historical Galileo/BSP record'}
      maxWidth="lg"
    >
      {isLoading ? (
        <div className="space-y-4 animate-pulse py-4">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-20 bg-slate-100 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-100 rounded" />
            <div className="h-24 bg-slate-100 rounded" />
          </div>
        </div>
      ) : error ? (
        <Alert variant="danger" title="Error" message={error} />
      ) : sale ? (
        <div className="space-y-5">
          {/* Hero Amount Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                Authoritative Ticket Amount
              </div>
              <div className="text-2xl font-bold font-jost text-slate-900 tabular-nums mt-0.5">
                {formatCurrency(sale.grandTotal ?? sale.effectiveGrandTotal ?? sale.amount, sale.currency || 'ETB')}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Sale Date: <span className="text-slate-700 font-medium">{formatDate(sale.saleDate)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                Authoritative G.TOT
              </span>
            </div>
          </div>

          {/* Galileo / BSP Financial Breakdown */}
          <div className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Galileo / BSP Financial Breakdown
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Source Document Verification</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Base Fare</span>
                <span className="font-semibold text-slate-800 text-sm tabular-nums">
                  {sale.baseFare != null ? formatCurrency(sale.baseFare, '') : '—'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Tax</span>
                <span className="font-semibold text-slate-800 text-sm tabular-nums">
                  {sale.tax != null ? formatCurrency(sale.tax, '') : '—'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Total (Base+Tax)</span>
                <span className="font-semibold text-slate-800 text-sm tabular-nums">
                  {sale.totalSale != null ? formatCurrency(sale.totalSale, '') : '—'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Service Charge</span>
                <span className="font-semibold text-slate-800 text-sm tabular-nums">
                  {sale.serviceCharge != null ? formatCurrency(sale.serviceCharge, '') : '—'}
                </span>
              </div>
              <div className="p-2.5 bg-amber-50/70 rounded border border-amber-300">
                <span className="text-amber-800 block text-[11px] font-semibold">Grand Total (G.TOT)</span>
                <span className="font-bold text-slate-900 text-sm tabular-nums">
                  {formatCurrency(sale.grandTotal ?? sale.effectiveGrandTotal ?? sale.amount, '')}
                </span>
                <span className="block text-[9px] text-amber-700 font-medium uppercase mt-0.5">Authoritative</span>
              </div>
            </div>
          </div>

          {/* Agency & Mapping Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <IBuilding size={14} className="text-slate-400" />
                Assigned Non-IATA Agency
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {sale.nonIataName || 'Unassigned'}
              </div>
              {sale.nonIataCode && (
                <div className="text-xs font-mono text-slate-500">
                  Code: <span className="font-semibold text-slate-700">{sale.nonIataCode}</span>
                </div>
              )}
              {sale.nonIataId && (
                <div className="text-xs text-slate-400">
                  Account ID: {sale.nonIataId}
                </div>
              )}
            </div>

            <div className="p-4 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <IFileText size={14} className="text-slate-400" />
                Raw Source Extraction
              </div>
              <div>
                <div className="text-xs text-slate-500">Form of Payment Free Text:</div>
                <div className="text-sm font-mono font-medium text-slate-800">
                  {sale.sourceAgencyName || '—'}
                </div>
              </div>
              {sale.sourceRowNumber && (
                <div className="text-xs text-slate-400">
                  Excel Source Row: #{sale.sourceRowNumber}
                </div>
              )}
            </div>
          </div>

          {/* Passenger & Flight Details */}
          <div className="p-4 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <IPlane size={14} className="text-slate-400" />
              Flight & Passenger Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Passenger:</span>
                <span className="font-medium text-slate-800 text-sm">
                  {sale.passengerName || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Route:</span>
                <span className="font-mono font-medium text-slate-800 text-sm">
                  {sale.route || (sale.origin && sale.destination ? `${sale.origin} → ${sale.destination}` : '—')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Transaction Reference:</span>
                <span className="font-mono text-slate-700">
                  {sale.transactionReference || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit & Immutability Notice */}
          <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg flex items-start gap-2 text-xs text-amber-800">
            <ILock size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Immutable Historical Record:</span> This sales transaction was
              ingested via Import Batch #{sale.importBatchId || '—'} on{' '}
              {formatDateTime(sale.createdAt)}. In accordance with Amoudi Financial System invariants, imported
              transactions cannot be modified or deleted.
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
