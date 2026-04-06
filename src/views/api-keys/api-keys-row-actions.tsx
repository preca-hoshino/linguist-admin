import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import type { Row } from '@tanstack/react-table';
import { Pencil, Power, PowerOff, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateApiKey } from '@/api/api-keys';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import type { ApiKey } from '@/types';
import { useApiKeys } from './api-keys-context';

interface ApiKeysRowActionsProps {
  readonly row: Row<ApiKey>;
}

export function ApiKeysRowActions({ row }: ApiKeysRowActionsProps): React.JSX.Element {
  const model = row.original;
  const { t } = useTranslation();
  const { setOpen, setCurrentRow, loadApiKeys } = useApiKeys();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = (): void => {
    void (async (): Promise<void> => {
      try {
        setIsToggling(true);
        await updateApiKey(model.id, { is_active: !model.is_active });
        await loadApiKeys();
      } finally {
        setIsToggling(false);
      }
    })();
  };

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
            setCurrentRow(model);
            setOpen('update');
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          {t('common.edit', 'Edit')}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(model);
            setOpen('rotate');
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4 text-orange-500" />
          {t('common.rotate', 'Rotate')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleToggle} disabled={isToggling}>
          {model.is_active ? (
            <>
              <PowerOff className="mr-2 h-4 w-4 text-orange-500" />
              {t('apiKeys.toggleDisable', 'Disable')}
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4 text-green-500" />
              {t('apiKeys.toggleEnable', 'Enable')}
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
