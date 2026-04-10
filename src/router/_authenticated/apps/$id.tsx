import { createFileRoute } from '@tanstack/react-router';
import { AppDetailPage } from '@/views/apps/app-detail-page';

export const Route = createFileRoute('/_authenticated/apps/$id')({
  component: AppDetailPage,
});
