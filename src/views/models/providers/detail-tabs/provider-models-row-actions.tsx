import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Link } from '@tanstack/react-router';
import type { Row } from '@tanstack/react-table';
import { Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateProviderModel } from '@/api/model/provider-models';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { PermissionGuard } from '@/components/PermissionGuard';
import type { ProviderModel } from '@/types';
import { useProviderModelsContext } from './provider-models-context';

interface ProviderModelsRowActionsProps {
  readonly row: Row<ProviderModel>;
}

export function ProviderModelsRowActions({ row }: ProviderModelsRowActionsProps): React.JSX.Element {
  const model = row.original;
  const { t } = useTranslation();
  const { setOpen, setCurrentRow, loadModels } = useProviderModelsContext();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (): Promise<void> => {
    try {
      setIsToggling(true);
      await updateProviderModel(model.id, { is_active: !model.is_active });
      await loadModels();
    } finally {
      setIsToggling(false);
    }
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
        <DropdownMenuItem asChild>
          <Link to="/models/provider-models/$id" params={{ id: model.id }}>
            <Eye className="mr-2 h-4 w-4" />
            {t('modelsPage.providerModels.detail', 'View Details')}
          </Link>
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
        <DropdownMenuItem
          onClick={() => {
            void handleToggle();
          }}
          disabled={isToggling}
        >
          {model.is_active ? (
            <>
              <PowerOff className="mr-2 h-4 w-4 text-orange-500" />
              {t('modelsPage.providerModels.toggleDisable', 'Disable')}
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4 text-green-500" />
              {t('modelsPage.providerModels.toggleEnable', 'Enable')}
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <PermissionGuard module="models" level="edit">
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
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
