---
description: 'UI 组件规范 — shadcn/ui new-york 风格、图标、Tailwind CSS v4、主题'
applyTo: 'src/components/**/*.tsx'
---

# UI 组件规范

## 概述
本文件定义 Linguist-Admin 的 UI 组件规范：使用 shadcn/ui new-york 风格，lucide-react 图标，Tailwind CSS v4 样式系统，以及自定义样式和主题管理。

---

## 核心规则

### 1. shadcn/ui 基础组件

基础组件统一放在 `src/components/ui/`，通过 `components.json` 管理：

```
src/components/ui/
├── button.tsx
├── input.tsx
├── form.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── table.tsx
├── card.tsx
├── badge.tsx
├── select.tsx
├── tabs.tsx
├── ...
```

**添加新组件**：
```bash
npx shadcn@latest add button    # new-york 风格
```

### 2. 样式 — Tailwind CSS v4

使用 Tailwind CSS v4 原子类：

```typescript
// ✅ 正确 — Tailwind 原子类
<div className="flex items-center gap-2 rounded-lg border p-4">
  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
  <span className="text-sm text-muted-foreground">{subtitle}</span>
</div>
```

自定义工具类放在 `src/styles/index.css`：

```css
/* src/styles/index.css */
@import 'tailwindcss';

@theme {
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;
  /* ... */
}
```

### 3. 图标

- **通用图标** → `lucide-react`：

```typescript
import { Search, Settings, User, Trash2, Plus } from 'lucide-react';

<Button>
  <Plus className="h-4 w-4" />
  Create
</Button>
```

- **提供商图标** → `@lobehub/icons`：

```typescript
import { OpenAIIcon, AnthropicIcon, GeminiIcon } from '@lobehub/icons';
```

### 4. 主题变量 — `src/styles/theme.css`

主题通过 CSS 变量实现 light/dark 切换：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### 5. 业务组件组织

业务组件放在 `src/components/` 下各自目录：

```
src/components/
├── ui/                    # shadcn/ui 基础组件
├── data-table/            # 数据表格业务组件
├── connect-drawer/        # 连接抽屉组件
├── provider/              # 提供商相关组件
├── markdown-viewer/       # Markdown 查看器
├── CommandMenu.tsx        # 命令面板
├── ConfirmDialog.tsx      # 确认对话框
├── CodeViewer.tsx         # 代码查看器
├── ThemeSwitch.tsx        # 主题切换
├── LangSwitch.tsx         # 语言切换
└── ProfileDropdown.tsx    # 用户下拉菜单
```

### 6. RTL/LTR 双向布局

通过 `DirectionProvider` 支持：

```typescript
// 在根组件中自动设置
// document.documentElement.dir = 'ltr' 或 'rtl'
```

Tailwind CSS v4 自动处理 RTL 语义（`start-*` / `end-*` 替代 `left-*` / `right-*`）。

---

## 常见陷阱

| 陷阱 | 正确做法 |
|------|----------|
| 在 `src/components/ui/` 中编写业务逻辑 | 该目录仅放 shadcn/ui 基础组件 |
| 使用内联 `style` 而非 Tailwind 类 | 使用 Tailwind 原子类 |
| 图标尺寸不一致 | 统一使用 `h-4 w-4` 或 `h-5 w-5` |
| 自定义 CSS 直接修改 shadcn 组件 | 通过 Tailwind className 或 theme 变量覆盖 |
| 忽略 RTL 布局 | 使用 `start-*` / `end-*` 替代 `left-*` / `right-*` |
| 不检查 `components.json` | 组件添加/配置变更都需通过它管理 |

## 项目参考

- `src/components/ui/` — shadcn/ui 基础组件
- `src/styles/index.css` — Tailwind 主题和工具类
- `src/styles/theme.css` — 主题 CSS 变量
- `src/components/ThemeSwitch.tsx` — 主题切换组件
- `src/components/LangSwitch.tsx` — 语言切换组件
- `components.json` — shadcn/ui 配置
