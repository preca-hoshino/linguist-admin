import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '../Header';

vi.mock('@/components/connect-drawer', () => ({
  ConnectDrawer: (): React.ReactNode => <div data-testid="mock-connect-drawer" />,
}));

vi.mock('@/providers/ThemeProvider', () => ({
  useTheme: (): { theme: string; setTheme: ReturnType<typeof vi.fn> } => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('@/providers/LocaleProvider', () => ({
  useLocale: (): { locale: string; setLocale: ReturnType<typeof vi.fn> } => ({ locale: 'en', setLocale: vi.fn() }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: (): { t: (k: string) => string } => ({ t: (k: string): string => k }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (): { auth: { user: { username: string; email: string }; reset: ReturnType<typeof vi.fn> } } => ({
    auth: { user: { username: 'testuser', email: 'test@example.com' }, reset: vi.fn() },
  }),
}));

vi.mock('@/providers/SearchProvider', () => ({
  useSearch: (): { setOpen: ReturnType<typeof vi.fn> } => ({ setOpen: vi.fn() }),
}));

vi.mock('@/providers/HeaderSlotProvider', () => ({
  useHeaderSlotContent: (): React.ReactNode => null,
}));

vi.mock('@tanstack/react-router', () => ({
  useRouter: (): { state: { location: { pathname: string } } } => ({ state: { location: { pathname: '/' } } }),
  Link: ({
    children,
    to,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }): React.ReactNode => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
}));

vi.stubGlobal(
  'ResizeObserver',
  class {
    public observe(): void {
      /* mock */
    }
    public unobserve(): void {
      /* mock */
    }
    public disconnect(): void {
      /* mock */
    }
  },
);

describe('Header Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderWithProviders(): ReturnType<typeof render> {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <Header />
        </SidebarProvider>
      </QueryClientProvider>,
    );
  }

  it('should render without crashing', () => {
    const { container } = renderWithProviders();
    expect(container).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = renderWithProviders();
    expect(container).toMatchSnapshot();
  });
});
