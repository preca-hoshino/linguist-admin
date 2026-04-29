import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '../index';

vi.mock('@tanstack/react-router', () => ({
  getRouteApi: (): Record<string, unknown> => ({
    useSearch: (): Record<string, unknown> => ({ mode: 'model' }),
    useNavigate: (): unknown => vi.fn(),
  }),
  useNavigate: (): unknown => vi.fn(),
}));

vi.mock('@/providers/HeaderSlotProvider', () => ({
  useHeaderSlot: (): unknown => null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: (): { t: (k: string) => string } => ({ t: (k: string): string => k }),
}));

vi.mock('@/composables/use-today-stats', () => ({
  useTodayStats: (): Record<string, unknown> => ({
    today: null,
    overview: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/composables/use-usage-chart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/composables/use-usage-chart')>();
  return {
    ...actual,
    useUsageChart: (): Record<string, unknown> => ({
      data: [],
      loading: false,
      error: null,
    }),
  };
});

// Mock ResizeObserver for Recharts
class ResizeObserver {
  public observe(): void {
    /* ignore */
  }
  public unobserve(): void {
    /* ignore */
  }
  public disconnect(): void {
    /* ignore */
  }
}
globalThis.ResizeObserver = ResizeObserver;

vi.mock('@lobehub/icons', () => ({
  OpenAI: (): React.ReactElement => <div />,
  Anthropic: (): React.ReactElement => <div />,
  Ollama: (): React.ReactElement => <div />,
}));

// Mock matchMedia for Recharts responsive container if needed
if (typeof globalThis.matchMedia === 'undefined') {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: (): Record<string, unknown> => ({
      matches: false,
      addListener: (): void => {
        /* ignore */
      },
      removeListener: (): void => {
        /* ignore */
      },
      addEventListener: (): void => {
        /* ignore */
      },
      removeEventListener: (): void => {
        /* ignore */
      },
      dispatchEvent: (): boolean => false,
    }),
  });
}

describe('Dashboard Smoke Tests', () => {
  it('DashboardPage should render without crashing', () => {
    const { container } = render(<DashboardPage />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('h1')).toBeTruthy();
  });
});
