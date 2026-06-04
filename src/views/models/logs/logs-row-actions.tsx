import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Link } from '@tanstack/react-router';
import type { Row } from '@tanstack/react-table';
import { Eye, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import type { RequestLog } from '@/types';
import { useLogs } from './logs-context';

interface LogsRowActionsProps {
  readonly row: Row<RequestLog>;
}

export function LogsRowActions({ row }: LogsRowActionsProps): React.JSX.Element {
  const log = row.original;
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useLogs();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link to="/models/logs/$id" params={{ id: log.id }}>
            <Eye className="mr-2 h-4 w-4" />
            {t('modelsPage.logs.view', 'Details')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <PermissionGuard module="models" level="edit">
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
