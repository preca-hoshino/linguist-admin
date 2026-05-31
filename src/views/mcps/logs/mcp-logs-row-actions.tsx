import { Link } from '@tanstack/react-router';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { PermissionGuard } from '@/components/PermissionGuard';
import type { McpLog } from '@/types/mcp';
import { useMcpLogs } from './mcp-logs-context';

export function McpLogsRowActions({ log }: { readonly log: McpLog }): React.JSX.Element {
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useMcpLogs();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link to="/mcps/logs/$id" params={{ id: log.id }}>
            <Eye className="mr-2 h-4 w-4" />
            {t('common.viewDetails', 'View Details')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <PermissionGuard module="mcp" level="edit">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(log);
              setOpen('delete');
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('common.delete', 'Delete')}
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
