import { createFileRoute } from '@tanstack/react-router';
import { McpProviderMcpsPage } from '@/views/mcps/provider-mcps';

export const Route = createFileRoute('/_authenticated/mcps/provider-mcps/')({
  component: McpProviderMcpsPage,
});
