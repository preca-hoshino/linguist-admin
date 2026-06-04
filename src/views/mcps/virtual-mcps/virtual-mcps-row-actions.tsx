import { Link } from '@tanstack/react-router';
import { Edit, Eye, MoreHorizontal, Power, PowerOff, Trash } from 'lucide-react';
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
import type { VirtualMcp } from '@/types/mcp';
import { useVirtualMcps } from './virtual-mcps-context';

interface VirtualMcpsRowActionsProps {
  readonly server: VirtualMcp;
  readonly onToggleActive: (id: string, current: boolean) => void;
}

export function VirtualMcpsRowActions({ server, onToggleActive }: VirtualMcpsRowActionsProps): React.JSX.Element {
  const { setOpen, setCurrentRow } = useVirtualMcps();
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
            setCurrentRow(server);
            setOpen('update');
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
              setCurrentRow(server);
              setOpen('delete');
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
