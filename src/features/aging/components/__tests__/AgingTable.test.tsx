import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgingTable } from '../AgingTable';
import type { AgingRow, AgingReport } from '../../../../types/aging.types';

describe('AgingTable', () => {
  const mockRows: AgingRow[] = [
    {
      nonIataId: 101,
      name: 'Al-Madina Travel',
      code: 'AG-001',
      status: 'ACTIVE',
      current: 1250.00,
      days31To60: 500.00,
      days61To90: 250.00,
      days91To120: 0.00,
      days120Plus: 0.00,
      totalOutstanding: 2000.00,
    },
    {
      nonIataId: 102,
      name: 'Sana\'a Wings',
      code: 'AG-002',
      status: 'ACTIVE',
      current: 0.00,
      days31To60: 1000.00,
      days61To90: 0.00,
      days91To120: 500.00,
      days120Plus: 1500.00,
      totalOutstanding: 3000.00,
    },
  ];

  const mockReport: AgingReport = {
    asOfDate: '2026-03-31',
    rows: mockRows,
    totalCurrent: 1250.00,
    totalDays31To60: 1500.00,
    totalDays61To90: 250.00,
    totalDays91To120: 500.00,
    totalDays120Plus: 1500.00,
    totalOutstanding: 5000.00,
    totalAccounts: 2,
    currency: 'USD',
  };

  it('renders table headers and all agency rows with proper bucket values', () => {
    render(<AgingTable report={mockReport} isLoading={false} />);

    expect(screen.getByText('Non-IATA')).toBeInTheDocument();
    expect(screen.getByText('Total Outstanding')).toBeInTheDocument();
    expect(screen.getByText('Current (0–30d)')).toBeInTheDocument();
    expect(screen.getByText('31–60d')).toBeInTheDocument();
    expect(screen.getByText('61–90d')).toBeInTheDocument();
    expect(screen.getByText('91–120d')).toBeInTheDocument();
    expect(screen.getByText('120+d')).toBeInTheDocument();

    // Verify row 1
    expect(screen.getByText('Al-Madina Travel')).toBeInTheDocument();
    expect(screen.getByText('AG-001')).toBeInTheDocument();
    expect(screen.getByText(/2,000\.00 USD/)).toBeInTheDocument();

    // Verify row 2
    expect(screen.getByText('Sana\'a Wings')).toBeInTheDocument();
    expect(screen.getByText('AG-002')).toBeInTheDocument();
    expect(screen.getByText(/3,000\.00 USD/)).toBeInTheDocument();

    // Verify grand totals in tfoot
    expect(screen.getByText(/Total Receivables \(2 accounts\)/i)).toBeInTheDocument();
    expect(screen.getByText(/5,000\.00 USD/)).toBeInTheDocument();
  });

  it('calls onSelectStatement callback when Statement button is clicked', () => {
    const handleSelectStatement = vi.fn();
    render(
      <AgingTable
        report={mockReport}
        isLoading={false}
        onSelectStatement={handleSelectStatement}
      />
    );

    const statementButtons = screen.getAllByRole('button', { name: /^Statement$/i });
    expect(statementButtons.length).toBe(2);

    fireEvent.click(statementButtons[0]);
    expect(handleSelectStatement).toHaveBeenCalledWith(101);
  });

  it('renders empty state when report has no rows', () => {
    const emptyReport: AgingReport = {
      asOfDate: '2026-03-31',
      rows: [],
      totalCurrent: 0,
      totalDays31To60: 0,
      totalDays61To90: 0,
      totalDays91To120: 0,
      totalDays120Plus: 0,
      totalOutstanding: 0,
      totalAccounts: 0,
    };

    render(<AgingTable report={emptyReport} isLoading={false} />);
    expect(screen.getByText('No receivables match the selected filters')).toBeInTheDocument();
  });

  it('renders skeleton rows when isLoading is true', () => {
    const { container } = render(<AgingTable report={null} isLoading={true} />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });
});
