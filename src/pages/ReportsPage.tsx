import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { IFileText, IChart } from '@/components/ui/Icons';
import { getStatement } from '@/api/statementsApi';
import { getAgingReport } from '@/api/agingApi';
import { AccountStatement } from '@/types/statements.types';
import { AgingReport, AgingFilterParams } from '@/types/aging.types';
import { StatementFilters } from '@/features/statements/components/StatementFilters';
import { StatementSummaryCards } from '@/features/statements/components/StatementSummaryCards';
import { StatementTable } from '@/features/statements/components/StatementTable';
import { StatementExportActions } from '@/features/statements/components/StatementExportActions';
import { AgingFilters } from '@/features/aging/components/AgingFilters';
import { AgingSummaryCards } from '@/features/aging/components/AgingSummaryCards';
import { AgingTable } from '@/features/aging/components/AgingTable';
import { AgingExportActions } from '@/features/aging/components/AgingExportActions';

export const ReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'statement' | 'aging'
  const activeTab = (searchParams.get('tab') as 'statement' | 'aging') || 'statement';

  const setActiveTab = (tab: 'statement' | 'aging') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // ─── Statement State ────────────────────────────────────────────────────────
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | ''>(() => {
    const id = searchParams.get('nonIataId');
    return id ? Number(id) : '';
  });
  const [statementDateFrom, setStatementDateFrom] = useState<string>('');
  const [statementDateTo, setStatementDateTo] = useState<string>('');
  const [statement, setStatement] = useState<AccountStatement | null>(null);
  const [isLoadingStatement, setIsLoadingStatement] = useState(false);
  const [statementError, setStatementError] = useState<string | null>(null);

  const fetchStatement = useCallback(async (agencyId: number, dateFrom?: string, dateTo?: string) => {
    if (!agencyId) return;
    setIsLoadingStatement(true);
    setStatementError(null);
    try {
      const data = await getStatement(agencyId, {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setStatement(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to generate account statement.';
      setStatementError(msg);
      setStatement(null);
    } finally {
      setIsLoadingStatement(false);
    }
  }, []);

  const handleGenerateStatement = () => {
    if (selectedAgencyId) {
      fetchStatement(Number(selectedAgencyId), statementDateFrom, statementDateTo);
    }
  };

  // Auto-fetch statement when agency changes
  useEffect(() => {
    if (selectedAgencyId) {
      fetchStatement(Number(selectedAgencyId), statementDateFrom, statementDateTo);
    }
  }, [selectedAgencyId]);

  // ─── Aging State ────────────────────────────────────────────────────────────
  const [agingFilters, setAgingFilters] = useState<AgingFilterParams>({
    asOfDate: new Date().toISOString().split('T')[0],
  });
  const [agingReport, setAgingReport] = useState<AgingReport | null>(null);
  const [isLoadingAging, setIsLoadingAging] = useState(false);
  const [agingError, setAgingError] = useState<string | null>(null);

  const fetchAging = useCallback(async (filters: AgingFilterParams) => {
    setIsLoadingAging(true);
    setAgingError(null);
    try {
      const data = await getAgingReport(filters);
      setAgingReport(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to generate A/R aging report.';
      setAgingError(msg);
      setAgingReport(null);
    } finally {
      setIsLoadingAging(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'aging') {
      fetchAging(agingFilters);
    }
  }, [activeTab, agingFilters, fetchAging]);

  const handleAgingFilterChange = (newFilters: Partial<AgingFilterParams>) => {
    setAgingFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleAgingReset = () => {
    setAgingFilters({
      asOfDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSelectStatementFromAging = (agencyId: number) => {
    setSelectedAgencyId(agencyId);
    setActiveTab('statement');
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Financial Reports"
        subtitle="Authoritative account statements, accounts receivable aging, and export documents"
        actions={
          activeTab === 'statement' && statement ? (
            <StatementExportActions
              nonIataId={statement.nonIataId}
              nonIataCode={statement.nonIataCode}
              dateFrom={statementDateFrom}
              dateTo={statementDateTo}
              disabled={isLoadingStatement}
            />
          ) : activeTab === 'aging' && agingReport ? (
            <AgingExportActions filters={agingFilters} disabled={isLoadingAging} />
          ) : undefined
        }
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('statement')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'statement'
              ? 'border-emerald-800 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <IFileText size={16} />
          Account Statements
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aging')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'aging'
              ? 'border-emerald-800 text-emerald-800 bg-emerald-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <IChart size={16} />
          Accounts Receivable Aging
        </button>
      </div>

      {/* TAB 1: ACCOUNT STATEMENTS */}
      {activeTab === 'statement' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {statementError && (
            <Alert
              variant="danger"
              title="Unable to generate statement"
              message={statementError}
            />
          )}

          <StatementFilters
            selectedAgencyId={selectedAgencyId}
            dateFrom={statementDateFrom}
            dateTo={statementDateTo}
            onAgencyChange={setSelectedAgencyId}
            onDateFromChange={setStatementDateFrom}
            onDateToChange={setStatementDateTo}
            onGenerate={handleGenerateStatement}
            isLoading={isLoadingStatement}
          />

          {statement && !isLoadingStatement && (
            <StatementSummaryCards statement={statement} />
          )}

          <Card>
            <StatementTable statement={statement} isLoading={isLoadingStatement} />
          </Card>
        </div>
      )}

      {/* TAB 2: AGING ANALYSIS */}
      {activeTab === 'aging' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {agingError && (
            <Alert
              variant="danger"
              title="Unable to generate aging report"
              message={agingError}
            />
          )}

          <AgingFilters
            filters={agingFilters}
            onFilterChange={handleAgingFilterChange}
            onReset={handleAgingReset}
          />

          {agingReport && !isLoadingAging && (
            <AgingSummaryCards report={agingReport} />
          )}

          <Card>
            <AgingTable
              report={agingReport}
              isLoading={isLoadingAging}
              onSelectStatement={handleSelectStatementFromAging}
            />
          </Card>
        </div>
      )}
    </div>
  );
};
