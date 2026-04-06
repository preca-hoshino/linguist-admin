# src/components — 组件模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/views/README.md`](../views/README.md)（视图调用方）、[`src/layouts/README.md`](../layouts/README.md)（外层框架）

## 简介

包含项目所有可复用的 React 组件。分为两类：一是基于 shadcn/ui 的基础无样式组件（`ui/`），二是特定于应用功能的高阶业务组件（如导航、数据表、对话框等）。所有模块支持按需导入。

## 目录结构

```
components/
├── ui/                      # shadcn/ui 基础公共组件库
├── data-table/              # 业务特定的数据表格及其扩展
├── layout/                  # 各类页面局部或全局结构的组件
└── [高阶业务组件].tsx        # 命令菜单、主题切换、配置抽屉等独立模块
```

## 核心组件划分

### 基础 UI 组件 (`ui/`)

提供按钮、弹窗、表单、下拉列表等原子级的常见元素封装。绝大多数基于 shadcn CLI 命令行直接生成及复用，方便保持业务高度解耦。

### 高阶业务组件

在 `components/` 根目录或归类目录下的独立 `.tsx` 组件（如 `CommandMenu`、`ThemeSwitch` 等），其内部已封装特定的业务逻辑响应或全局状态引用。

## 使用方式

```tsx
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { ThemeSwitch } from '../components/ThemeSwitch'

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <ThemeSwitch />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增组件逻辑

- **基础 UI 组件**：利用命令行 `npx shadcn-ui@latest add <component-name>` 将所需组件自动拉取至 `ui/` 目录下。
- **业务通用组件**：于当前目录或相关业务子目录新建模块。组件务必声明清晰的 `Props` TS 接口保障类型和扩展安全性。

### 重构

- **样式调整**：重构 `ui/` 里的 shadcn/ui 组件时，只需修改其对 Tailwind 类名的使用规则即可。
- **稳定 API**：重构业务组件时，由于可能出现多处共用组件实例的情况，尽量不破坏现有的 props 数据签名，并在 TypeScript 层保持稳定兼容。

### 删除

- 废弃与停用的组件，建议借助全项目全局搜索或者检查 `npm run type-check`，在确信无遗漏引用后，方可放心从目录结构中剔除。
