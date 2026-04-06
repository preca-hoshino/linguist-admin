import { describe, expect, it } from 'vitest';
import { formatCompact, formatLatency, formatPercent } from '../format-number';

describe('format-number', () => {
  describe('formatCompact', () => {
    it('should return "0" for null or undefined', () => {
      expect(formatCompact(null)).toBe('0');
      expect(formatCompact()).toBe('0');
    });

    it('should return value string if less than 1000', () => {
      expect(formatCompact(500)).toBe('500');
      expect(formatCompact(999)).toBe('999');
    });

    it('should format thousands to K', () => {
      expect(formatCompact(1200)).toBe('1.2K');
      expect(formatCompact(1500, 0)).toBe('2K');
      expect(formatCompact(-2300)).toBe('-2.3K');
    });

    it('should format millions to M', () => {
      expect(formatCompact(1_500_000)).toBe('1.5M');
      expect(formatCompact(-2_500_000)).toBe('-2.5M');
    });

    it('should format billions to B', () => {
      expect(formatCompact(1_200_000_000)).toBe('1.2B');
    });
  });

  describe('formatLatency', () => {
    it('should return "—" for null or undefined', () => {
      expect(formatLatency(null)).toBe('—');
      expect(formatLatency()).toBe('—');
    });

    it('should format ms to whole numbers if > 0 and < 1000', () => {
      expect(formatLatency(350)).toBe('350ms');
      expect(formatLatency(350.5)).toBe('351ms');
    });

    it('should format ms to seconds if >= 1000', () => {
      expect(formatLatency(1250)).toBe('1.3s');
      expect(formatLatency(1000)).toBe('1.0s');
    });
  });

  describe('formatPercent', () => {
    it('should return "—" for null or undefined', () => {
      expect(formatPercent(null)).toBe('—');
      expect(formatPercent()).toBe('—');
    });

    it('should format ratio to percentage string with 1 decimal', () => {
      expect(formatPercent(0.957)).toBe('95.7%');
      expect(formatPercent(1)).toBe('100.0%');
      expect(formatPercent(0.0123)).toBe('1.2%');
      expect(formatPercent(0)).toBe('0.0%');
    });
  });
});
