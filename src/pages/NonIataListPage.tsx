import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { IPlus } from '@/components/ui/Icons';
import { useAuth } from '@/auth/AuthContext';
import { getNonIatas } from '@/api/nonIataApi';
import { NonIata, NonIataStatus } from '@/types/nonIata.types';
import { PageResponse, ApiError } from '@/types/api.types';
import { NonIataFilters } from '@/features/non-iata/components/NonIataFilters';
import { NonIataTable } from '@/features/non-iata/components/NonIataTable';
import { NonIataPagination } from '@/features/non-iata/components/NonIataPagination';
import { NonIataCreateModal } from '@/features/non-iata/components/NonIataCreateModal';
import { NonIataEditModal } from '@/features/non-iata/components/NonIataEditModal';
import { NonIataStatusConfirmModal } from '@/features/non-iata/components/NonIataStatusConfirmModal';

export const NonIataListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFinance = user?.role === 'FINANCE';
  const [, startTransition] = useTransition();

  // Data state
  const [data, setData] = useState<PageResponse<NonIata>>({
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<NonIataStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<NonIata | null>(null);
  const [statusTargetAccount, setStatusTargetAccount] = useState<NonIata | null>(null);

  // Fetch Non-IATAs
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNonIatas({
        search: search.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
        page,
        size: pageSize,
        sort: 'createdAt,desc',
      });
      startTransition(() => {
        setData(response);
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to load Non-IATA accounts from server.');
      } else {
        setError('Network error or server unreachable. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, status, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers for filters
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const handleStatusChange = (newStatus: NonIataStatus | 'ALL') => {
    setStatus(newStatus);
    setPage(0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  // Navigation to detail view
  const handleViewAccount = (id: number) => {
    navigate(`/non-iatas/${id}`);
  };

  // Actions after modal operations
  const handleCreated = (newAccount: NonIata) => {
    setIsCreateOpen(false);
    setSuccessMessage(`Non-IATA account "${newAccount.name}" (${newAccount.code}) created successfully. Code mapping is active for sales imports.`);
    fetchData();
  };

  const handleUpdated = (updatedAccount: NonIata) => {
    setEditingAccount(null);
    setSuccessMessage(`Account "${updatedAccount.name}" (${updatedAccount.code}) updated successfully.`);
    fetchData();
  };

  const handleStatusUpdated = (updatedAccount: NonIata) => {
    setStatusTargetAccount(null);
    const statusText = updatedAccount.status === 'ACTIVE' ? 'activated' : 'deactivated';
    setSuccessMessage(`Account "${updatedAccount.name}" (${updatedAccount.code}) has been ${statusText}.`);
    fetchData();
  };

  return (
    <div>
      {/* Page Header matching Figma */}
      <PageHeader
        title="Non-IATAs"
        subtitle="View and manage all Non-IATA financial accounts"
        actions={
          isFinance ? (
            <Button
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<IPlus size={15} />}
            >
              Add Non-IATA
            </Button>
          ) : undefined
        }
      />

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-4">
          <Alert
            variant="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        </div>
      )}

      {/* Error Notification with Retry */}
      {error && (
        <div className="mb-4">
          <Alert
            variant="danger"
            title="Error loading accounts"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        {/* Filters */}
        <NonIataFilters
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalElements={data.totalElements}
        />

        {/* Data Table */}
        <NonIataTable
          items={data.content}
          isLoading={isLoading}
          onViewAccount={handleViewAccount}
          onEditAccount={isFinance ? (acc) => setEditingAccount(acc) : undefined}
          onToggleStatus={isFinance ? (acc) => setStatusTargetAccount(acc) : undefined}
        />

        {/* Pagination */}
        <NonIataPagination
          pageNumber={data.pageNumber}
          pageSize={data.pageSize}
          totalElements={data.totalElements}
          totalPages={data.totalPages}
          isFirst={data.isFirst}
          isLast={data.isLast}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Card>

      {/* Modals for Finance Role */}
      {isFinance && (
        <>
          <NonIataCreateModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreated={handleCreated}
          />

          <NonIataEditModal
            account={editingAccount}
            isOpen={editingAccount !== null}
            onClose={() => setEditingAccount(null)}
            onUpdated={handleUpdated}
          />

          <NonIataStatusConfirmModal
            account={statusTargetAccount}
            isOpen={statusTargetAccount !== null}
            onClose={() => setStatusTargetAccount(null)}
            onStatusUpdated={handleStatusUpdated}
          />
        </>
      )}
    </div>
  );
};
