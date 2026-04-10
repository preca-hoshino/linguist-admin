import { createFileRoute } from '@tanstack/react-router';
import { getApp } from '@/api/apps';
import { AppDetailPage } from '@/views/apps/app-detail-page';

export const Route = createFileRoute('/_authenticated/apps/$id')({
  loader: async ({ params }) => {
    const res = await getApp(params.id);
    if (!res.ok) {
      throw new Error(res.error.message || 'Failed to fetch app');
    }
    return { app: res.data };
  },
  component: AppDetailPage,
});
