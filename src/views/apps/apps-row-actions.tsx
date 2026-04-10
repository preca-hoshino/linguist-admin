import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { Row } from '@tanstack/react-table';
import { Pencil, Power, PowerOff, Trash2, Key } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { updateApp } from '@/api/apps';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import type { App } from '@/types/app';
import { useApps } from './apps-context';

interface AppsRowActionsProps {
  readonly row: Row<App>;
}

export function AppsRowActions({ row }: AppsRowActionsProps): React.JSX.Element {
  const model = row.original;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setOpen, setCurrentRow, loadApps } = useApps();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = (): void => {
    void (async (): Promise<void> => {
      try {
        setIsToggling(true);
        await updateApp(model.id, { is_active: !model.is_active });
        await loadApps();
      } finally {
        setIsToggling(false);
      }
    })();
  };

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
            void navigate({ to: `/apps/${model.id}` });
          }}
        >
          <Key className="mr-2 h-4 w-4" />
          {t('apps.manageKeys', 'Manage Keys')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

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
              {t('apps.toggleDisable', 'Disable')}
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4 text-green-500" />
              {t('apps.toggleEnable', 'Enable')}
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
