import { Outlet } from '@tanstack/react-router';
import { SkipToMain } from '@/components/SkipToMain';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/layouts/nav/AppSidebar';
import { Header } from '@/layouts/Header';
import { LayoutProvider } from '@/providers/LayoutProvider';
import { SearchProvider } from '@/providers/SearchProvider';
import { getCookie } from '@/utils/cookies';
import { cn } from '@/utils/utils';

interface AuthenticatedLayoutProps {
  readonly children?: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps): React.JSX.Element {
  const defaultOpen = getCookie('sidebar_state') !== 'false';
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',
            )}
          >
            <Header fixed />
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  );
}
