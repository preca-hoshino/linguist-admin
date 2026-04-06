# src/providers — 状态上下文（Provider）模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/composables/README.md`](../composables/README.md)（逻辑层）

## 简介

React Context Provider 层。专门负责将全局或局部的状态与方法通过 Context 挂载到 React 组件树上。本目录下的文件仅处理 Context 的声明、注入与 Hook 暴露，不含有复杂的业务实现或网络请求副作用（其实际业务代理委托至 `composables/`）。

## 目录结构

```
providers/
├── ThemeProvider.tsx      # 拦截并下发应用层面的深浅色主题偏好
├── FontProvider.tsx       # 注入当前字体设置的环境上下文
├── DirectionProvider.tsx  # LTR 抑或 RTL 文字渲染方向控制底层设施
├── LayoutProvider.tsx     # 页面及骨架尺寸与交互模式上下文（例如侧边栏启停）
└── SearchProvider.tsx     # 控制整个应用快捷命令控制面板展示开关的 Context
```

## 核心模式

### 关注点分离设计

- **数据执行者**：首先调用对应 `src/composables/useXxx` 自定义封装函数以获取当前最新状态。
- **状态注入**：通过 `<XxxContext.Provider>` 将状态在局部或者全局 React 根节点往下发放。
- **消费侧导出**：同步提供类型严谨的 `useXxx()` 提取方法给任意嵌套程度的下游消费者使用。

## 使用方式

```tsx
// 1. 在上层结构（如 main.tsx）挂载外壳：
import { ThemeProvider } from '../providers/ThemeProvider'

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <AppContent />
    </ThemeProvider>
  )
}

// 2. 在深层业务视图组件内部按需调用：
import { useTheme } from '../providers/ThemeProvider'

export function ThemeButton() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme('dark')}>Dark Style</button>
}
```

## 新增 / 重构 / 删除向导

### 新增 Context Provider

- **决策要求**：若某些共享逻辑或表单项仅仅出现在某一细分组件内且嵌套非常浅，不需建立 Provider 层。
- **规范**：在 `composables/` 独立写完逻辑后才在本区将其打壳和穿套。且请导出完整的 TS 类型以防止断言丢失。

### 重构

- **渲染优化**：过大的单体 Provider 若数据变动时极易造成整站式无相干区域的大量 `Re-render`；必要时拆分解构该模块到更细更专的 Context 对象中。

### 删除

- 利用 Linter 寻找并擦除与之配套的 `useContext()`。同时从调用方（`main.tsx` 或外部分块 Layout）撤销此装饰包裹函数。
