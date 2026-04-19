# src/views/users — 用户管理模块

> 父模块：[`src/views/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/api/README.md`](../../api/README.md)（API 调用层）、[`src/stores/README.md`](../../stores/README.md)（认证状态）

## 简介
此模块作为平台管理员系统的入口，专门管理各级协作开发者的配置项。为了确保可维护性，视图已被分拆。

## 目录结构
```
users/
├── components/
│   ├── UserMutateDialog.tsx # 将新增与编辑用户融合在一起的双工表单组件
│   └── UserTable.tsx        # 负责处理数据回显样式与行内操作按钮区的长列表骨架
└── index.tsx                # 主列表数据查询管线、分页控制及对话框调度容器
```

## 核心组件

| 文件 | 说明 |
| --- | --- |
| `index.tsx` | 路由挂载点，负责数据获取（TanStack Query）和对话框调度 |
| `components/UserTable.tsx` | 负责处理数据回显样式与行内操作按钮区的长列表骨架 |
| `components/UserMutateDialog.tsx` | 将新增与编辑用户融合在一起的双工表单组件 |

## 设计规范

- **逻辑剥离**：`index.tsx` 保留所有对于后台 API 的直接通讯行为及对话框展现开关态。
- **受控机制**：位于 `components/` 内的部分应当对外界表现为受控组件，数据传入依靠 `props` 交互状态外推依靠回调触发，禁止在表现型组件内部引入 `fetch` 请求。

## 新增 / 重构 / 删除向导

### 新增表格列或操作

- 在 `components/UserTable.tsx` 的列定义中追加新列；
- 若新列需要展示操作按钮（如重置密码），在行操作区添加调用并将对应对话框在 `index.tsx` 中挂载。

### 新增表单字段

1. 修改 `UserMutateDialog.tsx` 中的 Zod schema 添加新字段及校验规则；
2. 同步在表单 JSX 中添加对应的 `FormField` 控件；
3. 更新 `src/api/` 中的用户 API 函数以传递新字段。

### 重构

- 若功能扩展导致单文件超过 400 行，参照 `models/` 域的做法将复杂区块拆分到 `components/` 内。

### 删除

- 删除此模块时，同步删除 `src/router/_authenticated/users/` 下的路由文件，并在 `layouts/data/sidebar-data.ts` 中移除导航入口。
