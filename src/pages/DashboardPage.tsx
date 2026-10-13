import React, { useState, useEffect, useCallback } from 'react';
import { DashboardOverviewMetrics } from '@/types/dashboard.types';
import { getDashboardOverviewMetrics } from '@/api/dashboardApi';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { FinancialOverviewCards } from '@/features/dashboard/components/FinancialOverviewCards';
import { AgingOverview } from '@/features/dashboard/components/AgingOverview';
import { OutstandingBalancesTable } from '@/features/dashboard/components/OutstandingBalancesTable';
import { RecentSalesTable } from '@/features/dashboard/components/RecentSalesTable';
import { RecentPaymentsTable } from '@/features/dashboard/components/RecentPaymentsTable';
import { RecentImportsTable } from '@/features/dashboard/components/RecentImportsTable';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardOverviewMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    setMetricsError(null);
    try {
      const data = await getDashboardOverviewMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load executive dashboard overview.';
      setMetricsError(msg);
      setMetrics(null);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Increment refreshTrigger to signal child widgets to reload
    setRefreshTrigger((prev) => prev + 1);
    await loadMetrics();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Page Header */}
      <DashboardHeader
        asOfDate={metrics?.asOfDate}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Row 1: High-Level Financial Overview Cards */}
      <FinancialOverviewCards
        metrics={metrics}
        isLoading={isLoadingMetrics}
        error={metricsError}
        onRetry={loadMetrics}
      />

      {/* Row 2: Accounts Receivable Aging Overview & Distribution */}
      <AgingOverview metrics={metrics} isLoading={isLoadingMetrics} />

      {/* Row 3: Non-IATA Balance Overview Table */}
      <OutstandingBalancesTable key={refreshTrigger} />

      {/* Row 4: Recent Activity - 2 Column Grid (Sales + Payments) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentSalesTable refreshTrigger={refreshTrigger} />
        <RecentPaymentsTable refreshTrigger={refreshTrigger} />
      </div>

      {/* Row 5: Recent Import Batches */}
      <RecentImportsTable refreshTrigger={refreshTrigger} />
    </div>
  );
};
