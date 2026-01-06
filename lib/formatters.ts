export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0';

  return Math.round(value).toLocaleString('en-US');
};

export const formatPercent = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';

  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatDelta = (current: number, previous: number): string => {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }

  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';

  return `${sign}${delta.toFixed(1)}%`;
};

export const getDeltaColor = (delta: number): string => {
  if (delta > 0) return 'text-accent';
  if (delta < 0) return 'text-destructive';
  return 'text-muted-foreground';
};

export const formatDateCompact = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};
