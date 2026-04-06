# src/api — 后端 API 客户端层

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/providers/README.md`](../providers/README.md)（状态与数据支持）、[`src/stores/README.md`](../stores/README.md)（业务层）

## 简介

封装所有对 Gateway 管理 API（`/api/*`）的 HTTP 调用，提供类型安全的异步函数供视图层和 Hooks/Stores 使用。所有请求统一携带 `Authorization: Bearer <adminKey>` 头，认证信息由 `client.ts` 集中管理并持久化到 `localStorage`。

## 目录结构

```
api/
├── index.ts             # 聚合导出：所有域模块 + 类型 re-export
├── client.ts            # 底层 fetch 封装（adminKey 管理、统一错误处理）
└── [各业务域 API 文件].ts # HTTP 端点接口声明封装（如 providers.ts 等）
```

## 核心接口 / 主要模块

### `client.ts`

- `getAdminKey` / `setAdminKey`: 从本地存储中读取或写入管理员密钥。
- `request<T>`: 统一处理 HTTP 请求的底层函数，携带鉴权信息并对非 2xx 异常进行捕获并抛出标准 `Error`。

### 各域模块（如 `providers.ts` 等）

将特定业务域下的 `/api/...` 请求封装为标准异步函数（例如 `listProviders`, `createProvider`），为调用方屏蔽 URL 和请求方式细节。

## 使用方式

```typescript
import { listProviders, createProvider, setAdminKey } from '../api';

// 初始化认证
setAdminKey('your-admin-key');

// 调用 API
const providers = await listProviders();
```

## 新增 / 重构 / 删除向导

### 新增 API 逻辑

- **增加函数**：在目标功能文件下增加发起 `request<T>` 调用的业务接口，并在 `index.ts` 中统一 export。
- **类型声明**：返回值如有新数据结构，可于 `src/types/` 中定义后进行引用和抛出。

### 重构

- **修改鉴权或基础网络**：对 `client.ts` 进行调整。包含更换底层网络库、变更 Token 注入逻辑或请求前缀（BaseURL）逻辑等。

### 删除

- 移除整个域文件时，需同时从 `index.ts` 移除相关导出声明，并确保页面组件层没有对应引用的残留。
