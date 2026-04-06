import { createFileRoute } from '@tanstack/react-router';
import { ApiKeysPage } from '@/views/api-keys';

export const Route = createFileRoute('/_authenticated/api-keys/')({
  component: ApiKeysPage,
});
