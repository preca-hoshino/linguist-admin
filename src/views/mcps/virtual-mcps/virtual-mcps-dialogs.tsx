import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { createVirtualMcp, deleteVirtualMcp, updateVirtualMcp } from '@/api/mcp/virtual-mcps';
import { CrudDialogs } from '@/components/crud-table';
import type { VirtualMcpCreateInput, VirtualMcpUpdateInput } from '@/types/mcp';
import { useVirtualMcps, type VirtualMcpsDialogType } from './virtual-mcps-context';
import { MutateVirtualMcpDialog } from './virtual-mcps-mutate-dialog';

export function VirtualMcpsDialogs(): React.JSX.Element {
  const { t } = useTranslation();
  const ctx = useVirtualMcps();
  const { open, setOpen, currentRow, setCurrentRow, loadData } = ctx;

  const handleOpenChange = (type: VirtualMcpsDialogType, isOpen: boolean): void => {
    if (isOpen) {
      setOpen(type);
    } else {
      setOpen(null);
      setTimeout(() => {
        setCurrentRow(null);
      }, 200);
    }
  };

  const row = currentRow as { readonly id: string; readonly name?: string } | null;

  return (
    <>
      <MutateVirtualMcpDialog
        key={currentRow?.id ?? 'new'}
        open={open === 'create'}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            handleOpenChange('create', true);
          } else {
            handleOpenChange('create', false);
          }
        }}
        mode="create"
        onSubmit={async (data) => {
          const res = await createVirtualMcp(data as VirtualMcpCreateInput);
          if (res.ok) {
            toast.success(t('mcpsPage.virtualMcps.createdSuccess', 'Virtual MCP created'));
            handleOpenChange('create', false);
            await loadData();
          }
        }}
      />

      <MutateVirtualMcpDialog
        open={open === 'update'}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            handleOpenChange('update', true);
          } else {
            handleOpenChange('update', false);
          }
        }}
        mode="edit"
        initialData={row}
        onSubmit={async (data) => {
          if (!row) {
            return;
          }
          const res = await updateVirtualMcp(row.id, data as VirtualMcpUpdateInput);
          if (res.ok) {
            toast.success(t('mcpsPage.virtualMcps.updatedSuccess', 'Virtual MCP updated'));
            handleOpenChange('update', false);
            await loadData();
          }
        }}
      />

      <CrudDialogs<VirtualMcpsDialogType>
        dialogState={ctx}
        onDelete={async (id) => {
          const res = await deleteVirtualMcp(id);
          if (res.ok) {
            toast.success(t('mcpsPage.virtualMcps.deletedSuccess', 'Virtual MCP deleted'));
            return true;
          }
          throw new Error(res.error.message);
        }}
        onBatchDelete={async (ids) => {
          let count = 0;
          for (const id of ids) {
            await deleteVirtualMcp(id);
            count++;
          }
          return count;
        }}
        deleteDialogType="delete"
        batchDeleteDialogType="batch-delete"
        onSuccess={loadData}
        deleteTitle={t('mcpsPage.virtualMcps.deleteTitle', 'Delete Virtual MCP')}
        deleteDescription={t('mcpsPage.virtualMcps.deleteConfirm', 'Are you sure you want to delete this virtual MCP?')}
      />
    </>
  );
}
