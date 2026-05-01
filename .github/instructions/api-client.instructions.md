---
description: 'API 调用规范 — request()、ApiResult、错误处理、查询参数'
applyTo: 'src/api/**/*.ts'
---

# API 调用规范

## 概述
本文件定义 Linguist-Admin 前端调用后端 API 的统一规范：通过 `request<T>()` 发送请求，使用 `ApiResult<T>` 可辨识联合类型处理响应，禁止在 API 函数中抛出异常。

---

## 核心规则

### 1. `request<T>()` — 统一请求函数

定义在 `src/api/client.ts`：

```typescript
import { request } from '@/api/client';

const result = await request<User>('GET', '/users/me');
```

**签名**：
```typescript
async function request<T>(
  method: string,     // HTTP 方法
  path: string,       // API 路径（不含前缀）
  body?: unknown,      // 请求体（POST/PUT/PATCH）
  customConfig?: RequestInit,  // 自定义 fetch 选项
): Promise<ApiResult<T>>
```

**自动行为**：
- 自动注入 `Authorization: Bearer <token>` 头
- 自动超时 10 秒（AbortController）
- 401 时自动清除 auth 状态并重定向到登录页
- 非 JSON 响应自动处理

### 2. `ApiResult<T>` — 可辨识联合类型

```typescript
// src/types/api.ts
export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiErrorBody };

export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly type: 'invalid_request_error' | 'authentication_error' | 'not_found_error' | 'conflict_error' | 'server_error';
  readonly param: string | null;
}
```

**DO** — 通过 `result.ok` 分派：

```typescript
// ✅ 正确 — 判别式联合匹配
const result = await request<User>('GET', '/users/me');

if (result.ok) {
  console.log(result.data.name);  // 类型安全：User
} else {
  console.error(result.error.message);  // 类型安全：ApiErrorBody
}
```

```typescript
// ❌ 错误 — 不检查 ok 直接访问 data
const result = await request<User>('GET', '/users/me');
console.log(result.data.name);  // 编译错误：data 在 ok 分支才存在
```

### 3. API 函数编写模式

每个 API 函数必须返回 `ApiResult<T>`，**禁止 throw**：

```typescript
// ✅ 正确 — 返回 ApiResult，不 throw
export async function fetchMe(): Promise<ApiResult<User>> {
  return request<User>('GET', '/users/me');
}

export async function deleteUser(id: string): Promise<ApiResult<DeletedResponse>> {
  return request<DeletedResponse>('DELETE', `/users/${id}`);
}

export async function createModel(data: CreateModelRequest): Promise<ApiResult<Model>> {
  return request<Model>('POST', '/models', data);
}
```

```typescript
// ❌ 错误 — 用 throw 处理错误
export async function fetchMe(): Promise<User> {
  const res = await fetch('/users/me');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}
```

### 4. 查询参数 — 使用 `URLSearchParams`

```typescript
// ✅ 正确 — 使用 URLSearchParams 构建
import { URLSearchParams } from '@/utils';

export async function listRequests(
  params: ListRequestParams
): Promise<ApiResult<ListResponse<RequestLog>>> {
  const query = new URLSearchParams();
  if (params.appId) query.set('app_id', params.appId);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset) query.set('offset', String(params.offset));
  const path = `/requests?${query.toString()}`;
  return request<ListResponse<RequestLog>>('GET', path);
}
```

```typescript
// ❌ 错误 — 手动拼接 URL
const path = `/requests?app_id=${params.appId}&limit=${params.limit}`;
```

### 5. 组件层调用模式

```typescript
import { useState, useEffect } from 'react';
import { fetchMe } from '@/api/me';
import type { User } from '@/types';

export function Dashboard(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      const result = await fetchMe();
      if (cancelled) return;

      if (result.ok) {
        setUser(result.data);
      } else {
        setError(result.error.message);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  // ...
}
```

---

## 常见陷阱

| 陷阱 | 正确做法 |
|------|----------|
| 在 API 函数中 `throw` 错误 | 返回 `{ ok: false, error }` |
| 不检查 `result.ok` 直接访问 `data` | 始终先判断 `result.ok` |
| 手动拼接查询字符串 | 使用 `URLSearchParams` |
| 手动传递 Token 头 | 由 `client.ts` 自动注入 |
| 忘记组件卸载时的竞态处理 | 使用 `cancelled` 标志或 AbortController |
| 在 `useEffect` 中调用 API 不处理 cleanup | 返回 cleanup 函数设置 cancelled 标志 |

## 项目参考

- `src/api/client.ts` — `request<T>()` 实现
- `src/api/me.ts` — API 函数编写范例
- `src/api/users.ts` — 带查询参数的 API 函数范例
- `src/types/api.ts` — `ApiResult<T>` / `ApiErrorBody` 类型定义
- `src/stores/auth-store.ts` — `fetchMe()` 调用示例
