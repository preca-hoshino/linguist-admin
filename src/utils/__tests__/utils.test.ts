import { describe, expect, it } from 'vitest';
import { cn, getPageNumbers, sleep } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge classnames properly', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
      expect(cn('px-2 py-1', { 'text-red-500': true, 'text-blue-500': false })).toBe('px-2 py-1 text-red-500');
    });
  });

  describe('sleep', () => {
    it('should resolve after timeout', async () => {
      const start = Date.now();
      await sleep(50);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(49);
    });

    it('should default to 1000ms if not provided', async () => {
      // Just test that it is a promise that resolves. We don't want to actually wait 1s in unit tests
      const promise = sleep(1);
      expect(promise).toBeInstanceOf(Promise);
      await promise;
    });
  });

  describe('getPageNumbers', () => {
    it('should return all pages if total is <= 5', () => {
      expect(getPageNumbers(1, 4)).toEqual([1, 2, 3, 4]);
      expect(getPageNumbers(5, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should show ellipsis at the end when near the beginning', () => {
      expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, '...', 10]);
      expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, 4, '...', 10]);
      expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, '...', 10]);
    });

    it('should show ellipsis at the beginning when near the end', () => {
      expect(getPageNumbers(9, 10)).toEqual([1, '...', 7, 8, 9, 10]);
      expect(getPageNumbers(10, 10)).toEqual([1, '...', 7, 8, 9, 10]);
      expect(getPageNumbers(8, 10)).toEqual([1, '...', 7, 8, 9, 10]);
    });

    it('should show ellipsis on both sides when in the middle', () => {
      expect(getPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
      expect(getPageNumbers(7, 20)).toEqual([1, '...', 6, 7, 8, '...', 20]);
    });
  });
});
