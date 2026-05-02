---
description: '测试规范 — Vitest、组件测试、Mock 策略'
applyTo: '**/*.test.ts, **/*.test.tsx'
---

# 测试规范

基于 Vitest（配置在 `vite.config.ts` 的 `test` 字段）。测试文件 **必须** 与源文件同目录，以 `.test.ts` 或 `.test.tsx` 结尾。

---

## 1. Mock 策略

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock 模块
vi.mock('@/api/client', () => ({ request: vi.fn() }));

// Mock 函数
const mockFn = vi.fn();
mockFn.mockReturnValue('result');
mockFn.mockResolvedValue({ ok: true, data: {} });
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

// beforeEach 清理
beforeEach(() => { vi.clearAllMocks(); });
```

## 2. 组件测试（React Testing Library）

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

## 3. 运行测试

```bash
npm run check         # 全量检查
npx vitest            # 运行全部
npx vitest --coverage # 带覆盖率
```

> 纯逻辑测试不需要 jsdom 环境；使用 `vi.fn()` 非 `jest.fn()`。
