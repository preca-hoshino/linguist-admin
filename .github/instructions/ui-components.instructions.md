---
description: 'UI 组件规范 — shadcn/ui new-york 风格、图标、Tailwind CSS v4、主题'
applyTo: 'src/components/**/*.tsx'
---

# UI 组件规范

shadcn/ui new-york + lucide-react + Tailwind CSS v4。

---

## 1. shadcn/ui 基础组件

统一放在 `src/components/ui/`，通过 `components.json` 管理。**该目录仅放 shadcn/ui 基础组件，不写业务逻辑**。

添加组件：`npx shadcn@latest add button`

## 2. 样式 — Tailwind CSS v4

```typescript
// ✅ Tailwind 原子类
<div className="flex items-center gap-2 rounded-lg border p-4">
  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
  <span className="text-sm text-muted-foreground">{subtitle}</span>
</div>

// ❌ 禁止内联 style；禁止模板字符串拼接 className（用 cn()）
```

自定义主题在 `src/styles/index.css`：

```css
@import 'tailwindcss';
@theme { --color-primary: #3b82f6; }
```

## 3. 图标

- 通用图标 → `lucide-react`：统一 `h-4 w-4` 或 `h-5 w-5`
- 提供商图标 → `@lobehub/icons`

```typescript
import { Search, Settings, Trash2, Plus } from 'lucide-react';
<Button><Plus className="h-4 w-4" />Create</Button>
```

## 4. 主题变量

通过 CSS 变量实现 light/dark 切换（`src/styles/theme.css`）：

```css
:root { --background: 0 0% 100%; --foreground: 222.2 84% 4.9%; }
.dark { --background: 222.2 84% 4.9%; --foreground: 210 40% 98%; }
```

## 5. 业务组件组织

```
src/components/
├── ui/                    # shadcn/ui 基础组件（不放业务逻辑）
├── data-table/            # 数据表格
├── connect-drawer/        # 连接抽屉
├── CommandMenu.tsx        # 命令面板
├── ConfirmDialog.tsx      # 确认对话框
├── ThemeSwitch.tsx        # 主题切换
└── LangSwitch.tsx         # 语言切换
```

## 6. RTL/LTR

通过 `DirectionProvider` 支持，用 `start-*`/`end-*` 替代 `left-*`/`right-*`。Tailwind CSS v4 自动处理 RTL 语义。
