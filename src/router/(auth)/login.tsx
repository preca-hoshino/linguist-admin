import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { LoginPage } from '@/views/auth/LoginPage';

export const Route = createFileRoute('/(auth)/login')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState();
    if (auth.accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});
