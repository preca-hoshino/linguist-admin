import { Link } from '@tanstack/react-router';
import { Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import type { McpLog } from '@/types/mcp';
import { useTranslation } from 'react-i18next';

export function McpLogsRowActions({ log }: { readonly log: McpLog }): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
