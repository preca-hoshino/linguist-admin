# src/views/auth — 认证视图模块

> 父模块：[`src/views/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/stores/README.md`](../../stores/README.md)（认证状态）、[`src/router/README.md`](../../router/README.md)（路由守卫）

## 简介

存放与用户登录、认证流程相关的视图页面。此目录下的页面对应路由树中 `(auth)/` 分组下的公开路由（即无需身份验证即可访问），是应用入口的认证门户。

## 目录结构

```
auth/
└── LoginPage.tsx     # 管理员登录页（AdminKey 输入与验证）
```

## 核心页面

| 文件 | 路由路径 | 说明 |
| --- | --- | --- |
| `LoginPage.tsx` | `/login` | 输入管理员密钥（AdminKey）发起验证，成功后跳转至仪表盘 |

## 设计规范

- **无状态展示**：表单输入状态由组件本地 `useState` 管理，验证成功后调用 `authStore.setAdminKey()` 写入全局状态，不在此处处理业务 API。
- **单职责**：此目录仅处理用户进入系统的凭据校验，不包含注册、密码重置等其他认证流程。
- **路由约束**：已登录用户访问 `/login` 时，应在路由层被重定向至仪表盘（通过 `router/(auth)` 的 `beforeLoad` 守卫实现）。

## 新增 / 重构 / 删除向导

### 新增认证页面

1. 在此目录新建对应 `.tsx` 文件（如 `MFAPage.tsx`）；
2. 进入 `src/router/(auth)/` 新建对应路由文件，将页面组件绑定到路由；
3. 视需求在 `authStore` 中补充状态字段。

### 重构登录逻辑

- 认证流程的核心判断（如认证成功跳转）应在路由层的 `beforeLoad` / `onSuccess` 钩子中处理，不要在页面组件内部硬编码 `navigate()`。

### 删除

- 废弃某个认证页面时同步删除 `src/router/(auth)/` 下的对应路由文件。
