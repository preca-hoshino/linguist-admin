# src/assets/custom — 自定义图标资源

> 父模块：[`src/assets/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)

## 简介

存放专为本项目设计的自定义 SVG 图标 React 组件。与 `brand-icons/` 不同，此目录下的图标均为**布局选项预览图**等界面性质的矢量资源，以内联 SVG 方式封装为 React 组件，支持通过 `className` 控制样式。

## 目录结构

```
custom/
├── icon-dir.tsx                # 目录/列表方向图标
├── icon-layout-compact.tsx     # 紧凑布局预览图标
├── icon-layout-default.tsx     # 默认布局预览图标
├── icon-layout-full.tsx        # 全宽布局预览图标
├── icon-sidebar-floating.tsx   # 浮动侧边栏样式预览图标
├── icon-sidebar-inset.tsx      # 嵌入式侧边栏样式预览图标
└── icon-sidebar-sidebar.tsx    # 标准侧边栏样式预览图标
```

## 核心组件

| 组件 | 用途 |
| --- | --- |
| `IconLayoutCompact` | 紧凑布局模式的 SVG 缩略图，用于布局选项切换器 |
| `IconLayoutDefault` | 默认布局模式的 SVG 缩略图 |
| `IconLayoutFull` | 全宽布局模式的 SVG 缩略图 |
| `IconSidebarFloating` | 浮动侧边栏模式预览图 |
| `IconSidebarInset` | 嵌入侧边栏模式预览图 |
| `IconSidebarSidebar` | 经典侧边栏模式预览图 |

## 使用方式

```tsx
import { IconLayoutCompact } from '../assets/custom/icon-layout-compact'
import { IconSidebarFloating } from '../assets/custom/icon-sidebar-floating'

export function LayoutPicker() {
  return (
    <div className="flex gap-2">
      <IconLayoutCompact className="h-8 w-8" />
      <IconSidebarFloating className="h-8 w-8" />
    </div>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增自定义图标

1. 使用与现有文件相同的命名约定 `icon-<类别>-<名称>.tsx`；
2. 组件接受 `React.SVGProps<SVGSVGElement>` 作为 props，保证 `className`、`style` 等可自定义；
3. 不要在此处放置带业务逻辑的组件，纯 SVG 展示即可。

### 重构

- 调整图标尺寸或路径直接修改 SVG 内部属性，保持组件 API（props 签名）不变。

### 删除

- 确认无调用方后直接删除对应 `.tsx` 文件，无需修改任何索引文件。
