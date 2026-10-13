import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { IArrowLeft, IEdit, IPhone, IMail, IBuilding, IFileText } from '@/components/ui/Icons';
import { useAuth } from '@/auth/AuthContext';
import {
  getNonIataById,
  getNonIataFinancialSummary,
  getNonIataStatement,
} from '@/api/nonIataApi';
import {
  NonIata,
  NonIataFinancialSummary,
  AccountStatement,
} from '@/types/nonIata.types';
import { ApiError } from '@/types/api.types';
import { formatDate } from '@/utils/formatters';
import { NonIataStatusBadge } from '@/features/non-iata/components/NonIataStatusBadge';
import { NonIataSummaryCards } from '@/features/non-iata/components/NonIataSummaryCards';
import { NonIataLedgerTable } from '@/features/non-iata/components/NonIataLedgerTable';
import { NonIataEditModal } from '@/features/non-iata/components/NonIataEditModal';
import { NonIataStatusConfirmModal } from '@/features/non-iata/components/NonIataStatusConfirmModal';

export const NonIataDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFinance = user?.role === 'FINANCE';

  // Data states
  const [account, setAccount] = useState<NonIata | null>(null);
  const [summary, setSummary] = useState<NonIataFinancialSummary | null>(null);
  const [statement, setStatement] = useState<AccountStatement | null>(null);

  // Loading & error states
  const [isLoadingAccount, setIsLoadingAccount] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingStatement, setIsLoadingStatement] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Date filters for ledger statement
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);

  // Load account profile
  const fetchAccount = useCallback(async (accountId: string) => {
    setIsLoadingAccount(true);
    setError(null);
    try {
      const data = await getNonIataById(accountId);
      setAccount(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to retrieve account details');
      } else {
        setError('Error connecting to backend server');
      }
    } finally {
      setIsLoadingAccount(false);
    }
  }, []);

  // Load live financial summary
  const fetchSummary = useCallback(async (accountId: string) => {
    setIsLoadingSummary(true);
    try {
      const data = await getNonIataFinancialSummary(accountId);
      setSummary(data);
    } catch {
      // Summary error handled gracefully
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // Load live transaction statement ledger
  const fetchStatement = useCallback(
    async (accountId: string, from?: string, to?: string) => {
      setIsLoadingStatement(true);
      try {
        const data = await getNonIataStatement(accountId, from || undefined, to || undefined);
        setStatement(data);
      } catch {
        // Statement error handled gracefully
      } finally {
        setIsLoadingStatement(false);
      }
    },
    []
  );

  useEffect(() => {
    if (id) {
      fetchAccount(id);
      fetchSummary(id);
      fetchStatement(id, dateFrom, dateTo);
    }
  }, [id, fetchAccount, fetchSummary, fetchStatement]);

  const handleFilterSubmit = () => {
    if (id) {
      fetchStatement(id, dateFrom, dateTo);
    }
  };

  const handleFilterReset = () => {
    setDateFrom('');
    setDateTo('');
    if (id) {
      fetchStatement(id, '', '');
    }
  };

  const handleAccountUpdated = (updated: NonIata) => {
    setAccount(updated);
    setIsEditOpen(false);
    setSuccessMessage(`Account "${updated.name}" updated successfully.`);
    if (id) {
      fetchSummary(id);
    }
  };

  const handleStatusUpdated = (updated: NonIata) => {
    setAccount(updated);
    setIsStatusConfirmOpen(false);
    const statusText = updated.status === 'ACTIVE' ? 'activated' : 'deactivated';
    setSuccessMessage(`Account "${updated.name}" has been ${statusText}.`);
  };

  if (isLoadingAccount) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-32" />
        <div className="h-16 bg-slate-200 rounded w-full" />
        <div className="h-28 bg-slate-200 rounded w-full" />
        <div className="h-48 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/non-iatas')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <IArrowLeft size={16} />
          Back to Non-IATAs
        </button>
        <Alert
          variant="danger"
          title="Account Not Found"
          message={error || 'The requested Non-IATA account could not be found or has been removed.'}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Back button matching Figma */}
      <button
        onClick={() => navigate('/non-iatas')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors cursor-pointer select-none"
      >
        <IArrowLeft size={16} />
        Back to Non-IATAs
      </button>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-4">
          <Alert
            variant="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        </div>
      )}

      {/* Header bar matching Figma */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 font-jost tracking-tight">
              {account.name}
            </h1>
            <NonIataStatusBadge status={account.status} />
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {account.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered on {formatDate(account.createdAt)}
            {account.updatedAt && ` · Last modified ${formatDate(account.updatedAt)}`}
          </p>
        </div>

        {/* Action buttons (Finance Only) */}
        {isFinance && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<IEdit size={14} />}
              onClick={() => setIsEditOpen(true)}
            >
              Edit Details
            </Button>

            <Button
              variant={account.status === 'ACTIVE' ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setIsStatusConfirmOpen(true)}
            >
              {account.status === 'ACTIVE' ? 'Deactivate Agency' : 'Activate Agency'}
            </Button>
          </div>
        )}
      </div>

      {/* Live Financial Summary Cards */}
      <NonIataSummaryCards
        summary={summary}
        transactionCount={statement?.transactionCount}
        isLoading={isLoadingSummary}
      />

      {/* Agency Details Card */}
      <Card className="mb-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 font-jost">Agency Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <IBuilding size={14} className="text-slate-400" />
              Agency Name & Code
            </div>
            <div className="font-semibold text-slate-800 mt-1">{account.name}</div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">Code: {account.code}</div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <IPhone size={14} className="text-slate-400" />
              Contact Details
            </div>
            <div className="font-semibold text-slate-800 mt-1">
              {account.contactName || <span className="text-slate-400 font-normal">—</span>}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {account.phone || <span className="text-slate-400">—</span>}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <IMail size={14} className="text-slate-400" />
              Email & Communications
            </div>
            <div className="font-semibold text-slate-800 mt-1">
              {account.email || <span className="text-slate-400 font-normal">—</span>}
            </div>
          </div>

          {account.notes && (
            <div className="sm:col-span-2 md:col-span-3 pt-4 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <IFileText size={14} className="text-slate-400" />
                Notes & Operational Comments
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                {account.notes}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Live Transaction Ledger Card */}
      <NonIataLedgerTable
        transactions={statement?.transactions || []}
        isLoading={isLoadingStatement}
        closingBalance={statement?.closingBalance}
        currency={statement?.currency || 'ETB'}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onFilterSubmit={handleFilterSubmit}
        onFilterReset={handleFilterReset}
      />

      {/* Modals for Finance Role */}
      {isFinance && (
        <>
          <NonIataEditModal
            account={account}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onUpdated={handleAccountUpdated}
          />

          <NonIataStatusConfirmModal
            account={account}
            isOpen={isStatusConfirmOpen}
            onClose={() => setIsStatusConfirmOpen(false)}
            onStatusUpdated={handleStatusUpdated}
          />
        </>
      )}
    </div>
  );
};
