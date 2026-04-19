---
trigger: always_on
---

## 项目技术栈约定

本项目为 **React + TypeScript + Vite** 前端管理后台，使用以下工具链，agent 须严格遵守：

- **包管理**：`npm`，禁止使用 yarn / pnpm
- **格式化 + Lint**：Biome + ESLint，通过 `npm run check` 统一执行，禁止手动格式化
- **类型检查**：`tsc -b`，禁止使用 `@ts-ignore`（仅允许在有第三方类型缺陷的强制原因时使用 `@ts-expect-error` 并附注释说明）
- **依赖扫描**：knip，引入新依赖前须确认未产生未使用导出
- **测试框架**：Vitest，测试文件放在对应模块的 `__tests__/` 子目录下

---

## 目录结构规范

### 核心模块分层（严格遵守，不得越层引用）

```
src/
├── api/            → 仅负责封装 HTTP 请求函数，不含视图逻辑或状态管理
├── assets/         → 静态资源（图标 SVG 组件、品牌图标等）
├── components/     → 可复用 UI 组件，分为 ui/（shadcn 原子组件）和 data-table/（表格控件）
├── composables/    → 自定义 React Hook，仅封装 UI 交互逻辑，禁止直接调用 API
├── config/         → 全局静态配置常量（字体、环境变量等）
├── i18n/           → 国际化配置（i18next 初始化）及 locales/ 翻译资源
├── layouts/        → 页面骨架组件（侧边栏、Header、AuthenticatedLayout），及 data/ 导航数据
├── providers/      → React Context Provider 层，依赖 composables/ 实现，不含网络请求
├── router/         → TanStack Router 约定式路由文件，仅允许挂载页面组件和守卫逻辑
├── stores/         → Zustand 全局状态仓库（认证、应用级配置）
├── styles/         → 全局 CSS 样式表与 CSS 变量主题定义
├── types/          → 纯类型定义，禁止包含任何运行时逻辑
├── utils/          → 纯工具函数，禁止依赖项目内部模块（types/ 除外）
└── views/          → 业务页面视图，按功能域划分子目录，每个子域自成体系
```

### 层级引用约束

- `views/` 可以引用 `api/`、`components/`、`composables/`、`stores/`、`types/`
- `components/` **禁止**引用 `views/` 或 `stores/`（应保持无状态和高复用性），可通过 Props 接收数据
- `composables/` **禁止**直接调用 `api/`（网络请求应在 views 层通过 TanStack Query 发起）
- `api/` **禁止**引用 `views/`、`components/`、`stores/`
- `utils/` **禁止**引用除 `types/` 以外的任何内部模块

### 新增模块时必须

1. 在对应层的 `index.ts` 中统一再导出，保持外部入口单一（`components/data-table/index.ts`、`api/index.ts` 等）
2. 在模块目录下同步创建或更新 `README.md`，格式参照现有模块文档
3. 新增 `views/` 子域时，须同步在 `router/` 下创建对应路由文件，并在 `layouts/data/sidebar-data.ts` 中注册导航入口

---

## 代码编写规范

### 命名

| 场景 | 规范 | 示例 |
| --- | --- | --- |
| 文件名（通用） | kebab-case | `use-mobile.ts`、`apps-columns.tsx` |
| 文件名（React 组件） | PascalCase | `DataTablePagination.tsx`、`UserMutateDialog.tsx` |
| 组件名 / 类名 | PascalCase | `DataTableToolbar`、`AuthStore` |
| 函数 / 变量 | camelCase | `useDialogState`、`fetchProviders` |
| CSS 变量 / 主题 token | kebab-case | `--primary`、`--sidebar-width` |
| 常量（模块级） | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE`、`API_PREFIX` |
| 分支命名 | 参照 CONTRIBUTING.md | `feat/xxx`、`fix/xxx`、`docs/xxx` |

### 错误处理

- API 请求错误通过 `api/client.ts` 中的 `request<T>` 统一捕获并抛出标准 `Error`，禁止在各业务函数中重复处理 HTTP 状态码
- TanStack Query 的 `onError` / `throwOnError` 回调负责将错误传递至 UI 层（通过 `sonner` toast 展示），**禁止**在 `useQuery` / `useMutation` 回调内直接 `console.error`
- 用户操作类错误（如表单校验失败）通过 `react-hook-form` + `zod` 的标准校验流程处理，不得绕过 schema 手动抛出
- `catch (err)` 块须处理 `err instanceof Error` 与非 Error 两种情况，禁止 `catch (err: any)`

### 数据获取（TanStack Query）

- `useQuery` / `useMutation` 调用**只允许**在 `views/` 各域的 `index.tsx`（主容器）中发起，子组件通过 Props 或 Context 接收数据
- `queryKey` 须包含所有影响请求结果的参数（分页状态、过滤条件等），确保缓存失效行为正确
- 列表分页统一使用 `{ page, pageSize }` 结构，游标分页使用 `{ cursor, pageSize }` 结构，不得在 `queryKey` 以外硬编码默认值
- Mutation 成功后须调用 `queryClient.invalidateQueries()` 使相关列表缓存失效，禁止手动拼装本地缓存

### 表单（react-hook-form + zod）

- 所有表单**必须**绑定 Zod schema 进行校验，禁止手动 `if/else` 校验字段
- schema 定义放在表单组件文件顶部，或复杂场景抽取到同目录的 `schema.ts`
- 新增/编辑共用同一对话框时，使用 `useEffect` 在 `open` 变为 `true` 时 `reset(defaultValues)`，确保每次打开表单状态干净

### 状态管理（Zustand）

- 全局状态仅用于跨多个顶层页面共享的数据（如 `authStore` 的认证信息）；单个页面内部的临时状态使用 `useState` / `useReducer`
- 不得在 Zustand store 中发起网络请求（网络请求属于 TanStack Query 管理范畴）
- 使用 `persist` 中间件时须指定明确的 `name`（storage key），修改 store 结构时须同步更新 `version` 并实现 `migrate` 函数，避免旧缓存破坏状态

### 样式（Tailwind CSS）

- 禁止内联 `style` 对象处理可以用 Tailwind 类表达的样式（颜色、间距、字体大小等）
- 禁止在组件内部直接引用 `theme.css` 中的 CSS 变量字符串（应通过 shadcn 的 `cn()` 工具函数组合 Tailwind 类名）
- 条件样式使用 `cn(clsx(...))` 或 `cva`，禁止字符串拼接类名（`"bg-" + color`）
- 新增 UI 变体时优先通过 `cva` 定义 `variants`，而非在 JSX 中写三元表达式

### 类型

- 禁止使用 `any`，类型不确定时使用 `unknown` 并在使用前做类型收窄
- 跨模块共享的接口类型定义统一放在 `src/types/` 中；模块私有类型放在对应文件顶部或 `types.ts`
- API 响应类型须通过泛型约束 `request<MyType>(...)` 明确声明，不得使用 `as unknown as T` 做强制转型

---

## 新增业务视图域的完整流程

新增一个业务资源的管理页面（如新的实体类型）须按以下顺序完成，每步通过 `npm run check` 后再原子提交：

1. **API 层**：在 `src/api/` 中新建 `<entity>.ts`，封装该实体的 CRUD 请求函数，并在 `src/api/index.ts` 追加导出
2. **类型层**（如需）：在 `src/types/` 中新增跨模块共享的实体类型定义
3. **视图层**：在 `src/views/<entity>/` 下建立标准文件结构（见下方"标准视图文件结构"）
4. **路由层**：在 `src/router/_authenticated/<entity>/` 下创建路由文件，将视图组件与路由路径绑定
5. **导航层**：在 `src/layouts/data/sidebar-data.ts` 中添加侧边栏导航入口（含路由路径和图标）
6. **文档**：在 `src/views/<entity>/README.md` 中说明模块职责、目录结构和核心组件表格

### 标准视图文件结构

```
views/<entity>/
├── index.tsx                    # 主容器（TanStack Query 调用、对话框状态调度）
├── <entity>-columns.tsx         # TanStack Table 列定义
├── <entity>-context.tsx         # 操作状态 React Context（当前编辑行、对话框开关等）
├── <entity>-dialogs.tsx         # 对话框挂载聚合（统一挂载本域所有弹窗）
├── <entity>-mutate-dialog.tsx   # 新增/编辑表单对话框（合并新增与编辑场景）
├── <entity>-primary-buttons.tsx # 表格顶部主操作按钮区（如"新建"按钮）
├── <entity>-row-actions.tsx     # 表格行内操作下拉菜单（编辑、删除等）
├── <entity>-table.tsx           # 完整表格组件（含工具栏、表格主体、分页）
└── README.md                    # 模块文档
```

若实体有详情页，新增：

```
├── <entity>-detail-page.tsx     # 详情页容器
└── detail-tabs/                 # 详情页各 Tab 内容组件
    └── <Entity>XxxTab.tsx
```

若存在就近组件需要剥离：

```
└── components/                  # 模块私有重型组件（如复杂表单区块）
    └── <Entity>XxxForm.tsx
```

---

## 新增通用组件的流程

新增一个对多个业务视图均有复用价值的通用 UI 控件须按以下规范处理：

1. **归类判断**：
   - 属于无业务逻辑的纯 UI 原子组件（如新的 shadcn 组件）→ 放入 `src/components/ui/`，通过 `npx shadcn-ui@latest add <name>` 生成
   - 属于表格相关通用控件（排序、过滤、分页等）→ 放入 `src/components/data-table/`，并在 `index.ts` 导出
   - 属于单一业务域的私有组件 → 放入对应 `views/<entity>/components/`，不得放在全局 `components/`
2. **Props 设计**：组件 Props 接口须明确声明，通过 TypeScript 类型而非注释来约束调用方
3. **不得**在 `src/components/` 下的组件中引用 `stores/` 或发起 API 请求

---

## MCP 视图规范

- **名称显示**：前端展示虚拟 MCP 时始终展示 `name`（用户可读的全局唯一标识符），不得在 UI 中暴露数据库 `id` 字段
- **工具白名单**：工具名称白名单编辑器（`VirtualMcpToolsTab.tsx`）须从服务端获取实际可用工具列表后再渲染，不得硬编码可选项
- **SSE 连接指引**：在虚拟 MCP 详情页的配置展示中，客户端连接 URL 使用固定路径 `/mcp/sse`，并以 `X-Mcp-Name: <name>` header 作为路由标识

---

## 文档规范

- 每个 `src/` 子目录（含二级）须有对应的 `README.md`
- README 格式须包含：顶部父模块链接、简介、目录结构（代码块）、核心组件/接口表格、新增/重构/删除向导
- 新增视图域或组件后，须**同步更新**对应的 README（不得发起 PR 时文档与实现不一致）
- 新增/修改 API 端点调用后，须检查 `src/api/` 下对应文件的导出是否已在 `index.ts` 中注册
