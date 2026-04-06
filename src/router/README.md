# src/router — 路由系统模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/views/README.md`](../views/README.md)（具体页面文件存放区）

## 简介

对标早期 Vue / React 项目的路由设定目录。本项目采纳 TanStack Router 框架构建的约定式文件路由（File-based Routing）。该目录的职责为映射页面、组装 URL 表现架构以及挂载身份隔离的中间件层布局。

## 目录结构

```
router/
├── __root.tsx           # 全应用组件基座与最底层的入口提供点
├── index.tsx            # 根路径根页（即访问 `/` 所到达之地）
├── _authenticated/      # 利用带下划线的前缀表示为路由群落但不更改 URL 层级
│   ├── route.tsx        # 应用于该认证路径下的统一登录检查隔离罩
│   └── [...子路由]      # 仪表板首页模块、偏好设定区块等
├── (auth)/              # 括号包裹的路由夹，纯作文件物理归档功能使用
└── (errors)/            # 匹配一切异常兜底场景界面（404, 500 等）
```

## 核心机制

### 生成式强类型路由

在 Vite 开发环境常态起转期间，会自动对该目录的增减操作做出反应捕捉，再结合底层的插件自动映射推导成代码内联支持在 `src/routeTree.gen.ts` 文件中，赋予代码完全防误拼的 TS 推断类型。

## 使用方式

定义跨页面间的跳跃或者拦截操作：

```tsx
import { Link, useNavigate } from '@tanstack/react-router'

export function Navigation() {
  const navigate = useNavigate()
  
  return (
    <div>
      {/* 路径值已被 TypeScript 严密制约校验 */}
      <Link to="/settings/profile" className="text-blue-500">
        Go to Profile
      </Link>
      
      <button onClick={() => navigate({ to: '/dashboard' })}>
        Dashboard
      </button>
    </div>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增页面区块或路由

- **建构 URL 层级**：如果要新增能指向 `https://example.com/reports` 的浏览区域，就在目录同级位置创建 `router/reports/index.tsx`（或等价直接写成 `router/reports.tsx`）。
- **同步**：保存变动的页面组件块后，切记要检查后台服务进程有无及时生成对应类型的映射节点树。

### 重构路由层级

- 修改或重命名此处的物理路径都会引发实际对外链接结构的突变。必须以搜找与批量重命名处理代码底盘一切含有 `<Link to="...">` 以及 `navigate()` 相关的跳转引用。

### 删除

- 除了清理无意义空壳外，废除了特定功能节点直接将其文件移离此 `router` 边界即可，工具链会自动把它从系统支持路径表除名。
