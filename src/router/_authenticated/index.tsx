import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/views/dashboard';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
});
