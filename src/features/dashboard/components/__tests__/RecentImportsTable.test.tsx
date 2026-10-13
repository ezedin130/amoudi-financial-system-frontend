import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecentImportsTable } from '../RecentImportsTable';
import * as dashboardApi from '@/api/dashboardApi';
import { ImportBatch } from '@/types/imports.types';

vi.mock('@/api/dashboardApi');

describe('RecentImportsTable', () => {
  const mockBatches: ImportBatch[] = [
    {
      id: 1,
      fileName: 'Daily_Sales_2026-10-01.xlsx',
      uploadedById: 1,
      uploadedByUsername: 'finance_user',
      uploadedAt: '2026-10-01T09:15:00Z',
      status: 'IMPORTED',
      totalRows: 1500,
      successfulRows: 1480,
      duplicateRows: 15,
      unmatchedRows: 0,
      failedRows: 5,
      createdAt: '2026-10-01T09:15:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recent import batch details, status badge, and metrics', async () => {
    vi.mocked(dashboardApi.getRecentImports).mockResolvedValue(mockBatches);

    render(
      <MemoryRouter>
        <RecentImportsTable />
      </MemoryRouter>
    );

    expect(screen.getByText('Recent Sales Report Ingestions')).toBeInTheDocument();

    await waitFor(() => {
      expect(dashboardApi.getRecentImports).toHaveBeenCalledWith(5);
    });

    await waitFor(() => {
      expect(screen.getByText('Daily_Sales_2026-10-01.xlsx')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument();
      expect(screen.getByText('1480')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /View all import batches/i });
    expect(link).toHaveAttribute('href', '/sales-reports');
  });
});
