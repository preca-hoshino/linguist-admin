---
description: 'Linguist-Admin — 管理面板前端项目专属规则'
applyTo: '**/*.ts, **/*.tsx, **/*.jsx'
---

# Linguist-Admin 管理面板项目专属规则

## 代码风格
- 文件名 kebab-case，组件 PascalCase，函数/变量 camelCase
- 组件使用函数式声明 `export function ComponentName(): React.JSX.Element`
- Props 类型使用 `interface` 且字段标记 `readonly`
- 禁止 `any`，未知类型使用 `unknown`
- 使用 `cn()`（clsx + tailwind-merge）合并 className
- ESM 模块系统

## API 调用
- 所有 API 调用必须通过 `src/api/client.ts` 的 `request<T>()` 函数
- 返回值使用可辨识联合类型 `ApiResult<T>`：
  ```ts
  { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiErrorBody }
  ```
- **禁止在 API 函数中 throw**，错误通过 `{ ok: false, error }` 返回
- Token 由 client 自动注入，无需手动传递
- 查询参数使用 `URLSearchParams` 构建，不要手动拼接 URL

## 状态管理
- **全局状态使用 Zustand**（`create()` 模式），放在 `src/stores/`
- 订阅时必须使用 selector 避免不必要的重渲染：`useStore((s) => s.specificField)`
- 需要防重入的操作加 `inFlight` 标志位
- **页面级状态使用 React Context**（放在 `src/providers/`），通过自定义 hook 暴露

## 路由
- 使用 TanStack Router v1 文件式路由，路由文件放在 `src/router/`
- `_authenticated` 路由组用 `beforeLoad` 做鉴权守卫
- 路由树由 `@tanstack/router-plugin` 自动生成，不要手动编辑 `routeTree.gen.ts`
- 导航使用 `useNavigate()`，不要直接用 `window.location`

## 表单
- 使用 `react-hook-form` + `zod` schema 验证
- 使用 `@hookform/resolvers` 的 `zodResolver` 连接两者
- 复杂表单控件用 shadcn/ui 的 `<Form />` 组件包裹

## UI 组件
- UI 基础组件统一放在 `src/components/ui/`（shadcn/ui）
- 使用 shadcn/ui new-york 风格，通过 `components.json` 管理
- 图标使用 `lucide-react`，提供商图标使用 `@lobehub/icons`
- 样式使用 Tailwind CSS v4 原子类，自定义工具类放在 `src/styles/index.css`
- 支持 RTL/LTR 双向布局（通过 DirectionProvider）

## 国际化
- **所有面向用户的字符串必须使用 `useTranslation()` 的 `t()` 函数**
- 翻译文件放在 `src/i18n/locales/`（zh-CN 为主，en 为翻译目标）
- 语言检测优先级：Cookie > 浏览器设置，默认 zh-CN
- 语言偏好持久化到 Cookie `vite-ui-locale`

## 自定义 Hooks（Composables）
- 可复用的逻辑抽到 `src/composables/` 下的独立 hook 文件
- Hook 必须是纯逻辑，不包含 JSX
- 返回值使用 `useMemo`/`useCallback` 保持引用稳定
