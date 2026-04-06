import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  public observe(): void {
    /* mock */
  }
  public unobserve(): void {
    /* mock */
  }
  public disconnect(): void {
    /* mock */
  }
} as typeof ResizeObserver;

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  public readonly root: Element | Document | null = null;
  public readonly rootMargin: string = '';
  public readonly scrollMargin: string = '';
  public readonly thresholds: readonly number[] = [];
  public disconnect = vi.fn();
  public observe = vi.fn();
  public takeRecords = vi.fn().mockReturnValue([]);
  public unobserve = vi.fn();
} as unknown as typeof IntersectionObserver;

// Mock scrollIntoView
globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();
globalThis.HTMLElement.prototype.hasPointerCapture = vi.fn();
globalThis.HTMLElement.prototype.releasePointerCapture = vi.fn();
