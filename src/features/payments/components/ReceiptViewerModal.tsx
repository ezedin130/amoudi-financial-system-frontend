import React, { useState, useEffect } from 'react';
import { Payment } from '@/types/payments.types';
import { getReceiptBlob } from '@/api/paymentsApi';
import { IX, IDownload, ISpinner, IAlert } from '@/components/ui/Icons';

export interface ReceiptViewerModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !payment) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getReceiptBlob(payment.id)
      .then((res) => {
        if (!isMounted) return;
        const url = URL.createObjectURL(res.blob);
        setBlobUrl(url);
        setContentType(res.contentType || res.blob.type || 'application/octet-stream');
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Unable to load receipt file from server.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, payment?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !payment) return null;

  const isImage = contentType.startsWith('image/');
  const isPdf = contentType.includes('pdf');

  const handleDownload = () => {
    if (!blobUrl) return;
    const ext = isPdf ? '.pdf' : isImage ? '.jpg' : '';
    const filename = `receipt-${payment.receiptNumber || payment.id}${ext}`;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-viewer-title"
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 id="receipt-viewer-title" className="text-base font-semibold text-slate-900 font-jost">
              Receipt Document
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Payment #{payment.id} · {payment.nonIataName} · Receipt:{' '}
              {payment.receiptNumber || 'None'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {blobUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                title="Download receipt file"
              >
                <IDownload size={14} />
                Download
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              aria-label="Close receipt modal"
            >
              <IX size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-auto flex-1 flex flex-col items-center justify-center min-h-[350px] bg-slate-100/50">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ISpinner size={28} className="text-emerald-800 mb-3" />
              <p className="text-sm font-medium">Fetching authoritative receipt document...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="max-w-md w-full bg-rose-50 border border-rose-200 rounded-lg p-5 text-center">
              <div className="text-rose-500 flex justify-center mb-2">
                <IAlert size={24} />
              </div>
              <h4 className="text-sm font-semibold text-rose-800">
                Receipt Document Unavailable
              </h4>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
            </div>
          )}

          {!isLoading && !error && blobUrl && (
            <>
              {isImage && (
                <div className="max-w-full flex items-center justify-center p-2 bg-white rounded border border-slate-200 shadow-sm">
                  <img
                    src={blobUrl}
                    alt={`Receipt document for payment ${payment.id}`}
                    className="max-h-[65vh] object-contain rounded"
                  />
                </div>
              )}

              {isPdf && (
                <div className="w-full h-[65vh] bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
                  <object
                    data={blobUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="p-8 text-center text-sm text-slate-600">
                      <p className="mb-4">Your browser does not support inline PDF viewing.</p>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
                      >
                        Download PDF to view
                      </button>
                    </div>
                  </object>
                </div>
              )}

              {!isImage && !isPdf && (
                <div className="text-center p-8 bg-white rounded border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-700 mb-4">
                    Receipt document available ({contentType})
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
                  >
                    <IDownload size={16} />
                    Download File
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
