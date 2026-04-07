import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export async function sleep(ms = 1000): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  const maxVisiblePages = 5; // Maximum number of page buttons to show
  const pages: (number | '...')[] = [];

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);

  if (currentPage <= 3) {
    pages.push(2, 3, 4, '...', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  }

  return pages;
}

/**
 * 智能格式化毫秒为最合适的时间显示数值 (结合 formatDurationUnit 一起使用)
 */
export function formatDuration(ms: number): string {
  if (ms >= 1000 * 60 * 60) {
    return (ms / (1000 * 60 * 60)).toFixed(2);
  }
  if (ms >= 1000 * 60) {
    return (ms / (1000 * 60)).toFixed(2);
  }
  if (ms >= 1000) {
    return (ms / 1000).toFixed(2);
  }
  return Math.round(ms).toString();
}

/**
 * 取回上述 formatDuration 格式化后的单位后缀
 */
export function formatDurationUnit(ms: number): string {
  if (ms >= 1000 * 60 * 60) {
    return 'h';
  }
  if (ms >= 1000 * 60) {
    return 'min';
  }
  if (ms >= 1000) {
    return 's';
  }
  return 'ms';
}
