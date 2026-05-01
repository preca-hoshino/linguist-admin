---
description: '路由规范 — TanStack Router 文件路由、鉴权守卫、类型安全导航'
applyTo: 'src/router/**/*.tsx'
---

# 路由规范

## 概述
本文件定义 Linguist-Admin 的路由体系：使用 TanStack Router v1 文件式路由，`_authenticated` 路由组做鉴权守卫，以及类型安全的导航模式。

---

## 核心规则

### 1. 文件式路由

路由文件放在 `src/router/`，路由树由插件自动生成：

```
src/router/
├── __root.tsx                      # 根布局（Auth 初始化）
├── _authenticated.tsx              # 鉴权守卫 + 布局
├── _authenticated/
│   ├── index.tsx                   # /dash/ → Dashboard
│   ├── mcps.tsx                    # /dash/mcps → MCP 管理
│   ├── models.tsx                  # /dash/models → 模型管理
│   ├── users.tsx                   # /dash/users → 用户管理
│   ├── settings.tsx                # /dash/settings → 设置
│   └── apps.tsx                    # /dash/apps → 应用管理
├── (auth)/
│   └── login.tsx                   # /dash/login → 登录
└── routeTree.gen.ts                # ⚠️ 自动生成，禁止手动编辑
```

**`routeTree.gen.ts`** 由 `@tanstack/router-plugin` 自动生成，**绝对禁止手动编辑**。重新生成命令：

```bash
npm run dev    # Vite 开发模式下自动监听路由文件变化
```

### 2. 根路由 — `__root.tsx`

应用入口，负责 Auth 初始化：

```typescript
import { createRootRoute, Outlet } from '@tanstack/react-router';

function RootComponent(): React.JSX.Element {
  const isInitialized = useAuthStore((s) => s.auth.isInitialized);

  useEffect(() => {
    const { auth } = useAuthStore.getState();
    if (!auth.isInitialized) {
      void auth.initUser();
    }
  }, []);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootComponent,
});
```

### 3. 鉴权守卫 — `_authenticated.tsx`

```typescript
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState();
    if (!auth.accessToken) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' });
    }
  },
  component: AuthenticatedLayout,
});
```

**`_authenticated` 路由组**：
- 使用下划线前缀 `_` → URL 路径中不显示
- `beforeLoad` 在渲染前执行，无 token 则 redirect
- 所有需要登录的页面放在 `_authenticated/` 目录下
- `(auth)` 路由组使用括号 → 纯逻辑分组，不影响 URL

### 4. 导航 — 使用 `useNavigate()`

```typescript
import { useNavigate } from '@tanstack/react-router';

function MyComponent(): React.JSX.Element {
  const navigate = useNavigate();

  // ✅ 正确 — 类型安全导航
  navigate({ to: '/users' });
  navigate({ to: '/models/$modelId', params: { modelId: '123' } });
}
```

```typescript
// ❌ 错误 — 不要用 window.location
window.location.href = '/dash/users';
```

### 5. 路由文件模板

```typescript
import { createFileRoute } from '@tanstack/react-router';

function PageComponent(): React.JSX.Element {
  return (
    <div>
      <h1>Page Title</h1>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/my-page')({
  component: PageComponent,
});
```

---

## 常见陷阱

| 陷阱 | 正确做法 |
|------|----------|
| 手动编辑 `routeTree.gen.ts` | 由 Vite 插件自动生成 |
| 使用 `window.location` 导航 | 使用 `useNavigate()` |
| 在 `beforeLoad` 中使用 async/await 不 throw | 使用 `throw redirect()` 中断渲染 |
| 路由文件不按命名规范 | 文件名 = 路由路径（kebab-case） |

## 项目参考

- `src/router/__root.tsx` — 根路由 + Auth 初始化
- `src/router/_authenticated.tsx` — 鉴权守卫 + AuthenticatedLayout
- `src/router/_authenticated/index.tsx` — Dashboard 首页
- `tsr.config.json` — TanStack Router CLI 配置
