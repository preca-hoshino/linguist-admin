# src/composables — 自定义 Hook 模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/providers/README.md`](../providers/README.md)（状态提供者）、[`src/views/README.md`](../views/README.md)（调用方）

## 简介

对应 React 项目中的 Custom Hooks。封装跨组件复用的纯 UI 交互逻辑和控制机制（如持久化主题、本地存储侧边栏阅读方向等）。这些组合式函数需遵循“不依赖 Context”和“自包含封装”的设计原则，以保障其高可移植性及单测可靠性。

## 目录结构

```
composables/
├── use-theme.ts              # 主题存取与切换（结合 Cookie 等）
├── use-font.ts               # 字体获取切换与应用
├── use-direction.ts          # 文字阅读方向 (LTR/RTL) 切换管理
├── use-page-title.ts         # 动态更新 HTML document 标题
├── use-dialog-state.tsx      # 弹窗与对话框的统一显隐控制
├── use-mobile.tsx            # 移动端断点检测监听
└── use-table-url-state.ts    # 后台表格状态与 URL 参数深度链接同步
```

## 主要函数

### `useTheme()` / `useFont()` / `useDirection()`

读取或设置本地界面配置，底层支持 cookie 加载及持久化缓存更新，通常对外提供 `[状态, setter]` 的返回值。

### `use-table-url-state`

将数据表格及相关控制面板的状态自动反映并刷新到浏览器地址栏的 query 字符串内，保证通过 URL 直接进入时还原当时场景。

## 使用方式

```tsx
import { useMobile } from '../composables/use-mobile'

export function MyComponent() {
  const isMobile = useMobile()
  
  return (
    <div>{isMobile ? 'Mobile View' : 'Desktop View'}</div>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增 Hook 逻辑

- 新封装的复用业务操作尽量保持纯净度：应利用参数显式传入所需下文，而不是在 Hook 内隐式使用 `useContext` 或依赖特定上层 Provider 层。
- 对于涉及 API 网络请求抓取的封装，优先建议存放于 `src/api` 层而非纯 UI 的 `composables` 目录内。

### 重构

- **解耦提取**：如果在多处页面和表格内发现了重复的交互模型或者副作用状态（`useEffect` + `useState`），应该提取沉淀至本目录下独立进行复用管理。

### 删除

- 仅在全局不再存在引用时（结合编辑器代码索引检查）可安全删除。
