import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NonIataStatusConfirmModal } from '../NonIataStatusConfirmModal';
import * as nonIataApi from '@/api/nonIataApi';
import { NonIata } from '@/types/nonIata.types';

vi.mock('@/api/nonIataApi', () => ({
  updateNonIataStatus: vi.fn(),
}));

const mockActiveAccount: NonIata = {
  id: 11,
  code: 'BAT01',
  name: 'Bati Travel',
  status: 'ACTIVE',
  createdAt: '2026-09-01T10:00:00',
  updatedAt: '2026-09-01T10:00:00',
};

const mockInactiveAccount: NonIata = {
  id: 12,
  code: 'EMR01',
  name: 'Emran Travel',
  status: 'INACTIVE',
  createdAt: '2026-09-01T10:00:00',
  updatedAt: '2026-09-01T10:00:00',
};

describe('NonIataStatusConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prompts to deactivate active agency with danger button', async () => {
    const onUpdated = vi.fn();
    const deactivated = { ...mockActiveAccount, status: 'INACTIVE' as const };
    vi.mocked(nonIataApi.updateNonIataStatus).mockResolvedValueOnce(deactivated);

    render(
      <NonIataStatusConfirmModal
        account={mockActiveAccount}
        isOpen={true}
        onClose={vi.fn()}
        onStatusUpdated={onUpdated}
      />
    );

    expect(screen.getByText('Deactivate Non-IATA Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate Account' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Account' }));

    await waitFor(() => {
      expect(nonIataApi.updateNonIataStatus).toHaveBeenCalledWith(11, 'INACTIVE');
      expect(onUpdated).toHaveBeenCalledWith(deactivated);
    });
  });

  it('prompts to activate inactive agency with primary button', async () => {
    const onUpdated = vi.fn();
    const activated = { ...mockInactiveAccount, status: 'ACTIVE' as const };
    vi.mocked(nonIataApi.updateNonIataStatus).mockResolvedValueOnce(activated);

    render(
      <NonIataStatusConfirmModal
        account={mockInactiveAccount}
        isOpen={true}
        onClose={vi.fn()}
        onStatusUpdated={onUpdated}
      />
    );

    expect(screen.getByText('Activate Non-IATA Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate Account' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Activate Account' }));

    await waitFor(() => {
      expect(nonIataApi.updateNonIataStatus).toHaveBeenCalledWith(12, 'ACTIVE');
      expect(onUpdated).toHaveBeenCalledWith(activated);
    });
  });
});
