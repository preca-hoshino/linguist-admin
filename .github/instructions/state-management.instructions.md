---
description: '状态管理规范 — Zustand 全局状态、React Context 页面状态、防重入'
applyTo: 'src/stores/**/*.ts, src/providers/**/*.tsx, src/composables/**/*.ts'
---

# 状态管理规范

Zustand 用于跨页面持久状态，React Context 用于依赖生命周期的 UI 状态。

---

## 1. Zustand — 全局状态

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    accessToken: '',
    isLoading: false,
    setUser: (user) => set((s) => ({ ...s, auth: { ...s.auth, user } })),
    setAccessToken: (accessToken) => set((s) => ({ ...s, auth: { ...s.auth, accessToken } })),
  },
}));
```

**Selector 精确订阅** — 避免不必要重渲染：

```typescript
// ✅ 精确订阅 — 只有对应字段变化才重渲染
const isLoading = useAuthStore((s) => s.auth.isLoading);
const user = useAuthStore((s) => s.auth.user);

// ❌ 禁止订阅整个 auth 对象导致全量重渲染
const { auth } = useAuthStore();

// 非组件代码用 getState()
const { auth } = useAuthStore.getState();
```

**`inFlight` 防重入**：

```typescript
let initInFlight = false;

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    initUser: async () => {
      if (initInFlight) return;
      initInFlight = true;
      try { /* ... */ } finally { initInFlight = false; }
    },
  },
}));
```

## 2. React Context — 页面级/UI 状态

Provider + Composable 配对模式：

```typescript
// src/providers/ThemeProvider.tsx
export function ThemeProvider({ children }: { readonly children: React.ReactNode }) {
  const themeState = useThemeLogic();
  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
}

// src/composables/use-theme.ts
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

## 3. Zustand vs Context 决策

- 数据需跨页面持久化 → **Zustand**（`src/stores/`）
- 状态依赖 React 生命周期或 DOM API → **React Context**（`src/providers/` + `src/composables/`）
- 复杂逻辑抽离到 `src/composables/` → 被 Context 和 Zustand action 复用
