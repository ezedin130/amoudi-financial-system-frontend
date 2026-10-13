import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportHistoryTable } from '../ImportHistoryTable';
import { ImportBatch } from '@/types/imports.types';

const mockBatches: ImportBatch[] = [
  {
    id: 18,
    fileName: 'SEP- 18.xlsx',
    reportDate: '2026-09-18',
    status: 'IMPORTED',
    totalRows: 18,
    successfulRows: 18,
    duplicateRows: 0,
    unmatchedRows: 0,
    failedRows: 0,
    uploadedById: 1,
    uploadedByUsername: 'finance_user',
    uploadedAt: '2026-10-02T10:00:00',
    createdAt: '2026-10-02T10:00:00',
  },
];

describe('ImportHistoryTable', () => {
  it('renders upload history rows with file name, metrics, and details button', () => {
    const onViewBatch = vi.fn();
    render(<ImportHistoryTable batches={mockBatches} isLoading={false} onViewBatch={onViewBatch} />);

    expect(screen.getByText('SEP- 18.xlsx')).toBeInTheDocument();
    expect(screen.getByText('finance_user')).toBeInTheDocument();
    expect(screen.getAllByText('Imported').length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole('button', { name: /Details/i }));
    expect(onViewBatch).toHaveBeenCalledWith(mockBatches[0]);
  });

  it('renders empty state when no upload batches exist', () => {
    render(<ImportHistoryTable batches={[]} isLoading={false} onViewBatch={vi.fn()} />);

    expect(screen.getByText('No upload history found')).toBeInTheDocument();
  });
});
