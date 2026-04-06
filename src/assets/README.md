# src/assets — 静态资源模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/components/README.md`](../components/README.md)（前端组件调用方）

## 简介

存储项目所需的所有静态资源文件，包括品牌图标、Logo、自定义图标等。支持作为 React 组件引用的矢量资源。

## 目录结构

```
assets/
├── brand-icons/          # 品牌相关图标集合
├── custom/               # 自定义图标和资源
└── [React 图标组件].tsx   # 项目主 Logo、Clerk 简化 Logo 等
```

## 核心组件

### `<Logo />` / `<ClerkLogo />` 等组件

导出的具体 SVG React 组件。接口可接受 `className` 等标准 SVG 属性，实现灵活的页面样式控制。

## 使用方式

```tsx
import { Logo } from '../assets/logo'
import BrandIcon from '../assets/brand-icons/some-brand'

export function Header() {
  return (
    <div>
      <Logo className="w-8 h-8" />
      <BrandIcon />
    </div>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增静态资源

- **SVG React 组件**：创建 `.tsx` 文件导出接受 `React.SVGProps<SVGSVGElement>` 的组件，可传入 `className` 等属性以方便由调用方控制样式。
- **分组规则**：大量同类图标可放置于 `brand-icons/` 或 `custom/` 中作归类存放。

### 重构

- 优先使用 SVG 组件替代位图（PNG/JPG）以保持响应式设计的缩放清晰度。
- 图标重构应保证向后兼容 `className` 及各类 `style` 的传入设计。

### 删除

- 建议定期清理未使用的孤立资源。
- 可通过工程检索或执行 `npm run type-check` 确认资源无引用关系后方可移除。
