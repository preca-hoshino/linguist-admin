# src/views/models — 模型域管理模块

> 父模块：[`src/views/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/api/README.md`](../../api/README.md)（API 调用层）、[`src/views/mcps/README.md`](../mcps/README.md)（并行的 MCP 管理域）

模块用途：统合系统内与物理大语言模型接入、虚拟路由映射以及模型调用留痕相关的视图逻辑。

## 简介
专门用于处理模型相关领域操作的 UI 层。与传统的单页平铺文件不同，这里采用了高聚合分解策略，即每个主功能块均附带独立的内部组件目录 `components` 和配置字典 `constants.ts`，以便将巨大的视图页面切分成符合最佳实践的代码大小，提升可维护性和阅读性。

## 目录结构
```
models/
├── provider-models/    # 实际由第三方供应商提供的模型管理 (如 GPT-4, Claude-3)
├── providers/          # 接入的供应商渠道配置 (含认证, 代理配置等)
│   ├── components/     # 大页面剥离出纯受控 UI 组件 (如 CredentialSection)
│   └── ...
├── virtual-models/     # 系统内部基于渠道模型再次分装、负载分配的虚拟模型配置
├── logs/               # 对各类模型产生的审计与请求踪迹面板 (明细追溯)
│   ├── detail-tabs/
│   │   ├── components/ # 剥离出日志详情页（如 LogToolsTab）中巨型的工具区视窗 (ToolWorkspace, ToolCallsResult)
│   └── ...
└── shared/             # 供上述各模型子模块复用的泛用块 (如计费图表等)
```

## 核心子模块

| 子目录 | 路由前缀 | 说明 |
| --- | --- | --- |
| `providers/` | `/models/providers` | 管理第三方 AI 服务商的接入配置（认证、代理） |
| `provider-models/` | `/models/provider-models` | 管理供应商下的具体模型实体（GPT-4、Claude 等） |
| `virtual-models/` | `/models/virtual-models` | 管理基于供应商模型封装的虚拟路由模型 |
| `logs/` | `/models/logs` | 查看所有模型请求的审计与调用踪迹 |
| `shared/` | — | 跨子模块复用的图表与可视化组件（如计费图） |

## 设计规范

- **就近抽取组件**：各子模型下衍生的抽屉/对话部分，以及重型表单部件，必须剥离出它所在的页面到自己私有的 `components/` 内。
- **配置分离**：硬编码选项列表与配置必须收集到相关域内的 `constants.ts` 以保持界面逻辑的纯粹。
- **数据调度集中**：核心容器充当 TanStack Query 指挥塔，子组件充当受控展现者，不得在叶子组件中直接发起 `useQuery`。

## 新增 / 重构 / 删除向导

### 新增子模块

1. 在 `models/` 下新建以功能域命名的子目录（如 `embeddings/`）；
2. 按照 `providers/` 的文件组织方式建立 `index.tsx`、列定义、Context、Dialog 等文件；
3. 在 `src/router/_authenticated/models/` 中注册对应路由，并在 `layouts/data/sidebar-data.ts` 中添加导航入口。

### 在子模块内新增表格列或操作

- **新增表格列**：修改对应子模块的 `*-columns.tsx`，增加列定义；
- **新增操作按钮**：在 `*-row-actions.tsx` 或 `*-primary-buttons.tsx` 中添加按钮，并在 `*-dialogs.tsx` 中挂载对应弹窗；
- **新增详情标签**：在子模块的 `detail-tabs/` 目录下新建 Tab 组件，并在详情页的 `<Tabs>` 中注册。

### 重构

- 若某子模块单文件代码量超过 400 行，应将复杂表单或详情区块拆分到该子模块内的 `components/` 目录；
- 跨子模块复用的图表组件沉淀至 `shared/` 目录，不要在多处复制粘贴。

### 删除子模块

- 同步删除 `src/router/_authenticated/models/` 下的路由文件及 `layouts/data/sidebar-data.ts` 中的导航项。
