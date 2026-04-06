import { createFileRoute } from '@tanstack/react-router';
import { ModelProvidersPage } from '@/views/models/providers';

export const Route = createFileRoute('/_authenticated/models/providers/')({
  component: ModelProvidersPage,
});
