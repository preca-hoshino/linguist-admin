import { createFileRoute } from '@tanstack/react-router';
import { ModelLogsPage } from '@/views/models/logs';

export const Route = createFileRoute('/_authenticated/models/logs/')({
  component: ModelLogsPage,
});
