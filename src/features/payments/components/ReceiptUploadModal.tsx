import React, { useState, useRef } from 'react';
import { Payment } from '@/types/payments.types';
import { uploadReceipt } from '@/api/paymentsApi';
import { IX, IUpload, IFileText, ISpinner, IAlert } from '@/components/ui/Icons';

export interface ReceiptUploadModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onReceiptUploaded: (updatedPayment: Payment) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  payment,
  isOpen,
  onClose,
  onReceiptUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !payment) return null;

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format (${ext}). Only PDF, JPG, and PNG files are accepted.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of 10 MB.`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const err = validateFile(file);
      if (err) {
        setError(err);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const err = validateFile(file);
      if (err) {
        setError(err);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const updated = await uploadReceipt(payment.id, selectedFile);
      onReceiptUploaded(updated);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload receipt.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUploading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isUploading, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4"
      onClick={() => !isUploading && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-upload-title"
        className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 id="receipt-upload-title" className="text-base font-semibold text-slate-900 font-jost">
              {payment.hasReceipt ? 'Replace Receipt Document' : 'Attach Receipt Document'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Payment #{payment.id} · {payment.nonIataName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
            aria-label="Close modal"
          >
            <IX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {payment.hasReceipt && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              <strong>Notice:</strong> This payment already has an attached receipt. Uploading a
              new file will replace the document while preserving the original financial record and
              audit history.
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            tabIndex={0}
            role="button"
            aria-label="Select receipt file to upload"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-700 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-800 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <IUpload size={22} />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-800 font-jost">
                  <IFileText size={16} />
                  {selectedFile.name}
                </div>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click or drag to change
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  Click to select or drag and drop receipt file
                </p>
                <p className="text-xs text-slate-400">
                  Accepted formats: PDF, JPG, PNG (Max 10 MB)
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-start gap-2">
              <div className="text-rose-500 mt-0.5 flex-shrink-0">
                <IAlert size={14} />
              </div>
              <div>{error}</div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isUploading && <ISpinner size={14} />}
            {isUploading ? 'Uploading...' : 'Save Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
