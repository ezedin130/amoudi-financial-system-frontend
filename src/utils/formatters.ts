/**
 * Formats a numeric value as a standardized currency string (e.g. "143,673.00 ETB").
 */
export function formatCurrency(amount: number | string | null | undefined, currency = 'ETB'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `0.00 ${currency}`;
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${formatted} ${currency}`;
}

/**
 * Formats a numeric value with commas and 2 decimal places.
 */
export function formatNumber(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0.00';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats an ISO date or datetime string to a human-readable date (e.g. "17 Sep 2026").
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats an ISO datetime string to date and time (e.g. "17 Sep 2026, 14:30").
 */
export function formatDateTime(dateTimeStr: string | null | undefined): string {
  if (!dateTimeStr) return '—';

  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateTimeStr;
  }
}
