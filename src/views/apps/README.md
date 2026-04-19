# src/views/apps — 应用管理模块

> 父模块：[`src/views/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/api/README.md`](../../api/README.md)（API 调用层）

## 简介

管理接入网关的**客户端应用（App）**实体的视图模块。每个 App 代表一个使用网关 API 密钥的接入方，可配置其允许调用的模型白名单及相关权限。本模块提供 App 列表的增删改查及详情查看能力。

## 目录结构

```
apps/
├── index.tsx                # 主容器：数据查询管线、分页与对话框调度
├── app-detail-page.tsx      # App 详情页面（展示配置、关联模型等信息）
├── apps-columns.tsx         # TanStack Table 列定义
├── apps-context.tsx         # 对话框与操作状态的 React Context
├── apps-dialogs.tsx         # 对话框入口：挂载增/改/删确认等各类弹窗
├── apps-mutate-dialog.tsx   # 新增/编辑 App 的表单对话框
├── apps-primary-buttons.tsx # 表格顶部的主操作按钮区（如"新建 App"按钮）
├── apps-row-actions.tsx     # 表格每行的操作菜单（编辑、删除等）
└── apps-table.tsx           # 组合了列定义、工具栏和分页的完整表格组件
```

## 核心页面与组件

| 文件 | 说明 |
| --- | --- |
| `index.tsx` | 路由挂载点，负责数据获取（TanStack Query）和状态下发 |
| `app-detail-page.tsx` | App 详情视图，展示完整配置与关联信息 |
| `apps-mutate-dialog.tsx` | 增/改表单的核心，包含 API 密钥生成和模型白名单配置 |
| `apps-context.tsx` | 通过 Context 在列表页的各子组件间共享操作状态 |

## 设计规范

- **数据调度集中**：TanStack Query 的 `useQuery` / `useMutation` 只在 `index.tsx` 中使用，子组件通过 Props 或 Context 接收数据。
- **受控对话框**：对话框的开/关状态统一由 `apps-context.tsx` 管理，不允许脱离上下文自行管理。
- **逻辑剥离**：`apps-table.tsx` 只负责渲染，操作行为通过 `apps-row-actions.tsx` 回调至上层处理。

## 新增 / 重构 / 删除向导

### 新增字段或功能

1. 若新增表格列：在 `apps-columns.tsx` 中追加列定义；
2. 若新增表单字段：修改 `apps-mutate-dialog.tsx` 的 Zod schema 和表单 JSX；
3. 若新增操作按钮：在 `apps-row-actions.tsx` 或 `apps-primary-buttons.tsx` 中添加，并在 `apps-dialogs.tsx` 中挂载对应弹窗。

### 重构

- 若单文件超过 300 行，考虑从中拆分子组件到独立的 `components/` 文件夹（参照 `models/` 域的做法）。

### 删除

- 同步从 `apps-context.tsx` 移除相关状态字段，并检查 `apps-dialogs.tsx` 中对应的对话框挂载点。
