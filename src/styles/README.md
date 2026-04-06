# src/styles — 样式表模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/components/README.md`](../components/README.md)（组件样式依赖方）

## 简介

存放项目的全局样式表与 CSS Variables (Token) 定义。在使用 Tailwind CSS 的基础上，这里主要用于做样式重置、基础排版设定以及注入统一的深浅色主题变量。

## 目录结构

```
styles/
├── index.css      # 全局主样式表，包含 Tailwind 核心指令与排版重置
└── theme.css      # CSS 变量主题映射表（亮色及暗色模式色值设定等）
```

## 核心配置

### `theme.css`

维护了所有的 UI 基础色板、Radius 圆角尺度和其他抽象出的视觉参数。配合 Tailwind 提供全局一致的设计语言。

## 使用方式

主要在项目根入口 `main.tsx` 或根组件中导入：

```tsx
// 在入口处挂载全局样式
import './styles/index.css'
import './styles/theme.css'
```

## 新增 / 重构 / 删除向导

### 新增/修改样式主题

- 调整主色彩范围或圆角：仅在 `styles/theme.css` 内修改 `--primary`, `--radius` 等对应变量的值即可全站生效。
- 添加特定非 Tailwind 覆盖样式，置于 `index.css` 的 `@layer base` 或 `@layer utilities` 中。

### 重构

- 重构色板时需借助检索，确保原本依赖在组件里的 `bg-primary`, `text-muted` 仍具有良好的显色对比度表现。

### 删除

- 尽量避免将具有系统级别定义的类名或基础变量抹除。
