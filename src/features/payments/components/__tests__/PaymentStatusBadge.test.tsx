import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentStatusBadge } from '../PaymentStatusBadge';

describe('PaymentStatusBadge', () => {
  it('renders Posted badge with emerald styling', () => {
    render(<PaymentStatusBadge status="POSTED" />);
    const badge = screen.getByText('Posted');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-700');
  });

  it('renders Cancelled badge with rose styling', () => {
    render(<PaymentStatusBadge status="CANCELLED" />);
    const badge = screen.getByText('Cancelled');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-rose-700');
  });
});
