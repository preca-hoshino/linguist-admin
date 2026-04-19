# src/views/mcps — MCP 网关管理模块

> 父模块：[`src/views/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/api/README.md`](../../api/README.md)（API 调用层）、[`src/views/models/README.md`](../models/README.md)（并行的模型管理域）

## 简介

统合管理 **MCP（Model Context Protocol）** 相关资源的视图层，包含物理 MCP 服务提供商（Provider）、虚拟 MCP 服务（Virtual MCP）及 MCP 调用日志（Logs）三个子模块。与 `models/` 域的架构风格高度对称。

## 目录结构

```
mcps/
├── providers/               # MCP 提供商配置管理
│   ├── index.tsx            # 提供商列表主容器（查询、分页、对话框调度）
│   ├── provider-detail-page.tsx  # 提供商详情页（工具列表、性能统计）
│   ├── providers-columns.tsx     # 表格列定义
│   ├── providers-context.tsx     # 操作状态上下文
│   ├── providers-dialogs.tsx     # 增/改/删对话框挂载
│   ├── providers-table.tsx       # 完整表格组件
│   └── detail-tabs/         # 详情页的 Tab 内容
│       ├── McpProviderSettingsTab.tsx
│       ├── McpProviderToolsTab.tsx
│       └── McpPerformanceTab.tsx（含相关子组件）
├── virtual-mcps/            # 虚拟 MCP 配置管理
│   ├── index.tsx            # 虚拟 MCP 列表主容器
│   ├── virtual-mcp-detail-page.tsx   # 虚拟 MCP 详情页
│   ├── virtual-mcps-columns.tsx      # 表格列定义
│   ├── virtual-mcps-context.tsx      # 操作状态上下文
│   ├── virtual-mcps-dialogs.tsx      # 增/改/删对话框挂载
│   ├── virtual-mcps-table.tsx        # 完整表格组件
│   └── detail-tabs/         # 详情 Tab 内容
│       ├── VirtualMcpSettingsTab.tsx
│       └── VirtualMcpToolsTab.tsx
├── logs/                    # MCP 调用日志查看
│   ├── index.tsx            # 日志列表主容器
│   ├── log-detail-page.tsx  # 日志详情页
│   ├── mcp-logs-columns.tsx # 表格列定义
│   ├── mcp-logs-context.tsx # 操作状态上下文
│   ├── mcp-logs-table.tsx   # 完整日志表格
│   └── detail-tabs/         # 日志详情 Tab 内容
│       ├── McpLogContentTab.tsx
│       ├── McpLogMetadataTab.tsx
│       └── McpLogRawDataTab.tsx
└── shared/                  # mcps 域内公用的子组件或工具
    └── McpLatencyChart.tsx（等组件）
```

## 核心子模块

| 子模块 | 路由前缀 | 说明 |
| --- | --- | --- |
| `providers/` | `/mcps/providers` | 管理外部 MCP 服务的接入配置（地址、鉴权、工具白名单） |
| `virtual-mcps/` | `/mcps/virtual-mcps` | 管理对外暴露的虚拟 MCP 服务（名称唯一、按白名单路由） |
| `logs/` | `/mcps/logs` | 浏览 MCP 工具调用的原始请求与响应日志 |

## 设计规范

- **名称寻址**：虚拟 MCP 对外通过 `name` 字段进行识别和路由，管理界面内部操作使用 `id`，两者在展示层应明确区分。
- **就近组件**：各子模块内的详情页 Tab 组件放在该子模块的 `detail-tabs/` 目录下，不在顶层 `mcps/` 目录混放。
- **数据调度**：TanStack Query 调用仅在各子模块的 `index.tsx` 中发起，详情组件通过路由参数自行拉取数据。

## 新增 / 重构 / 删除向导

### 新增子功能

- 若为现有子模块（如 `providers/`）扩展详情标签：在对应 `detail-tabs/` 目录下新增 Tab 组件，并在详情页 `Tabs` 组件中注册；
- 若为全新的 MCP 资源类型：在 `mcps/` 下新建子目录，参照 `providers/` 的文件结构组织，并在路由层（`src/router/_authenticated/mcps/`）注册路由。

### 重构

- 跨子模块复用的图表或统计组件移入 `shared/` 目录进行沉淀。

### 删除子模块

- 同步删除 `src/router/_authenticated/mcps/` 下的对应路由定义，并在 `layouts/data/sidebar-data.ts` 中移除导航入口。
