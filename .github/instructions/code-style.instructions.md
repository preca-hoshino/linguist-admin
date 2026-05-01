---
description: '代码风格规范 — 命名、组件声明、Props、类型使用'
applyTo: 'src/**/*.ts, src/**/*.tsx'
---

# 代码风格规范

## 概述
本文件定义 Linguist-Admin 前端项目的 TypeScript/React 代码风格约束，覆盖命名规范、组件声明、Props 类型、CSS 类名合并和禁止 `any` 的策略。

---

## 核心规则

### 1. 命名规范

| 目标 | 规范 | 示例 |
|------|------|------|
| 文件名 | `kebab-case` | `auth-store.ts`, `use-theme.ts`, `data-table.tsx` |
| 目录名 | `kebab-case` | `request-logs/`, `data-table/` |
| React 组件 | `PascalCase` | `AuthenticatedLayout`, `ThemeSwitch`, `DataTable` |
| 函数 / 变量 | `camelCase` | `fetchMe()`, `accessToken`, `isLoading` |
| 常量 | `UPPER_SNAKE_CASE` | `ACCESS_TOKEN_KEY`, `DEFAULT_TIMEOUT_MS` |
| 类型 / 接口 | `PascalCase` | `ApiResult<T>`, `AuthState`, `User` |

### 2. 函数式组件声明

**DO** — 使用 `function` 关键字声明组件：

```typescript
// ✅ 正确
export function ComponentName(): React.JSX.Element {
  return <div>...</div>;
}
```

```typescript
// ❌ 错误 — 不要用 const + 箭头函数
export const ComponentName: React.FC = () => <div>...</div>;
```

### 3. Props 类型规范

**DO** — 使用 `interface` 声明 Props，字段标记 `readonly`：

```typescript
// ✅ 正确
interface UserCardProps {
  readonly user: User;
  readonly onDelete?: (id: string) => void;
}

export function UserCard({ user, onDelete }: UserCardProps): React.JSX.Element {
  // ...
}
```

```typescript
// ❌ 错误 — 缺少 readonly，直接内联
function UserCard({ user: any, onDelete }: any) { ... }
```

### 4. `cn()` — CSS 类名合并

使用 `cn()`（基于 `clsx` + `tailwind-merge`）合并类名：

```typescript
import { cn } from '@/utils/utils';

// ✅ 正确 — 条件类名自动合并，Tailwind 冲突自动解决
<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-primary text-primary-foreground',
  disabled && 'opacity-50 cursor-not-allowed'
)} />

// ❌ 错误 — 模板字符串拼接，Tailwind 冲突无法解决
<button className={`px-4 py-2 ${variant === 'primary' ? 'bg-primary' : 'bg-secondary'}`} />
```

### 5. 禁止 `any` 的替代方案

```typescript
// ❌ 禁止
function process(data: any): any { ... }
const props: any = { ... };

// ✅ 未知类型用 unknown
function process(data: unknown): Record<string, unknown> { ... }

// ✅ 泛型约束
function request<T>(method: string, path: string): Promise<ApiResult<T>> { ... }

// ✅ 类型守卫
if (typeof err === 'object' && err !== null && 'message' in err) { ... }
```

### 6. ESM 模块系统

项目使用 `"type": "module"`（ESM），所有 import/export 使用 ES 模块语法：

```typescript
// ✅ ESM
import { useState } from 'react';
export function useTheme(): ThemeState { ... }
```

---

## 常见陷阱

| 陷阱 | 正确做法 |
|------|----------|
| 用 `any` 规避类型检查 | 使用 `unknown` + 类型守卫或泛型 |
| 用 `const` + 箭头函数声明组件 | 使用 `function` 关键字 |
| Props 类型使用 `type` | 使用 `interface` + readonly |
| 手动拼接 className 字符串 | 使用 `cn()` |
| 忘记 `readonly` 标记 Props 字段 | 所有 Props 字段必须是 `readonly` |
| 在文件名中使用 PascalCase | 文件/目录名始终用 kebab-case |

## 项目参考

- `src/utils/utils.ts` — `cn()` 函数定义
- `src/stores/auth-store.ts` — interface 声明 + Hook 使用范例
- `src/types/api.ts` — `ApiResult<T>` 可辨识联合类型范例
