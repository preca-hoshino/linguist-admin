import type { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import type { User } from '@/api/users';
import { DataTableColumnHeader } from '@/components/data-table';
import { CopyableId } from '@/components/CopyableId';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { isFullAccess } from '@/types/permissions';
import { cn } from '@/utils/utils';
import { UsersRowActions } from './users-row-actions';

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

function PermissionsBadges({ user }: { readonly user: User }): React.JSX.Element {
  const { t } = useTranslation();
  if (!user.permissions || isFullAccess(user.permissions)) {
    return (
      <Badge variant="default" className="text-xs">
        {t('users.permissions.fullAccess', 'Full Access')}
      </Badge>
    );
  }
  const modules = Object.entries(user.permissions).filter(([, level]) => level === 'edit') as [string, string][];
  if (modules.length === 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        {t('users.permissions.levels.view', 'View Only')}
      </Badge>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {modules.map(([mod]) => (
        <Tooltip key={mod}>
          <TooltipTrigger>
            <Badge variant="default" className="text-xs">
              {t(`users.permissions.modules.${mod}`, mod)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{t('users.permissions.levels.edit', 'Edit')}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export function useUsersColumns(): ColumnDef<User>[] {
  const { t } = useTranslation();

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(value === true);
          }}
          aria-label={t('common.selectAll', 'Select all')}
        />
      ),
      meta: { className: 'w-10 ps-4', tdClassName: 'ps-4' },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(value === true);
          }}
          aria-label={t('common.selectRow', 'Select row')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      meta: { className: 'w-[100px]' },
      cell: ({ row }): React.JSX.Element => <CopyableId id={row.getValue<string>('id')} />,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'username',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('users.username', 'Username')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.username} />}
              <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.username}</span>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('users.email', 'Email')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => (
        <span className="text-sm text-muted-foreground">{row.getValue<string>('email')}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('users.status', 'Status')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const isActive = row.getValue<boolean>('is_active');
        return (
          <Badge
            variant="outline"
            className={cn(isActive ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground')}
          >
            {isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'permissions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('users.permissions.title', 'Permissions')} />
      ),
      meta: {},
      cell: ({ row }): React.JSX.Element => <PermissionsBadges user={row.original} />,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('users.createdAt', 'Created At')} />,
      meta: {},
      cell: ({ row }): React.JSX.Element => {
        const dateStr = row.getValue<string>('created_at');
        return (
          <span className="text-sm text-muted-foreground">{dateStr ? new Date(dateStr).toLocaleString() : '-'}</span>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }): React.JSX.Element => <UsersRowActions row={row} />,
    },
  ];
}
