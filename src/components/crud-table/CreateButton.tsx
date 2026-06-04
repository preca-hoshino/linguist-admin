import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/stores/permission-store';

interface CreateButtonProps {
  /** 权限模块名 */
  readonly module: string;
  /** 点击回调 */
  readonly onClick: () => void;
  /** 按钮文案 */
  readonly label?: string;
}

/**
 * 通用的"新建"按钮 — 带权限检查。
 * 替代所有 primary-buttons 文件中的重复按钮。
 */
export function CreateButton({ module, onClick, label }: CreateButtonProps): React.JSX.Element {
  const { t } = useTranslation();
  const canEdit = usePermission(module, 'edit');

  return (
    <Button disabled={!canEdit} onClick={onClick}>
      <Plus className="mr-2 h-4 w-4" />
      {label ?? t('common.create', 'Create')}
    </Button>
  );
}
