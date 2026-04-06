import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout';
import { useAuthStore } from '@/stores/authStore';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState();
    if (!auth.accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});
