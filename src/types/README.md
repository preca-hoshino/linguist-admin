# src/types — 类型定义模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/api/README.md`](../api/README.md)（大量依赖接口类型的模块）

## 简介

集中存放跨越多个功能模块所需的全局 TypeScript 接口与类型声明（Interface / Type alias）。当某种数据模型形态在 API 抓取、Store 维持以及视图层面流转时，其类型防腐边界统一指向此处的文件，旨在消除各处重复手写的 `any` 或结构冗余。

## 目录结构

```
types/
├── index.ts              # 统一类型导出出口
└── [各业务域模型].ts      # user.ts, provider-model.ts, stats.ts 等
```

## 主要模型描述

### 各个 `.ts` 定义体

与后端接口及概念深度打通，例如描述服务器下发数据实体状貌的 `ApiKey`、`Provider` 或 `VirtualModel` 等基础模型声明。

## 使用方式

```ts
// 组件或逻辑内按需导入对应的跨模块模型：
import type { ProviderModel, VirtualModel } from '../types'

export function ModelCard({ data }: { data: VirtualModel }) {
  return <div>{data.slug}</div>
}
```

## 新增 / 重构 / 删除向导

### 新增全局类型

- 若遇复用的组件 Props 甚至 API 响应体结构，应在 `src/types` 中设立专门的描述文件，随后在 `index.ts` 聚总暴漏。

### 重构

- 类型重构必须慎重，对于联合类型、泛型的重定义需要同步应用 `npm run type-check` 进行大范围无死角核查，保障组件层面不会因此解构出错。

### 删除

- 通过 TS Server 引用检查可以清楚获知模型类型的被依赖程度，确保无引用后可以直接删除其声明体。
