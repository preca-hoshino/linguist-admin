# src/views/dashboard — 数据看板模块

> 父模块：[`src/views/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/api/README.md`](../../api/README.md)（统计数据 API）

## 简介

系统运营数据的可视化中控看板，展示请求量、Token 消耗、延迟分布、模型使用占比、错误率等核心指标的趋势图表。支持时间范围筛选，是评估网关运行状态的主要入口。

## 目录结构

```
dashboard/
├── index.tsx                      # 路由入口，时间范围状态管理与 Tab 切换
├── components/                    # 看板专属的图表与指标卡片组件
│   ├── AppBarChart.tsx            # 应用维度的请求量柱状图
│   ├── CostChart.tsx              # 费用趋势折线图
│   ├── DistributionCard.tsx       # 分布统计卡片（如模型分布）
│   ├── DistributionKpiCards.tsx   # 分布维度 KPI 汇总卡
│   ├── ErrorChart.tsx             # 错误数量趋势图
│   ├── ErrorRateCard.tsx          # 错误率展示卡
│   ├── GenerationRateChart.tsx    # 生成速率图表
│   ├── LatencyChart.tsx           # 延迟趋势折线图
│   ├── UsageChart.tsx             # 总使用量趋势图
│   ├── PerfStatCards.tsx          # 性能汇总指标卡组
│   ├── TimeRangePicker.tsx        # 时间范围选择器
│   └── [其他图表/指标卡组件]
└── tabs/                          # 各 Tab 内容区域
    ├── OverviewTab.tsx            # 总览 Tab：请求量 + 费用 + Token
    ├── PerformanceTab.tsx         # 性能 Tab：延迟 + 生成率
    ├── DistributionTab.tsx        # 分布 Tab：模型/应用占比分析
    └── ErrorTab.tsx               # 错误 Tab：错误量 + 错误率
```

## 核心设计

| 组件 / 文件 | 说明 |
| --- | --- |
| `index.tsx` | 顶层容器，负责时间窗口状态、Tab 路由切换和全局数据预取 |
| `tabs/` | 将大看板按功能维度拆分为独立 Tab，各 Tab 自行组合所需图表组件 |
| `components/` | 原子级可复用图表和指标卡，接收纯数据 Props，不直接发起 API 请求 |

## 设计规范

- **数据下沉**：所有 API 调用（TanStack Query）集中在 `index.tsx` 发起，图表组件通过 Props 接收已处理的数据。
- **按需刷新**：时间范围切换通过 `queryKey` 变化自动触发重新请求，无需命令式刷新。
- **图表库**：统一使用 Recharts，保持图表风格一致；禁止在看板中混用其他图表库。

## 新增 / 重构 / 删除向导

### 新增指标卡或图表

1. 在 `components/` 下新建图表组件（接受数据 Props，返回 JSX）；
2. 在适当的 `tabs/` 文件中引入并嵌入该组件；
3. 若需要新的 API 数据，在 `index.tsx` 中添加对应的 `useQuery` 调用并通过 Props 往下传递。

### 新增 Tab

1. 在 `tabs/` 下新建 `XxxTab.tsx`；
2. 在 `index.tsx` 的 Tab 配置中注册新 Tab。

### 删除指标

- 从对应 Tab 文件中移除组件引用，确认无孤立 import 后删除 `components/` 中对应文件。
