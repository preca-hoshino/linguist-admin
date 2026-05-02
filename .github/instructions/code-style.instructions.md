---
description: '代码风格规范 — 命名、组件声明、Props、类型使用'
applyTo: 'src/**/*.ts, src/**/*.tsx'
---

# 代码风格规范

---

## 1. 命名规范

| 目标 | 规范 | 示例 |
|------|------|------|
| 文件名 / 目录名 | `kebab-case` | `auth-store.ts`, `use-theme.ts`, `data-table/` |
| React 组件 | `PascalCase` | `AuthenticatedLayout`, `ThemeSwitch` |
| 函数 / 变量 | `camelCase` | `fetchMe()`, `accessToken` |
| 常量 | `UPPER_SNAKE_CASE` | `ACCESS_TOKEN_KEY`, `DEFAULT_TIMEOUT_MS` |
| 类型 / 接口 | `PascalCase` | `ApiResult<T>`, `AuthState` |

## 2. 函数式组件声明

```typescript
// ✅ 用 function 关键字
export function ComponentName(): React.JSX.Element { return <div>...</div>; }

// ❌ 禁止 const + 箭头函数
export const ComponentName: React.FC = () => <div>...</div>;
```

## 3. Props 类型规范

```typescript
// ✅ interface + readonly
interface UserCardProps {
  readonly user: User;
  readonly onDelete?: (id: string) => void;
}

export function UserCard({ user, onDelete }: UserCardProps): React.JSX.Element { ... }
```

## 4. `cn()` — CSS 类名合并

```typescript
import { cn } from '@/utils/utils';

// ✅ cn() 自动合并 + 解决 Tailwind 冲突
<button className={cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-primary text-primary-foreground',
  disabled && 'opacity-50 cursor-not-allowed'
)} />

// ❌ 禁止模板字符串拼接 — Tailwind 冲突无法解决
```

## 5. 禁止 `any`

```typescript
// ❌ 禁止 any
function process(data: any): any { ... }

// ✅ unknown + 类型守卫
function process(data: unknown): Record<string, unknown> { ... }

// ✅ 泛型约束
function request<T>(method: string, path: string): Promise<ApiResult<T>> { ... }
```

## 6. ESM 模块系统

项目使用 `"type": "module"`。所有 import/export 使用 ES 模块语法。
