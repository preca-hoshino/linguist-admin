---
description: 'API 调用规范 — request()、ApiResult、错误处理、查询参数'
applyTo: 'src/api/**/*.ts'
---

# API 调用规范

通过 `request<T>()` 发送请求，`ApiResult<T>` 可辨识联合处理响应。**禁止在 API 函数中 throw**。

---

## 1. `request<T>()` — 统一请求函数

```typescript
import { request } from '@/api/client';

async function request<T>(
  method: string,           // HTTP 方法
  path: string,             // API 路径（不含前缀）
  body?: unknown,            // 请求体（POST/PUT/PATCH）
  customConfig?: RequestInit, // 自定义 fetch 选项
): Promise<ApiResult<T>>
```

**自动行为**：注入 `Authorization` 头、10 秒超时、401 自动清除 auth 并跳转登录。

## 2. `ApiResult<T>` — 可辨识联合

```typescript
export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiErrorBody };

// ✅ 通过 result.ok 分派
const result = await request<User>('GET', '/users/me');
if (result.ok) {
  console.log(result.data.name); // 类型安全：User
} else {
  console.error(result.error.message); // 类型安全：ApiErrorBody
}

// ❌ 不检查 ok 直接访问 data → 编译错误
```

## 3. API 函数编写模式

```typescript
// ✅ 返回 ApiResult<T>，禁止 throw
export async function fetchMe(): Promise<ApiResult<User>> {
  return request<User>('GET', '/users/me');
}

export async function createModel(data: CreateModelRequest): Promise<ApiResult<Model>> {
  return request<Model>('POST', '/models', data);
}
```

## 4. 查询参数 — `URLSearchParams`

```typescript
// ✅ 使用 URLSearchParams 构建
const query = new URLSearchParams();
if (params.appId) query.set('app_id', params.appId);
if (params.limit) query.set('limit', String(params.limit));
const path = `/requests?${query.toString()}`;

// ❌ 禁止手动拼接：`/requests?app_id=${params.appId}&limit=${params.limit}`
```

## 5. 组件层调用 — 竞态处理

```typescript
useEffect(() => {
  let cancelled = false;
  async function load(): Promise<void> {
    const result = await fetchMe();
    if (cancelled) return;
    if (result.ok) setUser(result.data);
    else setError(result.error.message);
  }
  void load();
  return () => { cancelled = true; };
}, []);
```
