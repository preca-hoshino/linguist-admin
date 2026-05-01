---
description: '测试规范 — Vitest、组件测试、Mock 策略'
applyTo: '**/*.test.ts, **/*.test.tsx'
---

# 测试规范

## 概述
本文件定义 Linguist-Admin 的前端测试规范：使用 Vitest（配置在 `vite.config.ts` 的 `test` 字段），测试文件与源文件同目录，以及组件测试的编写模式。

---

## 核心规则

### 1. 测试文件放置

测试文件 **必须** 与源文件同目录，以 `.test.ts` 或 `.test.tsx` 结尾：

```
src/
├── utils/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
├── api/
│   ├── client.ts
│   └── __tests__/
│       └── client.test.ts
└── components/
    ├── CommandMenu.tsx
    └── __tests__/
        └── CommandMenu.test.tsx
```

### 2. Vitest 配置

测试配置在 `vite.config.ts` 的 `test` 字段中：

```typescript
/// <reference types="vitest" />

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test.setup.ts'],
    // ...
  },
});
```

### 3. 运行测试

```bash
npm run check       # 全量检查（format + lint + types + deps + test）
npx vitest          # 运行全部测试
npx vitest --watch  # watch 模式
npx vitest --coverage # 带覆盖率
```

### 4. 测试结构 — `describe` / `it`

```typescript
import { describe, it, expect } from 'vitest';

describe('cn() utility', () => {
  it('should merge class names', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toBe('base extra');
  });
});
```

### 5. Mock 策略

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock 模块
vi.mock('@/api/client', () => ({
  request: vi.fn(),
}));

// Mock 函数
const mockFn = vi.fn();
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue({ ok: true, data: {} });

// 验证调用
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

### 6. 组件测试（React Testing Library）

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 常见陷阱

| 陷阱 | 正确做法 |
|------|----------|
| 测试文件与源文件分离 | 放在同目录 `__tests__/` 下 |
| 使用 Jest API（`jest.fn`）而非 Vitest API | 使用 `vi.fn()` |
| Mock 忘记重置 | 在 `beforeEach` 中 `vi.clearAllMocks()` |
| 测试纯函数却引入 jsdom | 纯逻辑测试不需要 jsdom 环境 |

## 项目参考

- `vite.config.ts` — Vitest 配置（`test` 字段）
- `src/test.setup.ts` — 测试初始化文件
- `src/utils/__tests__/` — 工具函数测试范例
- `src/api/__tests__/` — API 层测试范例
