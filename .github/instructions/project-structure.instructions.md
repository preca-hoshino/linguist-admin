---
description: 'Use when creating, moving, or organizing source files — directory structure, module placement, component organization, file size limits'
applyTo: 'src/**/*.ts, src/**/*.tsx'
---

# 目录结构规范 — Linguist-Admin 前端

Linguist-Admin 采用 **React 19 + Vite + TypeScript (ESM) + TanStack Router + Zustand + shadcn/ui** 技术栈。按领域分目录，组件与逻辑分离。

---

## 1. 目录总览

```
src/
├── api/            # API 调用层（client.ts + 领域 API 模块）
│   ├── client.ts   #   request() 封装 + ApiResult 解包
│   ├── auth.ts     #   认证相关 API
│   ├── users.ts    #   用户管理 API
│   └── ...
│
├── components/     # UI 组件
│   ├── ui/         #   shadcn/ui 基础组件（不手动修改）
│   └── ...         #   业务组件（按领域分目录）
│
├── composables/    # 可复用纯逻辑 Hooks（无 UI）
│
├── config/         # 运行时配置（Vite env）
│
├── i18n/           # 国际化（zh-CN 主语言，en 翻译目标）
│   ├── zh-CN/      #   中文翻译（按领域分文件）
│   └── en/         #   英文翻译
│
├── layouts/        # 布局组件（侧边栏 + 顶栏 + 内容区）
│
├── providers/      # React Context Providers（Theme, Font, Direction 等）
│
├── router/         # TanStack Router 文件式路由
│   ├── __root.tsx  #   根路由
│   └── ...         #   按功能模块分路由
│
├── stores/         # Zustand 全局状态（按领域分文件）
│
├── styles/         # Tailwind CSS 主题与工具类
│
├── types/          # 集中类型定义（跨模块共享）
│
├── utils/          # 纯工具函数（无副作用）
│
└── views/          # 页面级组件（按领域分目录）
    ├── dashboard/
    ├── models/
    │   ├── provider-models/
    │   ├── logs/
    │   └── ...
    └── ...
```

---

## 2. 文件命名规范

| 目标 | 规范 | 示例 |
|------|------|------|
| 文件名 / 目录名 | `kebab-case` | `auth-store.ts`, `use-theme.ts` |
| React 组件文件 | `kebab-case.tsx` | `user-card.tsx`, `data-table.tsx` |
| Hook 文件 | `use-*.ts` | `use-auth.ts`, `use-media-query.ts` |
| 类型文件 | `kebab-case.ts` | `api-types.ts` |
| 测试文件 | `*.test.ts(x)` | `user-card.test.tsx` |
| 目录入口 | `index.ts(x)` | `views/dashboard/index.tsx` |

---

## 3. 组件放置决策

| 场景 | 目录 |
|------|------|
| shadcn/ui 基础组件 | `components/ui/` |
| 跨页面复用的业务组件 | `components/<domain>/` |
| 单页面使用的组件 | `views/<page>/components/` |
| 纯逻辑 Hook | `composables/use-*.ts` |
| 全局状态 | `stores/<domain>-store.ts` |
| 页面级组件 | `views/<domain>/index.tsx` |
| API 调用 | `api/<domain>.ts` |
| 共享类型 | `types/<domain>.ts` |
| 工具函数 | `utils/<name>.ts` |

### 组件内聚原则

页面级组件可以内聚子组件到自身目录下：

```
views/models/provider-models/
├── index.tsx                           # 页面入口
├── provider-models-mutate-dialog.tsx   # 主对话框
├── components/                         # 页面内聚子组件
│   ├── pricing-section.tsx
│   ├── capabilities-section.tsx
│   └── ...
└── schema.ts                           # 页面专属 Zod schema
```

---

## 4. 文件行数限制

| 行数范围 | 状态 | 处理方式 |
|----------|------|---------|
| **≤ 300 行** | ✅ AI 友好 | 无需处理 |
| **300–500 行** | 🟡 需审查 | 评估是否可按职责拆分 |
| **> 500 行** | 🔴 必须拆分 | 禁止合入，强制拆分后重新提交 |

> 单个组件/函数建议 **≤ 200 行**，超过则提取子组件。

---

## 5. 大文件拆分规范

当文件超过 300 行时，按以下模式拆分：

### 5.1 拆分决策树

```
文件 > 300 行？
├─ 组件文件 (.tsx)
│  ├─ 包含多个独立区块 → 按区块拆分为子组件
│  │  └─ 例: mutate-dialog.tsx → components/{pricing,capabilities,...}.tsx
│  ├─ 包含复杂表单 schema → 提取 schema.ts
│  └─ 包含表格列定义 → 提取 columns.tsx + cells/*.tsx
│
├─ Hook 文件 (.ts)
│  ├─ 多个独立逻辑 → 拆分为多个 Hook
│  └─ 单一逻辑但过长 → 提取子函数到同文件
│
└─ 类型文件 (.ts)
   ├─ 按领域拆分 → types/{chat,user,config}.ts
   └─ 按资源拆分 → types/{request,response,stream}.ts
```

### 5.2 拆分后的目录结构

拆分后的子组件放在页面目录的 `components/` 下：

```
# 拆分前
views/models/provider-models/provider-models-mutate-dialog.tsx  (914 行)

# 拆分后
views/models/provider-models/
├── provider-models-mutate-dialog.tsx   # 对话框壳 + 表单编排 (~200 行)
├── schema.ts                           # Zod schema 定义 (~100 行)
└── components/
    ├── pricing-section.tsx             # 定价层级表单区 (~150 行)
    ├── capabilities-section.tsx        # 能力配置区 (~100 行)
    ├── rate-limit-section.tsx          # 速率限制区 (~80 行)
    ├── request-overrides-section.tsx   # 请求覆盖参数区 (~100 行)
    └── provider-config-section.tsx     # 提供商配置区 (~80 行)
```

### 5.3 已识别的拆分目标

| 文件 | 行数 | 拆分目标 |
|------|------|---------|
| `views/models/provider-models/provider-models-mutate-dialog.tsx` | ~914 | → `components/{pricing,capabilities,rate-limit,request-overrides,provider-config}-section.tsx` + `schema.ts` |
| `views/models/logs/logs-columns.tsx` | ~313 | → `logs-columns.tsx` + `cells/{status,tokens,latency}-cell.tsx` |

---

## 6. 禁止事项

- ❌ **跨目录深层引用**：`views/` 不直接引用 `views/` 下其他页面的内部组件
- ❌ **组件内混业务逻辑**：数据获取、状态管理放 `composables/` 或 `stores/`
- ❌ **修改 shadcn/ui 组件**：`components/ui/` 下的文件由 shadcn CLI 管理
- ❌ **超大文件**：> 500 行的文件禁止提交；300–500 行需评估拆分
- ❌ **any 类型**：使用 `unknown` + 类型守卫或泛型约束
- ❌ **const 箭头组件**：使用 `function` 关键字声明组件
