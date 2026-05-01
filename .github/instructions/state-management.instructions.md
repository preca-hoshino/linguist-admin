---
description: '状态管理规范 — Zustand 全局状态、React Context 页面状态、防重入'
applyTo: 'src/stores/**/*.ts, src/providers/**/*.tsx, src/composables/**/*.ts'
---

# 状态管理规范

## 概述
本文件定义 Linguist-Admin 的状态管理策略：Zustand 用于全局持久状态，React Context 用于页面级/UI 状态，以及 selector 优化和防重入模式。

---

## 核心规则

### 1. Zustand — 全局状态

**适用场景**：跨页面共享的持久状态（auth、用户偏好）

Store 放在 `src/stores/`，使用 `create()` 模式：

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';

export interface AuthState {
  auth: {
    user: User | null;
    accessToken: string;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setAccessToken: (accessToken: string) => void;
    reset: () => void;
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  auth: {
    user: null,
    accessToken: '',
    isLoading: false,
    setUser: (user) => set((state) => ({ ...state, auth: { ...state.auth, user } })),
    setAccessToken: (accessToken) => set((state) => ({
      ...state, auth: { ...state.auth, accessToken }
    })),
    reset: () => set((state) => ({
      ...state, auth: { ...state.auth, accessToken: '', user: null }
    })),
  },
}));
```

### 2. Selector 模式 — 避免不必要重渲染

**DO** — 订阅具体字段：

```typescript
// ✅ 正确 — 精确订阅，只有对应字段变化才重渲染
const isLoading = useAuthStore((s) => s.auth.isLoading);
const user = useAuthStore((s) => s.auth.user);
```

```typescript
// ❌ 错误 — 订阅整个 auth 对象，任何字段变化都触发重渲染
const { auth } = useAuthStore();
const { auth: { isLoading, user } } = useAuthStore(); // ← 会导致重渲染
```

**在非组件代码中读取**：

```typescript
// ✅ 正确 — 使用 getState()
const { auth } = useAuthStore.getState();
if (!auth.accessToken) {
  throw redirect({ to: '/login' });
}
```

### 3. `inFlight` 防重入标志

需要防重入的异步操作添加 `inFlight` 标志位：

```typescript
let initUserInFlight = false;

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    // ...
    initUser: async () => {
      // 防重入：避免 StrictMode 双重 mount 或并发调用
      if (initUserInFlight) return;
      initUserInFlight = true;

      try {
        // 异步初始化逻辑...
      } finally {
        initUserInFlight = false;
      }
    },
  },
}));
```

### 4. React Context — 页面级/UI 状态

**适用场景**：需要 React 生命周期管理的 UI 状态（Theme、Layout、Font、Direction）

```typescript
// ✅ Provider + Composable 配对模式
// src/providers/ThemeProvider.tsx
export function ThemeProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const themeState = useThemeLogic();

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}

// src/composables/use-theme.ts
export function useThemeLogic(): ThemeState {
  // 纯逻辑 hook
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

### 5. Zustand vs Context 决策表

| 特性 | Zustand | React Context |
|------|---------|---------------|
| **全局持久化** | ✅ 最佳选择 | ❌ 需要额外持久化层 |
| **跨页面共享** | ✅ 天然支持 | ⚠️ 需 Provider 在顶层 |
| **订阅粒度** | ✅ selector 精确订阅 | ❌ 整体更新 |
| **React 生命周期** | ⚠️ 外部 store | ✅ 使用 useEffect 等 |
| **DOM 操作** | ❌ 不应包含 | ✅ 在 Composable 中处理 |
| **使用位置** | `src/stores/` | `src/providers/` + `src/composables/` |

**简单原则**：
- 数据需要跨页面持久化 → **Zustand**
- 状态依赖 React 生命周期或 DOM API → **React Context**
- 复杂逻辑抽离到 `src/composables/` → Context 和 Zustand action 都可以调用

---

## 常见陷阱

| 陷阱 | 正确做法 |
|------|----------|
| 订阅整个 auth 对象导致全量重渲染 | 使用精确 selector |
| State 中存储可序列化到 Cookie 的数据但不同步 | setToken 时同时 `setCookie()` |
| 在 `useEffect` 中调用 store action 但不防重入 | 加 `inFlight` 标志位 |
| Context 和 Zustand 选择困难 | 用决策表判断 |
| 在组件外部用 hook 读取 store | 使用 `useStore.getState()` |

## 项目参考

- `src/stores/auth-store.ts` — Zustand store 标准范例（selector + inFlight + cookie 同步）
- `src/providers/ThemeProvider.tsx` — React Context + Composable 配对范例
- `src/composables/use-theme.ts` — 纯逻辑 Composable 范例
