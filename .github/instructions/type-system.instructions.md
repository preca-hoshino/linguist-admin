---
description: '前端类型系统规范 — 后端映射、ApiResult、资源对象、ListResponse、命名约定'
applyTo: 'src/types/**/*.ts'
---

# 前端类型系统规范

`src/types/` 集中存放跨模块共享的 TypeScript 类型，与后端 API 响应结构深度对齐。

---

## 1. 与后端 API 的映射关系

| 后端（Linguist） | 前端（Linguist-Admin） | 说明 |
|-------------------|------------------------|------|
| `ProviderConfig`（camelCase） | `Provider`（snake_case） | 前端直接使用后端 JSON 字段名 |
| `ProviderCredential`（判别联合） | `credential_type` + `credential`（扁平） | 前端拆为两个字段，不使用判别联合 |
| `VirtualModelConfig` | `VirtualModel` | 结构基本一致 |
| `InternalChatRequest` | `ChatMessage` / `ToolDefinition` | 前端仅用于展示，不包含 `stream` 等网关内部字段 |

> 前端类型字段使用 `snake_case`，与后端 JSON 响应一致。组件内部逻辑可用 camelCase 变量名。

## 2. `ApiResult<T>` — 可辨识联合

所有 API 调用返回 `ApiResult<T>`，组件层通过 `result.ok` 分派，**禁止 try/catch**：

```typescript
type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiErrorBody };
```

## 3. 统一响应结构

| 类型 | `object` 字段 | 用途 |
|------|---------------|------|
| `ListResponse<T>` | `'list'` | 列表查询（含 `data[]`、`has_more`、`total`） |
| `DeletedResponse` | 资源类型 | DELETE 确认（含 `id`、`object`、`deleted: true`） |
| 单一资源 | 资源类型 | GET/POST/PATCH 响应（含 `id`、`object`、`created_at`、`updated_at`） |

## 4. `ResourceObjectType` — 资源类型联合

```typescript
type ResourceObjectType =
  | 'provider' | 'provider_model' | 'virtual_model'
  | 'virtual_mcp' | 'mcp_provider' | 'mcp_log'
  | 'request_log' | 'user' | 'app';
```

新增资源类型时在此联合中追加。

## 5. 新增 / 重构 / 删除流程

### 新增

1. 在对应 `.ts` 文件添加类型
2. 在 `index.ts` 添加 `export *`
3. `npm run check` → 修复编译错误

### 重构

- 类型重构影响范围广（API 层 → Store → 组件），必须 `npm run check` 全量验证
- 联合类型 / 泛型变更需逐一检查组件解构

### 删除

- 通过 TS Server 引用检查确认无引用后删除
