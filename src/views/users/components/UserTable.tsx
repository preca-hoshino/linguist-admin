import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { User } from '@/api/users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  selectedIds,
  onSelectionChange,
}: Readonly<UserTableProps>): React.JSX.Element {
  const { t } = useTranslation();

  const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));
  const someSelected = users.some((u) => selectedIds.includes(u.id));

  const toggleAll = (): void => {
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !users.some((u) => u.id === id)));
    } else {
      const newIds = users.map((u) => u.id).filter((id) => !selectedIds.includes(id));
      onSelectionChange([...selectedIds, ...newIds]);
    }
  };

  const toggleOne = (id: string): void => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected || (someSelected ? 'indeterminate' : false)}
                onCheckedChange={() => toggleAll()}
                aria-label={t('common.selectAll', 'Select all')}
              />
            </TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>{t('users.username', 'Username')}</TableHead>
            <TableHead>{t('users.email', 'Email')}</TableHead>
            <TableHead>{t('users.status', 'Status')}</TableHead>
            <TableHead>{t('users.createdAt', 'Created')}</TableHead>
            <TableHead className="w-24 text-right">{t('common.actions', 'Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('common.loading', 'Loading...')}
                </span>
              </TableCell>
            </TableRow>
          )}
          {!loading && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                {t('users.empty', 'No users found')}
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            users.length > 0 &&
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={() => toggleOne(user.id)}
                    aria-label={t('common.selectRow', 'Select row')}
                  />
                </TableCell>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.username} />}
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        onEdit(user);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        onDelete(user);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
