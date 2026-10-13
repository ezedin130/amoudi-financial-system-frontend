import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { IUpload, IFile, IPlane } from '@/components/ui/Icons';
import { useAuth } from '@/auth/AuthContext';
import { getSales } from '@/api/salesApi';
import { getImportBatches } from '@/api/importsApi';
import { getNonIatas } from '@/api/nonIataApi';
import { SalesTransaction } from '@/types/sales.types';
import { ImportBatch } from '@/types/imports.types';
import { NonIata } from '@/types/nonIata.types';
import { PageResponse, ApiError } from '@/types/api.types';
import { SalesFilters } from '@/features/sales/components/SalesFilters';
import { SalesTable } from '@/features/sales/components/SalesTable';
import { SalesDetailModal } from '@/features/sales/components/SalesDetailModal';
import { NonIataPagination } from '@/features/non-iata/components/NonIataPagination';
import { ImportUploadCard } from '@/features/imports/components/ImportUploadCard';
import { ImportResultCard } from '@/features/imports/components/ImportResultCard';
import { ImportHistoryTable } from '@/features/imports/components/ImportHistoryTable';
import { ImportBatchDetailModal } from '@/features/imports/components/ImportBatchDetailModal';

export const SalesReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isFinance = user?.role === 'FINANCE';

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'import' ? 'import' : 'sales';
  const [, startTransition] = useTransition();

  // Non-IATA Agencies for filtering dropdown
  const [agencies, setAgencies] = useState<NonIata[]>([]);

  // ─── SALES TRANSACTIONS STATE ──────────────────────────────────────
  const [salesPage, setSalesPage] = useState<PageResponse<SalesTransaction>>({
    content: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Sales filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNonIataId, setSelectedNonIataId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesPageNumber, setSalesPageNumber] = useState(0);
  const [salesPageSize, setSalesPageSize] = useState(20);

  // Sales detail modal state
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // ─── IMPORT BATCHES STATE ─────────────────────────────────────────
  const [batchesPage, setBatchesPage] = useState<PageResponse<ImportBatch>>({
    content: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [batchesError, setBatchesError] = useState<string | null>(null);
  const [batchPageNumber, setBatchPageNumber] = useState(0);

  // Recent import result banner
  const [latestImportResult, setLatestImportResult] = useState<ImportBatch | null>(null);

  // Import batch detail modal state
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);

  // Load Non-IATA agencies for filter dropdown
  useEffect(() => {
    getNonIatas({ size: 100, sort: 'name,asc' })
      .then((res) => setAgencies(res.content))
      .catch(() => {});
  }, []);

  // Fetch Sales Transactions from real backend
  const fetchSales = useCallback(async () => {
    setIsLoadingSales(true);
    setSalesError(null);
    try {
      const response = await getSales({
        ticketNumber: searchQuery.trim() || undefined,
        nonIataId: selectedNonIataId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: salesPageNumber,
        size: salesPageSize,
        sort: 'saleDate,desc',
      });
      startTransition(() => {
        setSalesPage(response);
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setSalesError(err.message || 'Failed to load sales transactions');
      } else {
        setSalesError('Network error connecting to backend');
      }
    } finally {
      setIsLoadingSales(false);
    }
  }, [searchQuery, selectedNonIataId, startDate, endDate, salesPageNumber, salesPageSize]);

  // Fetch Import Batches from real backend
  const fetchBatches = useCallback(async () => {
    setIsLoadingBatches(true);
    setBatchesError(null);
    try {
      const response = await getImportBatches({
        page: batchPageNumber,
        size: 20,
        sort: 'createdAt,desc',
      });
      startTransition(() => {
        setBatchesPage(response);
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setBatchesError(err.message || 'Failed to load import batch history');
      } else {
        setBatchesError('Network error connecting to backend');
      }
    } finally {
      setIsLoadingBatches(false);
    }
  }, [batchPageNumber]);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSales();
    } else {
      fetchBatches();
    }
  }, [activeTab, fetchSales, fetchBatches]);

  const handleTabChange = (tab: 'sales' | 'import') => {
    setSearchParams({ tab });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedNonIataId(undefined);
    setStartDate('');
    setEndDate('');
    setSalesPageNumber(0);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedNonIataId !== undefined || startDate || endDate
  );

  const handleImportSuccess = (batch: ImportBatch) => {
    setLatestImportResult(batch);
    fetchBatches();
    // Refresh sales in background if user switches back
    if (batch.successfulRows > 0) {
      fetchSales();
    }
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Sales Reports"
        subtitle="Galileo/BSP Excel sales reports, daily imports, and transaction ledger"
        actions={
          isFinance && activeTab === 'sales' ? (
            <Button
              onClick={() => handleTabChange('import')}
              leftIcon={<IUpload size={15} />}
            >
              Upload Daily Report
            </Button>
          ) : undefined
        }
      />

      {/* Tab Switcher matching Figma visual language */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-lg px-2 pt-1">
        <button
          type="button"
          onClick={() => handleTabChange('sales')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sales'
              ? 'border-[#0F2E22] text-[#0F2E22]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <IPlane size={16} />
          Sales Transactions
          {salesPage.totalElements > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'sales'
                  ? 'bg-[#0F2E22]/10 text-[#0F2E22]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {salesPage.totalElements}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('import')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'import'
              ? 'border-[#0F2E22] text-[#0F2E22]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <IFile size={16} />
          Daily Report Import &amp; History
          {batchesPage.totalElements > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'import'
                  ? 'bg-[#0F2E22]/10 text-[#0F2E22]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {batchesPage.totalElements}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: SALES TRANSACTIONS ─── */}
      {activeTab === 'sales' && (
        <div>
          {salesError && (
            <div className="mb-4">
              <Alert variant="danger" title="Error loading sales" message={salesError} onDismiss={() => setSalesError(null)} />
            </div>
          )}

          <Card>
            {/* Filters */}
            <SalesFilters
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setSalesPageNumber(0);
              }}
              selectedNonIataId={selectedNonIataId}
              onNonIataChange={(id) => {
                setSelectedNonIataId(id);
                setSalesPageNumber(0);
              }}
              agencies={agencies}
              startDate={startDate}
              onStartDateChange={(d) => {
                setStartDate(d);
                setSalesPageNumber(0);
              }}
              endDate={endDate}
              onEndDateChange={(d) => {
                setEndDate(d);
                setSalesPageNumber(0);
              }}
              pageSize={salesPageSize}
              onPageSizeChange={(s) => {
                setSalesPageSize(s);
                setSalesPageNumber(0);
              }}
              onReset={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              totalElements={salesPage.totalElements}
            />

            {/* Sales Table */}
            <SalesTable
              sales={salesPage.content}
              isLoading={isLoadingSales}
              onSelectSale={(sale) => setSelectedSaleId(sale.id)}
            />

            {/* Pagination */}
            <NonIataPagination
              pageNumber={salesPage.pageNumber}
              pageSize={salesPage.pageSize}
              totalElements={salesPage.totalElements}
              totalPages={salesPage.totalPages}
              isFirst={salesPage.isFirst}
              isLast={salesPage.isLast}
              onPageChange={(newPage) => setSalesPageNumber(newPage)}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: DAILY REPORT IMPORT ─── */}
      {activeTab === 'import' && (
        <div>
          {/* Post-Upload Ingestion Result Banner */}
          {latestImportResult && (
            <ImportResultCard
              batch={latestImportResult}
              onDismiss={() => setLatestImportResult(null)}
              onViewErrors={() => {
                setSelectedBatch(latestImportResult);
              }}
            />

          )}

          {/* Upload Dropzone (Restricted to Finance) */}
          <ImportUploadCard onImportSuccess={handleImportSuccess} />

          {/* Upload History Section */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 font-jost">Upload &amp; Ingestion History</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete audit log of ingested daily Galileo/BSP Excel files
                </p>
              </div>
              {batchesPage.totalElements > 0 && (
                <span className="text-xs text-slate-400 font-mono">
                  {batchesPage.totalElements} {batchesPage.totalElements === 1 ? 'batch' : 'batches'} recorded
                </span>
              )}
            </div>

            {batchesError && (
              <div className="p-4">
                <Alert variant="danger" title="Error" message={batchesError} onDismiss={() => setBatchesError(null)} />
              </div>
            )}

            <ImportHistoryTable
              batches={batchesPage.content}
              isLoading={isLoadingBatches}
              onViewBatch={(batch) => setSelectedBatch(batch)}
            />

            <NonIataPagination
              pageNumber={batchesPage.pageNumber}
              pageSize={batchesPage.pageSize}
              totalElements={batchesPage.totalElements}
              totalPages={batchesPage.totalPages}
              isFirst={batchesPage.isFirst}
              isLast={batchesPage.isLast}
              onPageChange={(newPage) => setBatchPageNumber(newPage)}
            />
          </Card>
        </div>
      )}

      {/* Sales Detail Modal */}
      <SalesDetailModal
        saleId={selectedSaleId}
        isOpen={selectedSaleId !== null}
        onClose={() => setSelectedSaleId(null)}
      />

      {/* Import Batch Detail Modal */}
      <ImportBatchDetailModal
        batch={selectedBatch}
        isOpen={selectedBatch !== null}
        onClose={() => setSelectedBatch(null)}
      />
    </div>
  );
};
