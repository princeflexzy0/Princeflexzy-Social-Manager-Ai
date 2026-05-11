import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { format } from 'date-fns';

/**
 * Safely parse and format a date-like value. Returns fallback when invalid.
 */
export function formatDateSafe(value: unknown, fmt = 'MMM d, yyyy', fallback = 'N/A') {
  if (!value) return fallback;
  try {
    const d = new Date(String(value));
    if (isNaN(d.getTime())) return fallback;
    return format(d, fmt);
  } catch (e) {
    return fallback;
  }
}
