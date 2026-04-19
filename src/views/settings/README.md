# src/views/settings — 系统设置模块

> 父模块：[`src/views/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/stores/README.md`](../../stores/README.md)（设置状态）、[`src/providers/README.md`](../../providers/README.md)（主题与布局等上下文）

## 简介

用户个性化配置与账户管理的入口模块。采用垂直选项卡式（Sidebar Navigation）布局，将各类偏好设置分组到独立页面（如账户、外观、通知等），与大多数 SaaS 系统的"设置"区块布局保持对齐。

## 目录结构

```
settings/
├── index.tsx               # 设置根容器（侧边导航 + 内容区域 Outlet）
├── components/             # 设置模块专用的布局组件
│   ├── content-section.tsx # 单个设置分区的内容包裹（含标题与说明）
│   └── sidebar-nav.tsx     # 设置页的二级垂直导航（左侧选项卡列表）
├── account/                # 账户配置子页（API Key 等账户级设置）
│   └── index.tsx
├── appearance/             # 外观主题配置子页
│   ├── index.tsx
│   └── account-form.tsx    # 外观设置表单
├── profile/                # 个人信息配置子页
│   ├── index.tsx
│   └── profile-form.tsx    # 用户信息表单
├── display/                # 显示偏好子页（密度/布局等）
│   └── index.tsx
├── notifications/          # 通知配置子页
│   └── index.tsx
└── about/                  # 关于系统信息子页
    └── index.tsx
```

## 核心组件与页面

| 文件 | 说明 |
| --- | --- |
| `index.tsx` | 设置根容器，渲染二级导航 + `<Outlet>` 内容区 |
| `components/sidebar-nav.tsx` | 设置专属的左侧垂直导航项列表，点击切换路由子页 |
| `components/content-section.tsx` | 统一的内容区标题结构（含标题、副标题、分隔线） |
| `appearance/` | 主题切换（深色/浅色/跟随系统）、字体选择等展示类偏好配置 |
| `account/` | 账户级别的配置，如管理员密钥查看与更新 |

## 设计规范

- **导航驱动**：通过更改 URL 路径来切换设置子分区（而非状态切换），保证浏览器前进/后退和直接链接均有效。
- **表单即子页**：每个设置子分区对应独立的路由页面，使用 `react-hook-form` + `zod` 管理表单状态与校验。
- **布局统一**：所有子页面顶部必须通过 `<ContentSection>` 包裹，保持标题样式和间距的全局一致性。

## 新增 / 重构 / 删除向导

### 新增设置分区

1. 在 `settings/` 下新建对应子目录（如 `security/`）和 `index.tsx`；
2. 在 `src/router/_authenticated/settings/` 下注册对应路由；
3. 在 `index.tsx` 的 `sidebarNavItems` 配置数组中添加新的导航入口。

### 修改设置表单

- 修改 `zod` schema 以调整校验规则；
- 在表单组件中对应添加或删除 `FormField` 控件；
- 同步更新后端 API 调用（`src/api/`）以传递新增字段。

### 删除设置分区

1. 删除子目录及其路由文件；
2. 从 `index.tsx` 的 `sidebarNavItems` 中移除对应导航项。
