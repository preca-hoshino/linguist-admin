import { Link } from '@tanstack/react-router';
import { Edit, Eye, MoreHorizontal, Trash, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { PermissionGuard } from '@/components/PermissionGuard';
import type { VirtualMcp } from '@/types/mcp';
import { useVirtualMcps } from './virtual-mcps-context';
import { useTranslation } from 'react-i18next';

export function VirtualMcpsRowActions({
  server,
  onToggleActive,
}: {
  readonly server: VirtualMcp;
  readonly onToggleActive: (id: string, current: boolean) => void;
}): React.JSX.Element {
  const { setDialogState } = useVirtualMcps();
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
          <Link to="/mcps/virtual-mcps/$id" params={{ id: server.id }}>
            <Eye className="mr-2 h-4 w-4" />
            {t('common.viewDetails', 'View Details')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onToggleActive(server.id, server.is_active);
          }}
        >
          {server.is_active ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
          {server.is_active ? t('common.disable', 'Disable') : t('common.enable', 'Enable')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setDialogState((prev) => ({ ...prev, editOpen: true, selectedServer: server }));
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          {t('common.edit', 'Edit')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <PermissionGuard module="mcp" level="edit">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => {
              setDialogState((prev) => ({ ...prev, deleteOpen: true, selectedServer: server }));
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            {t('common.delete', 'Delete')}
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
