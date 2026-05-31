import { Link } from '@tanstack/react-router';
import { Edit, Eye, MoreHorizontal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { PermissionGuard } from '@/components/PermissionGuard';
import type { McpProvider } from '@/types/mcp';
import { useProviders } from './providers-context';

import { useTranslation } from 'react-i18next';

export function ProvidersRowActions({ provider }: { readonly provider: McpProvider }): React.JSX.Element {
  const { setDialogState } = useProviders();
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
          <Link to="/mcps/providers/$id" params={{ id: provider.id }}>
            <Eye className="mr-2 h-4 w-4" />
            {t('common.viewDetails', 'View Details')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setDialogState((prev) => ({ ...prev, editOpen: true, selectedProvider: provider }));
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
              setDialogState((prev) => ({ ...prev, deleteOpen: true, selectedProvider: provider }));
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
