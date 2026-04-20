# 导航侧边栏组件体系 (UI Sidebar)

[← 回到 components/ui](../README.md)

## 简介
基于 shadcn/ui 的复合型侧边栏组件，提供响应式的折叠侧边栏、移动端抽屉导航支持，并内置全局的状态与 Context 维护。

## 目录结构
``text
ui/sidebar/
├── index.ts              # 统一导出
├── context.tsx           # 状态 Context 与 hook
├── SidebarProvider.tsx   # 全局容器（处理折叠状态、拖拽、响应式逻辑）
├── SidebarLayout.tsx     # 结构骨架（Header/Content/Footer）
├── SidebarMenu.tsx       # 菜单列表与层级相关的内联组件
└── Sidebar.tsx           # 高度定制的基础外观组件集合
``

## 核心组件与接口

| 组件名 | 职责 |
|---|---|
| SidebarProvider | 控制全局跨级的展开/收起状态，注入 useSidebar() context。 |
| Sidebar | 侧边栏整体容器，处理 PC 下的右侧拖拽（Resizable）与小屏下的自动折叠。 |
| SidebarGroup / SidebarMenu | 定义导航的结构分组，并在嵌套时提供自动缩进与样式调整。 |
| useSidebar | 获取/设置侧边栏的当前的拖拽宽度、折叠状态、以及设备的 isMobile 状态。 |