// src/stores/permission-store.ts — 权限状态管理

import { create } from 'zustand';
import type { User } from '@/api/users';
import type { PermissionLevel, PermissionModule, UserPermissions } from '@/types/permissions';
import { hasPermission, isFullAccess } from '@/types/permissions';

interface PermissionState {
  permissions: UserPermissions | null;
  setPermissions: (permissions: UserPermissions) => void;
  setUserPermissions: (user: User | null) => void;
  hasPermission: (module: PermissionModule, level: PermissionLevel) => boolean;
  isFullAccess: () => boolean;
  getPermissions: () => UserPermissions | null;
  reset: () => void;
}

export const usePermissionStore = create<PermissionState>()((set, get) => ({
  permissions: null,

  setPermissions: (permissions): void => {
    set({ permissions });
  },

  setUserPermissions: (user): void => {
    if (user?.permissions) {
      set({ permissions: user.permissions });
    } else {
      set({ permissions: null });
    }
  },

  hasPermission: (module, level): boolean => {
    const { permissions } = get();
    if (!permissions) {
      return false;
    }
    return hasPermission(permissions, module, level);
  },

  isFullAccess: (): boolean => {
    const { permissions } = get();
    if (!permissions) {
      return false;
    }
    return isFullAccess(permissions);
  },

  getPermissions: (): UserPermissions | null => {
    return get().permissions;
  },

  reset: (): void => {
    set({ permissions: null });
  },
}));

/**
 * React Hook: 检查当前用户是否拥有指定权限
 */
export function usePermission(module: PermissionModule, level: PermissionLevel): boolean {
  return usePermissionStore((s) => {
    if (!s.permissions) {
      return false;
    }
    return hasPermission(s.permissions, module, level);
  });
}
