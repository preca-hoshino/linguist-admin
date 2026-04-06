import { createFileRoute } from '@tanstack/react-router';
import { McpProvidersPage } from '@/views/mcps/providers';

export const Route = createFileRoute('/_authenticated/mcps/providers/')({
  component: McpProvidersPage,
});
