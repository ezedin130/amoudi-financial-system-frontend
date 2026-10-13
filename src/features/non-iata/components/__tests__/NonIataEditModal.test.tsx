import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NonIataEditModal } from '../NonIataEditModal';
import * as nonIataApi from '@/api/nonIataApi';
import { NonIata } from '@/types/nonIata.types';

vi.mock('@/api/nonIataApi', () => ({
  updateNonIata: vi.fn(),
}));

const mockAccount: NonIata = {
  id: 11,
  code: 'BAT01',
  name: 'Bati Travel',
  status: 'ACTIVE',
  contactName: 'Abebe Bikila',
  phone: '+251911223344',
  email: 'abebe@bati.com',
  notes: 'Bati main branch',
  createdAt: '2026-09-01T10:00:00',
  updatedAt: '2026-09-01T10:00:00',
};

describe('NonIataEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with immutable code disabled and fields prefilled', () => {
    render(
      <NonIataEditModal
        account={mockAccount}
        isOpen={true}
        onClose={vi.fn()}
        onUpdated={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Non-IATA Account')).toBeInTheDocument();
    const codeInput = screen.getByDisplayValue('BAT01');
    expect(codeInput).toBeDisabled();

    expect(screen.getByDisplayValue('Bati Travel')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Abebe Bikila')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+251911223344')).toBeInTheDocument();
    expect(screen.getByDisplayValue('abebe@bati.com')).toBeInTheDocument();
  });

  it('updates account successfully and calls onUpdated', async () => {
    const onUpdated = vi.fn();
    const updatedAccount = { ...mockAccount, name: 'Bati Travel International' };
    vi.mocked(nonIataApi.updateNonIata).mockResolvedValueOnce(updatedAccount);

    render(
      <NonIataEditModal
        account={mockAccount}
        isOpen={true}
        onClose={vi.fn()}
        onUpdated={onUpdated}
      />
    );

    fireEvent.change(screen.getByLabelText(/Agency Name/i), {
      target: { value: 'Bati Travel International' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(nonIataApi.updateNonIata).toHaveBeenCalledWith(11, {
        name: 'Bati Travel International',
        contactName: 'Abebe Bikila',
        phone: '+251911223344',
        email: 'abebe@bati.com',
        notes: 'Bati main branch',
      });
      expect(onUpdated).toHaveBeenCalledWith(updatedAccount);
    });
  });
});
