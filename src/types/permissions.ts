// src/types/permissions.ts — 前端权限模型类型定义

/**
 * 权限模块列表
 */
export const PERMISSION_MODULES = ['models', 'mcp', 'apps', 'users', 'settings'] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

/**
 * 权限级别：view（只读）、edit（读写）
 * 所有登录用户默认拥有 view 权限
 * edit 隐含 view
 */
export type PermissionLevel = 'view' | 'edit';

/**
 * 用户权限对象 — 每个模块独立权限级别
 */
export interface UserPermissions {
  readonly models: PermissionLevel;
  readonly mcp: PermissionLevel;
  readonly apps: PermissionLevel;
  readonly users: PermissionLevel;
  readonly settings: PermissionLevel;
}

/**
 * 默认权限（全部 view — 由管理员显式提升）
 */
export const DEFAULT_PERMISSIONS: UserPermissions = {
  models: 'view',
  mcp: 'view',
  apps: 'view',
  users: 'view',
  settings: 'view',
} as const;

/**
 * 权限级别数值映射（用于比较）
 */
const LEVEL_VALUE: Record<PermissionLevel, number> = {
  view: 1,
  edit: 2,
} as const;

/**
 * 检查权限是否满足要求（edit 隐含 view）
 */
export function hasPermission(permissions: UserPermissions, module: PermissionModule, level: PermissionLevel): boolean {
  return LEVEL_VALUE[permissions[module]] >= LEVEL_VALUE[level];
}

/**
 * 检查是否拥有全部模块的 edit 权限
 */
export function isFullAccess(permissions: UserPermissions): boolean {
  return PERMISSION_MODULES.every((m) => permissions[m] === 'edit');
}

/**
 * 检查 operator 是否有权限管理 target（操作者的权限覆盖目标用户）
 * 所有模块中，operator 的级别必须 >= target 的级别
 */
export function canManageUser(operator: UserPermissions, target: UserPermissions): boolean {
  return PERMISSION_MODULES.every((m) => LEVEL_VALUE[operator[m]] >= LEVEL_VALUE[target[m]]);
}

/**
 * 模块显示名映射（i18n key 引用，组件层使用 t() 翻译）
 */
export const PERMISSION_MODULE_LABELS: Record<PermissionModule, string> = {
  models: 'users.permissions.modules.models',
  mcp: 'users.permissions.modules.mcp',
  apps: 'users.permissions.modules.apps',
  users: 'users.permissions.modules.users',
  settings: 'users.permissions.modules.settings',
} as const;

/**
 * 权限级别显示名映射
 */
export const PERMISSION_LEVEL_LABELS: Record<PermissionLevel, string> = {
  view: 'users.permissions.levels.view',
  edit: 'users.permissions.levels.edit',
} as const;
