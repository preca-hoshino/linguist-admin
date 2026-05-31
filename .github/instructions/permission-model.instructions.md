---
description: '权限模型规范 — PermissionGuard、canManageUser、权限状态管理、UI 隐藏策略'
applyTo: 'src/types/permissions.ts, src/stores/permission-store.ts, src/components/PermissionGuard.tsx, src/router/_authenticated.tsx, src/views/users/**/*'
---

# 权限模型规范（前端）

基于 Scope 的 RBAC 前端实现。所有登录用户可访问所有页面，写操作由 `PermissionGuard` 控制 UI 可见性。

---

## 1. 权限类型

```typescript
// src/types/permissions.ts
export type PermissionLevel = 'view' | 'edit';
export const PERMISSION_MODULES = ['models', 'mcp', 'apps', 'users', 'settings'] as const;

export function hasPermission(permissions: UserPermissions, module: PermissionModule, level: PermissionLevel): boolean {
  return LEVEL_VALUE[permissions[module]] >= LEVEL_VALUE[level];
}

export function canManageUser(operator: UserPermissions, target: UserPermissions): boolean {
  return PERMISSION_MODULES.every((m) => LEVEL_VALUE[operator[m]] >= LEVEL_VALUE[target[m]]);
}
```

**与后端共享同一套类型定义**，确保前后端权限逻辑一致。

---

## 2. PermissionGuard 组件

```tsx
// 写操作按钮必须包裹 PermissionGuard
<PermissionGuard module="models" level="edit">
  <Button>创建提供商</Button>
</PermissionGuard>

// 带 fallback
<PermissionGuard module="models" level="edit" fallback={<ReadOnlyBanner />}>
  <SettingsForm />
</PermissionGuard>
```

**规则**：所有 CRUD 操作按钮（创建、编辑、删除、批量操作）必须用 `PermissionGuard` 包裹。只读数据展示不需要。

---

## 3. 路由守卫

```typescript
// src/router/_authenticated.tsx
// 仅检查认证状态，不按模块拦截路由
beforeLoad: () => {
  if (!auth.accessToken) throw redirect({ to: '/login' });
}
```

**设计决策**：所有登录用户可访问所有页面。写操作保护在页面内 `PermissionGuard` 层。理由：跨模块 API 调用（如 Apps 页面需要 `listVirtualModels()`）不应被路由拦截。

---

## 4. 侧边栏

```typescript
// src/layouts/data/sidebar-data.ts
// 所有菜单项对所有登录用户可见，不按权限过滤
export function getSidebarData(_language?: string): SidebarData { ... }
```

---

## 5. 用户管理页面特殊规则

### 5.1 权限天花板（canManageUser）

```tsx
// UserTable.tsx — 操作按钮受权限天花板约束
<PermissionGuard module="users" level="edit">
  {myPermissions && user.permissions && canManageUser(myPermissions, user.permissions) ? (
    <>
      <Button onClick={() => onEdit(user)}>编辑</Button>
      <Button onClick={() => onDelete(user)}>删除</Button>
    </>
  ) : (
    <span className="text-xs text-muted-foreground">—</span>
  )}
</PermissionGuard>
```

### 5.2 自编辑保护

```tsx
// UserMutateDialog.tsx
const isEditingSelf = isEdit && targetUser?.id === currentUser?.id;
// 编辑自己时禁用所有权限选择器
<Select disabled={isEditingSelf} ... />
```

### 5.3 批量删除排除自己

```tsx
// UsersPage
const idsToDelete = selectedIds.filter((id) => id !== currentUserId);
```

---

## 6. 权限状态管理

```typescript
// src/stores/permission-store.ts
export const usePermissionStore = create<PermissionState>()((set, get) => ({
  permissions: null,
  setUserPermissions: (user) => set({ permissions: user?.permissions ?? null }),
  hasPermission: (module, level) => { /* 调用 types/permissions.ts 的 hasPermission */ },
  reset: () => set({ permissions: null }),
}));
```

**登录后**：`fetchMe()` → `setUserPermissions(user)`  
**登出时**：`reset()`

---

## 7. 禁止事项

- ❌ 不要在路由守卫中按模块拦截（会阻断跨模块 API 调用）
- ❌ 不要在侧边栏按权限过滤菜单（所有用户应看到全部导航）
- ❌ 不要跳过 `PermissionGuard` 直接渲染写操作按钮
- ❌ 不要在用户管理页面跳过 `canManageUser` 天花板检查
- ❌ 不要允许批量删除包含自己
- ❌ 不要在前端硬编码权限值（使用 `hasPermission` 函数）
