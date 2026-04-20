import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LangSwitch } from '../LangSwitch';
import { SignOutDialog } from '../SignOutDialog';
import { ThemeSwitch } from '../ThemeSwitch';

vi.mock('@/providers/ThemeProvider', () => ({
  useTheme: (): { theme: string; setTheme: ReturnType<typeof vi.fn> } => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/providers/LocaleProvider', () => ({
  useLocale: (): { locale: string; setLocale: ReturnType<typeof vi.fn> } => ({ locale: 'en', setLocale: vi.fn() }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: (): { t: (k: string) => string } => ({ t: (k: string): string => k }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (): { auth: { reset: ReturnType<typeof vi.fn> } } => ({ auth: { reset: vi.fn() } }),
}));

// Mock ResizeObserver for Radix UI Components in JSDOM
class ResizeObserver {
  public observe(): void {
    /* noop */
  }
  public unobserve(): void {
    /* noop */
  }
  public disconnect(): void {
    /* noop */
  }
}
globalThis.ResizeObserver = ResizeObserver;

describe('UI Component Smoke Tests', () => {
  it('ThemeSwitch should render without crashing', () => {
    const { container } = render(<ThemeSwitch />);
    expect(container).toBeInTheDocument();
  });

  it('LangSwitch should render without crashing', () => {
    const { container } = render(<LangSwitch />);
    expect(container).toBeInTheDocument();
  });

  it('SignOutDialog should render without crashing', () => {
    const { container, baseElement } = render(
      <SignOutDialog
        open={true}
        onOpenChange={() => {
          /* noop */
        }}
      />,
    );
    expect(container).toBeInTheDocument();
    // Radix Dialog portals to body
    expect(baseElement.textContent).toContain('auth.signOut');
  });
});
