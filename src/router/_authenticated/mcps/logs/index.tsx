import { createFileRoute } from '@tanstack/react-router';
import { McpLogsPage } from '@/views/mcps/logs';

export const Route = createFileRoute('/_authenticated/mcps/logs/')({
  component: McpLogsPage,
});
