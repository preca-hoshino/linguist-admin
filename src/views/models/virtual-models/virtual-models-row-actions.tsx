import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Link } from '@tanstack/react-router';
import type { Row } from '@tanstack/react-table';
import { FileText, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateVirtualModel } from '@/api/model/virtual-models';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { PermissionGuard } from '@/components/PermissionGuard';
import type { VirtualModel } from '@/types';
import { useVirtualModels } from './virtual-models-context';

interface VirtualModelsRowActionsProps {
  readonly row: Row<VirtualModel>;
}

export function VirtualModelsRowActions({ row }: VirtualModelsRowActionsProps): React.JSX.Element {
  const model = row.original;
  const { t } = useTranslation();
  const { setOpen, setCurrentRow, loadVirtualModels } = useVirtualModels();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (): Promise<void> => {
    try {
      setIsToggling(true);
      await updateVirtualModel(model.id, { is_active: !model.is_active });
      await loadVirtualModels();
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
          <Link to="/models/virtual-models/$id" params={{ id: model.id }}>
            <FileText className="mr-2 h-4 w-4" />
            {t('modelsPage.virtualModels.detail', 'Details')}
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
        <DropdownMenuItem onClick={() => void handleToggle()} disabled={isToggling}>
          {model.is_active ? (
            <>
              <PowerOff className="mr-2 h-4 w-4 text-orange-500" />
              {t('modelsPage.virtualModels.toggleDisable', 'Disable')}
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4 text-green-500" />
              {t('modelsPage.virtualModels.toggleEnable', 'Enable')}
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
