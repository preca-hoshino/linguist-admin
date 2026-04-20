# 骨架布局与侧边栏导航组件 (Layout Nav)

[← 回到 layouts](../README.md)

## 简介
包含在应用顶级 Layout (AuthenticatedLayout) 以及侧边栏内承载页面路由的基础菜单组建体系。负责业务的侧边树状结构的折叠策略并呈现当前操作用户信息与团队环境。

## 目录结构
``text
nav/
├── AppSidebar.tsx     # 基础应用侧边栏容器：包含标题栏与滚动的导航项目列表整合
├── NavGroup.tsx       # 独立的导航主群组模块，根据路由层级自动管理内部 Collapsible 内容
├── NavUser.tsx        # 个人信息卡面组件：包括下拉的账户中心、登出配置等
├── TeamSwitcher.tsx   # （暂时固定）团队视图/多网关租户切换器
└── types.ts           # 结构化的定义路由结构树对象
``

## 核心组件与接口

| 组件名 | 职责 |
|---|---|
| AppSidebar | 拼接页面的头部、业务列表内容与尾部用户信息区域。 |
| NavGroup | 渲染在 sidebar-data 内注册的具有层级深度的业务管理路由组块。 |
| NavUser | 结合 uth-store 内的用户状态响应全局退出动作和基本 Profile 显示。 |