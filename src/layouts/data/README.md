# src/layouts/data — 布局导航数据

> 父模块：[`src/layouts/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)

## 简介

存放侧边栏导航和布局结构所需的**静态配置数据**。将导航树结构从 React 组件中抽离，使 `AppSidebar.tsx` 等布局组件可通过读取此处的数据声明来驱动渲染，避免在视图层中硬编码路由配置。

## 目录结构

```
data/
└── sidebar-data.ts     # 侧边栏导航树定义（各功能区入口、图标、路由路径等）
```

## 核心接口

| 文件 | 导出 | 说明 |
| --- | --- | --- |
| `sidebar-data.ts` | `sidebarData` | 描述整个左侧导航结构的配置对象（含路由、图标、标签等） |

## 数据结构示例

```ts
// sidebar-data.ts
import { LayoutDashboard, Settings } from 'lucide-react'

export const sidebarData = {
  navMain: [
    {
      title: '仪表盘',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: '设置',
      url: '/settings',
      icon: Settings,
      items: [
        { title: '账户', url: '/settings/account' },
        { title: '外观', url: '/settings/appearance' },
      ],
    },
  ],
}
```

## 新增 / 重构 / 删除向导

### 新增导航项

1. 在 `sidebar-data.ts` 中的 `navMain`（或对应分区数组）中追加新的配置对象；
2. 确保 `url` 与 `src/router/` 中注册的路由路径完全一致；
3. 为新导航项选择合适的 `lucide-react` 图标。

### 重构导航结构

- 修改分组或层级仅需调整 `sidebar-data.ts` 中的数据结构，无需改动 `AppSidebar.tsx` 渲染逻辑；
- 若需要新增分区类型（如底部固定项），请同时更新父模块 `layouts/types.ts` 中的类型定义。

### 删除导航项

- 从 `sidebarData` 中移除对应配置项后，对应路由链接自动消失；
- 若同时废弃路由，还需在 `src/router/` 中移除对应的路由文件。
