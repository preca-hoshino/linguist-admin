import { createFileRoute } from '@tanstack/react-router';
import { McpVirtualMcpsPage } from '@/views/mcps/virtual-mcps';

export const Route = createFileRoute('/_authenticated/mcps/virtual-mcps/')({
  component: McpVirtualMcpsPage,
});
