import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgingSummaryCards } from '../AgingSummaryCards';
import { AgingReport } from '@/types/aging.types';

describe('AgingSummaryCards', () => {
  it('displays authoritative aging bucket totals directly from backend report', () => {
    const mockReport: AgingReport = {
      asOfDate: '2026-10-02',
      currency: 'ETB',
      totalAccounts: 5,
      totalCurrent: 300000,
      totalDays31To60: 50000,
      totalDays61To90: 0,
      totalDays91To120: 0,
      totalDays120Plus: 0,
      totalOutstanding: 350000,
      rows: [],
    };

    render(<AgingSummaryCards report={mockReport} />);

    expect(screen.getByText('350,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('300,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('50,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('5 accounts')).toBeInTheDocument();
  });
});
