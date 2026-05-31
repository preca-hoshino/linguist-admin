// src/components/PermissionGuard.tsx — 权限保护组件

import type { ReactNode } from 'react';
import type { PermissionLevel, PermissionModule } from '@/types/permissions';
import { usePermission } from '@/stores/permission-store';

interface PermissionGuardProps {
  readonly module: PermissionModule;
  readonly level: PermissionLevel;
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

/**
 * 权限保护组件
 * 检查当前用户是否拥有指定权限，无权限时显示 fallback 或隐藏子组件
 *
 * @example
 * <PermissionGuard module="models" level="edit">
 *   <Button>Edit</Button>
 * </PermissionGuard>
 *
 * @example
 * <PermissionGuard module="settings" level="edit" fallback={<ReadOnlyBanner />}>
 *   <SettingsForm />
 * </PermissionGuard>
 */
export function PermissionGuard({ module, level, fallback = null, children }: PermissionGuardProps): ReactNode {
  const allowed = usePermission(module, level);
  if (!allowed) {
    return fallback;
  }
  return children;
}
