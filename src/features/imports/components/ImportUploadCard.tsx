import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { IUpload, IX, IFileText, ILock } from '@/components/ui/Icons';
import { useAuth } from '@/auth/AuthContext';
import { uploadReport } from '@/api/importsApi';
import { ImportBatch } from '@/types/imports.types';
import { ApiError } from '@/types/api.types';

export interface ImportUploadCardProps {
  onImportSuccess: (batch: ImportBatch) => void;
}

export const ImportUploadCard: React.FC<ImportUploadCardProps> = ({ onImportSuccess }) => {
  const { user } = useAuth();
  const isFinance = user?.role === 'FINANCE';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidExt) {
      return 'Invalid file type. Please select a Galileo/BSP Excel workbook (.xlsx or .xls).';
    }

    const maxSize = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSize) {
      return 'File size exceeds 25 MB limit.';
    }

    if (file.size === 0) {
      return 'The selected file is empty.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isFinance) return;

    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an Excel file to upload.');
      return;
    }

    if (!isFinance) {
      setError('Only Finance personnel have permission to upload sales reports.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadReport(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImportSuccess(result);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setError('Authorization Denied: Only users with FINANCE role can upload daily sales reports.');
        } else {
          setError(err.message || 'Excel ingestion failed on the server.');
        }
      } else {
        setError('Network error or server unavailable during file upload.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // If General Manager, render restricted banner
  if (!isFinance) {
    return (
      <Card className="p-6 mb-6 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="p-2 rounded-full bg-slate-200 text-slate-500">
            <ILock size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Daily Report Ingestion Restricted</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only authorized Finance team members can upload Galileo/BSP Excel sales reports.
              You have read-only access to view sales transactions and import history.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="p-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900 font-jost">Ingest Daily Sales Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload the daily Galileo/BSP Excel report (.xlsx / .xls). Authoritative tickets from Sheet2
            will be ingested with G.TOT financial amounts and Non-IATA mappings.
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="danger" message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
          id="sales-file-input"
          disabled={isUploading}
        />

        {/* Drag and Drop Zone matching Figma */}
        {!selectedFile ? (
          <div
            tabIndex={0}
            role="button"
            aria-label="Select Excel file to upload"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg px-8 py-10 text-center transition-colors cursor-pointer select-none"
            style={{
              borderColor: isDragging ? '#0F2E22' : '#cbd5e1',
              backgroundColor: isDragging ? 'rgba(15, 46, 34, 0.04)' : '#fafafa',
            }}
          >
            <div className="flex justify-center mb-3 text-slate-400">
              <IUpload size={36} />
            </div>
            <p className="text-sm font-medium text-slate-700">Drag &amp; drop Excel file here</p>
            <p className="text-xs text-slate-400 mt-1">or click to browse from your computer</p>
            <p className="text-[11px] text-slate-400 mt-3 font-mono">
              Supported formats: .xlsx / .xls (e.g. SEP- 17.xlsx)
            </p>
          </div>
        ) : (
          /* File Preview Card */
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-[#0F2E22]/10 text-[#0F2E22]">
                  <IFileText size={22} />
                </div>
                <div>
                  <div className="text-sm font-semibold font-mono text-slate-900">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to ingest
                  </div>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                  title="Remove file"
                >
                  <IX size={18} />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={isUploading}
                leftIcon={<IUpload size={14} />}
              >
                {isUploading ? 'Processing Workbook...' : 'Upload & Ingest Report'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
