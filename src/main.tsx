import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/Sonner';
import { DirectionProvider } from '@/providers/DirectionProvider';
import { FontProvider } from '@/providers/FontProvider';
import { LocaleProvider } from '@/providers/LocaleProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { UI_BASE } from './config/runtime';
import { routeTree } from './routeTree.gen';
import './styles/index.css';

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  basepath: UI_BASE,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.querySelector('#root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <ThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <RouterProvider router={router} />
                <Toaster />
              </DirectionProvider>
            </FontProvider>
          </ThemeProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
