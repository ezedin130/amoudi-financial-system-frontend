import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NonIataCreateModal } from '../NonIataCreateModal';
import * as nonIataApi from '@/api/nonIataApi';
import { ApiError } from '@/types/api.types';

vi.mock('@/api/nonIataApi', () => ({
  createNonIata: vi.fn(),
}));

describe('NonIataCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<NonIataCreateModal isOpen={true} onClose={vi.fn()} onCreated={vi.fn()} />);

    expect(screen.getByText('Add Non-IATA Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Agency Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Agency Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Account' })).toBeInTheDocument();
  });

  it('validates required fields before submitting', async () => {
    render(<NonIataCreateModal isOpen={true} onClose={vi.fn()} onCreated={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Account' }));

    await waitFor(() => {
      expect(screen.getByText('Agency code is required')).toBeInTheDocument();
      expect(screen.getByText('Agency name is required')).toBeInTheDocument();
    });

    expect(nonIataApi.createNonIata).not.toHaveBeenCalled();
  });

  it('submits successfully and calls onCreated', async () => {
    const onCreated = vi.fn();
    const createdAccount = {
      id: 50,
      code: 'TEST01',
      name: 'Test Agency',
      status: 'ACTIVE' as const,
      createdAt: '2026-09-01T10:00:00',
      updatedAt: '2026-09-01T10:00:00',
    };
    vi.mocked(nonIataApi.createNonIata).mockResolvedValueOnce(createdAccount);

    render(<NonIataCreateModal isOpen={true} onClose={vi.fn()} onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText(/Agency Code/i), { target: { value: 'test01' } });
    fireEvent.change(screen.getByLabelText(/Agency Name/i), { target: { value: 'Test Agency' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Account' }));

    await waitFor(() => {
      expect(nonIataApi.createNonIata).toHaveBeenCalledWith({
        code: 'TEST01',
        name: 'Test Agency',
        contactName: undefined,
        phone: undefined,
        email: undefined,
        notes: undefined,
      });
      expect(onCreated).toHaveBeenCalledWith(createdAccount);
    });
  });

  it('displays API error when server returns 409 Conflict / duplicate code', async () => {
    vi.mocked(nonIataApi.createNonIata).mockRejectedValueOnce(
      new ApiError(409, 'CONFLICT', 'Non-IATA code TEST01 already exists', [
        'A sub-agent with code TEST01 is already registered',
      ])
    );

    render(<NonIataCreateModal isOpen={true} onClose={vi.fn()} onCreated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Agency Code/i), { target: { value: 'TEST01' } });
    fireEvent.change(screen.getByLabelText(/Agency Name/i), { target: { value: 'Test Agency' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add Account' }));

    await waitFor(() => {
      expect(screen.getByText('Non-IATA code TEST01 already exists')).toBeInTheDocument();
      expect(screen.getByText('A sub-agent with code TEST01 is already registered')).toBeInTheDocument();
    });
  });

  it('does not require manual mapping inputs (preserves simple Option A creation workflow)', () => {
    render(<NonIataCreateModal isOpen={true} onClose={vi.fn()} onCreated={vi.fn()} />);

    // Confirms no manual mapping field is rendered
    expect(screen.queryByLabelText(/Mapping/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Source Name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Normalized Name/i)).not.toBeInTheDocument();
  });
});
