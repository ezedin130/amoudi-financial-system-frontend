import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportUploadCard } from '../ImportUploadCard';
import * as importsApi from '@/api/importsApi';
import * as authContextModule from '@/auth/AuthContext';
import { User } from '@/types/api.types';

vi.mock('@/api/importsApi', () => ({
  uploadReport: vi.fn(),
}));

const mockFinanceUser: User = {
  id: 1,
  username: 'finance_user',
  fullName: 'Finance Officer',
  role: 'FINANCE',
  status: 'ACTIVE',
};

const mockGmUser: User = {
  id: 2,
  username: 'admin',
  fullName: 'General Manager',
  role: 'GENERAL_MANAGER',
  status: 'ACTIVE',
};

describe('ImportUploadCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderCard = (user: User, onImportSuccess = vi.fn()) => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user,
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    return render(<ImportUploadCard onImportSuccess={onImportSuccess} />);
  };

  it('renders upload dropzone for Finance role', () => {
    renderCard(mockFinanceUser);

    expect(screen.getByText('Ingest Daily Sales Report')).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop Excel file here/i)).toBeInTheDocument();
    expect(screen.getByText(/Supported formats: .xlsx \/ .xls/i)).toBeInTheDocument();
  });

  it('renders restriction message and hides upload dropzone for General Manager role', () => {
    renderCard(mockGmUser);

    expect(screen.getByText('Daily Report Ingestion Restricted')).toBeInTheDocument();
    expect(screen.queryByText(/Drag & drop Excel file here/i)).not.toBeInTheDocument();
  });

  it('validates file type and uploads valid Excel file', async () => {
    const onImportSuccess = vi.fn();
    const mockBatch = {
      id: 18,
      fileName: 'SEP- 17.xlsx',
      status: 'IMPORTED' as const,
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
    vi.mocked(importsApi.uploadReport).mockResolvedValueOnce(mockBatch);

    renderCard(mockFinanceUser, onImportSuccess);

    const file = new File(['mock content'], 'SEP- 17.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const input = document.getElementById('sales-file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('SEP- 17.xlsx')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload & Ingest Report/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Upload & Ingest Report/i }));

    await waitFor(() => {
      expect(importsApi.uploadReport).toHaveBeenCalledWith(file);
      expect(onImportSuccess).toHaveBeenCalledWith(mockBatch);
    });
  });
});
