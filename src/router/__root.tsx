import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

function RootComponent(): React.JSX.Element {
  const isInitialized = useAuthStore((s) => s.auth.isInitialized);

  useEffect(() => {
    // 使用选择器而非整个 auth 对象，避免 set() 创建新引用时触发 effect 循环
    const { auth } = useAuthStore.getState();
    if (!auth.isInitialized) {
      void auth.initUser();
    }
  }, []);

  // Don't render the app router until auth state is known,
  // otherwise authenticated routes might flash and redirect prematurely.
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootComponent,
});
