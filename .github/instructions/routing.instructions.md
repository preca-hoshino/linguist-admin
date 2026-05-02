---
description: '路由规范 — TanStack Router 文件路由、鉴权守卫、类型安全导航'
applyTo: 'src/router/**/*.tsx'
---

# 路由规范

TanStack Router v1 文件式路由。`routeTree.gen.ts` 由插件自动生成，**禁止手动编辑**。

---

## 1. 文件式路由结构

```
src/router/
├── __root.tsx                      # 根布局（Auth 初始化）
├── _authenticated.tsx              # 鉴权守卫 + 布局
├── _authenticated/
│   ├── index.tsx                   # Dashboard
│   ├── mcps.tsx                    # MCP 管理
│   ├── models.tsx                  # 模型管理
│   ├── users.tsx                   # 用户管理
│   └── ...
├── (auth)/
│   └── login.tsx                   # 登录
└── routeTree.gen.ts                # ⚠️ 自动生成
```

`_authenticated` 下划线前缀 → URL 中不显示；`(auth)` 括号 → 纯逻辑分组。

## 2. 鉴权守卫

```typescript
// src/router/_authenticated.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState();
    if (!auth.accessToken) throw redirect({ to: '/login' });
  },
  component: AuthenticatedLayout,
});
```

## 3. 类型安全导航

```typescript
import { useNavigate } from '@tanstack/react-router';

const navigate = useNavigate();
navigate({ to: '/users' });
navigate({ to: '/models/$modelId', params: { modelId: '123' } });

// ❌ 禁止 window.location.href — 丢失类型安全
```

## 4. 路由文件模板

```typescript
import { createFileRoute } from '@tanstack/react-router';

function PageComponent(): React.JSX.Element {
  return <div><h1>Page Title</h1></div>;
}

export const Route = createFileRoute('/_authenticated/my-page')({
  component: PageComponent,
});
```
