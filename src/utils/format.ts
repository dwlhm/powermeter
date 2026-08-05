import { CURRENCY_LOCALE, CURRENCY_CODE } from '@/constants';

export const formatNumber = (value: number, digits = 1): string =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactCurrency = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} B`;
  if (Math.abs(value) >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(2)} M`;
  if (Math.abs(value) >= 1_000) return `Rp ${(value / 1_000).toFixed(1)} K`;
  return formatCurrency(value);
};

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
};
