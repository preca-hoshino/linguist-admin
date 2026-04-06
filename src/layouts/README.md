# src/layouts — 布局骨架模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/components/README.md`](../components/README.md)（基础组件来源）、[`src/views/README.md`](../views/README.md)（子路由与内层视图）

## 简介

统筹页面的布局、导航边栏和容器层级关系结构。用于放置侧边栏（AppSidebar）、顶部功能动作栏结构（Header）外加主要浏览器的入口容器（AuthenticatedLayout），包裹并装载各个特定的业务页面路由（Outlet）。

## 目录结构

```
layouts/
├── AuthenticatedLayout.tsx  # Router 的根装载入口，包含 sidebar 及 main 架子
├── AppSidebar.tsx           # 左侧导航栏区域（基于业务路由动态及固定展示）
├── Header.tsx               # 位于顶层的顶部框架、搜索、Profile 入口组合
├── NavGroup.tsx / TopNav.tsx# 功能菜单的逐级细分与展示栏
├── AppTitle.tsx             # 网站 Logo 与名称常驻展示部件
├── Main.tsx                 # 右侧/主要的实际渲染画板装载组件
├── TeamSwitcher.tsx         # 若存在多工作区/多租户时的顶侧切换控件
├── data/                    # 本地预设左侧菜单树或固定路由描述数据
└── types.ts                 # 描述并规范 `data` 之数据体质的声明
```

## 主要组件与接口

### `AuthenticatedLayout` 

项目的核心后台套壳基座，通过 TanStack Router 或 React Router 在其下方实现对全系鉴权后界面的管控和分层，所有主要业务流转均包裹于其下。

### `AppSidebar.tsx` / `NavGroup.tsx`

通过读取内置于 `data/` 之下的导航参数或组合动态服务，渲染分级的管理列表面板。

## 使用方式

搭配路由管理使用套嵌式定义：

```tsx
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout'

// 于路由文件或 src/router 注册
<Route element={<AuthenticatedLayout />}>
  {/* 各类内容页面将在这里被布局包着展示 */}
  <Route path="/dashboard" element={<DashboardView />} />
</Route>
```

## 新增 / 重构 / 删除向导

### 修改面板及骨架功能

- **调整左侧菜单或导航项**：直接在 `layouts/data/` 中的导航定义配置字典中编辑相应的数组参数即可改变界面左域映射行为。
- **添加顶部功能按钮**：通过在 `Header.tsx` 旁列放置额外封装小组件（如图标控制钮等）。

### 重构

- **切分重组**：若调整大范围的左-右至上-下框架，修改集中于 `AuthenticatedLayout.tsx`，不要动各个深层的页面内容代码，保证页面层组件和外围布局完全解耦。

### 删除

- 大多数基于全局视角的包络布局不被随意移除，如取消部分区块，删除组件对应的渲染 `<AppSidebar />` 的语句即可屏蔽对应功能模块。
