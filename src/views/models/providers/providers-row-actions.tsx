import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Link } from '@tanstack/react-router';
import type { Row } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
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
import type { Provider } from '@/types';
import { useProviders } from './providers-context';

interface ProvidersRowActionsProps {
  readonly row: Row<Provider>;
}

export function ProvidersRowActions({ row }: ProvidersRowActionsProps): React.JSX.Element {
  const provider = row.original;
  const { t } = useTranslation();
  const { setOpen, setCurrentRow } = useProviders();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(provider);
            setOpen('update');
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('modelsPage.providers.edit', 'Edit')}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/models/providers/$id" params={{ id: provider.id }}>
            <Eye className="mr-2 h-4 w-4" />
            {t('modelsPage.providers.detail', 'Details')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <PermissionGuard module="models" level="edit">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(provider);
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
