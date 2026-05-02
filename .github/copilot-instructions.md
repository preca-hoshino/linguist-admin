# Linguist-Admin — 管理面板前端项目规范

## 技术栈
React 19 + Vite + TypeScript (ESM) + TanStack Router + Zustand + shadcn/ui (new-york) + Tailwind CSS v4 + i18next

## 项目结构

```
src/
├── api/            # API 调用层（client.ts + 领域 API 模块）
├── components/     # UI 组件（ui/ 为 shadcn，其余为业务组件）
├── composables/    # 可复用纯逻辑 Hooks
├── config/         # 运行时配置（Vite env）
├── i18n/           # 国际化（zh-CN 主语言，en 翻译目标）
├── layouts/        # 布局组件
├── providers/      # React Context Providers（Theme, Font, Direction 等）
├── router/         # TanStack Router 文件式路由
├── stores/         # Zustand 全局状态
├── styles/         # Tailwind CSS 主题与工具类
├── types/          # 集中类型定义
├── utils/          # 纯工具函数
└── views/          # 页面级组件（按领域分目录）
```

## 构建与运行

```bash
npm run dev          # 开发模式（Vite HMR）
npm run build        # 构建（tsc -b + vite build）
npm run check        # 全量检查（format + lint + types + deps + test）
npm run preview      # 预览生产构建
```

## 细分规范索引

| 领域 | 文件 |
|------|------|
| 工作流 | `.github/instructions/git-workflow.instructions.md` |
| 代码风格 | `.github/instructions/code-style.instructions.md` |
| API 调用 | `.github/instructions/api-client.instructions.md` |
| 状态管理 | `.github/instructions/state-management.instructions.md` |
| 路由 | `.github/instructions/routing.instructions.md` |
| 国际化 | `.github/instructions/i18n.instructions.md` |
| 表单 | `.github/instructions/forms.instructions.md` |
| UI 组件 | `.github/instructions/ui-components.instructions.md` |
| 测试 | `.github/instructions/testing.instructions.md` |
