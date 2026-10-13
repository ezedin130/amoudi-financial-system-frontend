import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportResultCard } from '../ImportResultCard';
import { ImportBatch } from '@/types/imports.types';

const mockSuccessBatch: ImportBatch = {
  id: 18,
  fileName: 'SEP- 18.xlsx',
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
};

const mockPartialBatch: ImportBatch = {
  id: 17,
  fileName: 'SEP- 17.xlsx',
  status: 'FAILED',
  totalRows: 18,
  successfulRows: 0,
  duplicateRows: 0,
  unmatchedRows: 18,
  failedRows: 0,
  uploadedById: 1,
  uploadedByUsername: 'finance_user',
  uploadedAt: '2026-10-02T10:00:00',
  createdAt: '2026-10-02T10:00:00',
};

describe('ImportResultCard', () => {
  it('renders successful import result metrics correctly', () => {
    render(<ImportResultCard batch={mockSuccessBatch} onDismiss={vi.fn()} />);

    expect(screen.getByText('Import Batch #18 Results')).toBeInTheDocument();
    expect(screen.getByText('Imported')).toBeInTheDocument();
    expect(screen.getByText('Imported Sales')).toBeInTheDocument();
    expect(screen.getAllByText('18').length).toBeGreaterThanOrEqual(1);
  });

  it('renders unmatched agency warning and details action when unmatched rows exist', () => {
    const onViewErrors = vi.fn();
    render(<ImportResultCard batch={mockPartialBatch} onDismiss={vi.fn()} onViewErrors={onViewErrors} />);

    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Unmatched Agencies')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inspect Batch Errors/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Inspect Batch Errors/i }));
    expect(onViewErrors).toHaveBeenCalledWith(17);
  });
});
