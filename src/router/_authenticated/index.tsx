import { createFileRoute } from '@tanstack/react-router';
import type { DashboardMode } from '@/types/dashboard';
import { DASHBOARD_MODES } from '@/types/dashboard';
import { DashboardPage } from '@/views/dashboard';

interface DashboardSearch {
  mode?: DashboardMode;
}

export const Route = createFileRoute('/_authenticated/')({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      mode: DASHBOARD_MODES.includes(search.mode as DashboardMode) ? (search.mode as DashboardMode) : 'model',
    };
  },
  component: DashboardPage,
});
