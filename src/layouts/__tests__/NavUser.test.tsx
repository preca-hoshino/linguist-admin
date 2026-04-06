import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SidebarProvider } from '@/components/ui/Sidebar';
import { NavUser } from '../NavUser';

vi.mock('react-i18next', () => ({
  useTranslation: (): { t: (k: string) => string } => ({ t: (k: string): string => k }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
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

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (): { auth: { user: { username: string; email: string }; reset: ReturnType<typeof vi.fn> } } => ({
    auth: { user: { username: 'testuser', email: 'test@example.com' }, reset: vi.fn() },
  }),
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

describe('NavUser Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <SidebarProvider>
        <NavUser />
      </SidebarProvider>,
    );
    expect(container).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(
      <SidebarProvider>
        <NavUser />
      </SidebarProvider>,
    );
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(
      <SidebarProvider>
        <NavUser />
      </SidebarProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
