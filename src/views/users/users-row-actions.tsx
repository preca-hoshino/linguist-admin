import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { Row } from '@tanstack/react-table';
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateUserApi, type User } from '@/api/users';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { PermissionGuard } from '@/components/PermissionGuard';
import { usePermissionStore } from '@/stores/permission-store';
import { canManageUser } from '@/types/permissions';
import { useUsers } from './users-context';

interface UsersRowActionsProps {
  readonly row: Row<User>;
}

export function UsersRowActions({ row }: UsersRowActionsProps): React.JSX.Element {
  const model = row.original;
  const { t } = useTranslation();
  const { setOpen, setCurrentRow, loadUsers } = useUsers();
  const myPermissions = usePermissionStore((s) => s.permissions);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = (): void => {
    void (async (): Promise<void> => {
      try {
        setIsToggling(true);
        await updateUserApi(model.id, { is_active: !model.is_active });
        await loadUsers();
      } finally {
        setIsToggling(false);
      }
    })();
  };

  const canDelete = myPermissions && model.permissions && canManageUser(myPermissions, model.permissions);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 border-0 shadow-none hover:bg-muted data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(model);
            setOpen('update');
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('common.edit', 'Edit')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleToggle} disabled={isToggling}>
          {model.is_active ? (
            <>
              <PowerOff className="mr-2 h-4 w-4 text-orange-500" />
              {t('common.inactive', 'Disable')}
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4 text-green-500" />
              {t('common.active', 'Enable')}
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <PermissionGuard module="users" level="edit">
          {canDelete && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(model);
                setOpen('delete');
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('common.delete', 'Delete')}
            </DropdownMenuItem>
          )}
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
