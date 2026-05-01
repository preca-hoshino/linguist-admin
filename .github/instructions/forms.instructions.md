---
description: '表单规范 — react-hook-form、zod、zodResolver、shadcn/ui Form'
applyTo: 'src/**/*.tsx'
---

# 表单规范

## 概述
本文件定义 Linguist-Admin 的表单处理策略：使用 `react-hook-form` 管理表单状态，`zod` 定义验证 schema，`zodResolver` 桥接两者，shadcn/ui 的 `<Form />` 组件提供统一样式。

---

## 核心规则

### 1. react-hook-form + zod + zodResolver 完整示例

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Step 1: 定义 zod schema
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'user']).default('user'),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

// Step 2: 使用 useForm
export function CreateUserForm(): React.JSX.Element {
  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
    },
  });

  const onSubmit = async (data: CreateUserForm): Promise<void> => {
    const result = await createUser(data);
    // ...
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* fields */}
      </form>
    </Form>
  );
}
```

### 2. shadcn/ui `<Form />` 组件包裹模式

```typescript
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ✅ 正确的 shadcn/ui Form 用法
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter name" {...field} />
      </FormControl>
      <FormDescription>Display name for this user.</FormDescription>
      <FormMessage />  {/* 自动显示验证错误 */}
    </FormItem>
  )}
/>

<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### 3. 表单提交时的错误处理

```typescript
const onSubmit = async (data: CreateUserForm): Promise<void> => {
  const result = await createUser(data);

  if (result.ok) {
    toast.success('User created successfully');
    // 导航或重置
  } else {
    // API 返回的字段级错误
    if (result.error.param) {
      form.setError(result.error.param as keyof CreateUserForm, {
        message: result.error.message,
      });
    } else {
      // 全局错误
      toast.error(result.error.message);
    }
  }
};
```

### 4. 复杂动态字段 — `useFieldArray`

```typescript
import { useFieldArray } from 'react-hook-form';

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'items',
});

{fields.map((field, index) => (
  <div key={field.id}>
    <FormField
      control={form.control}
      name={`items.${index}.value`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )}
    />
    <Button type="button" onClick={() => remove(index)}>Remove</Button>
  </div>
))}
```

---

## 常见陷阱

| 陷阱 | 正确做法 |
|------|----------|
| 忘记 `defaultValues` | 始终设置 `defaultValues`，避免 uncontrolled/controlled 切换警告 |
| 提交时未检查 `isSubmitting` | 使用 `form.formState.isSubmitting` 禁用按钮防重复提交 |
| API 错误未映射回表单字段 | 根据 `error.param` 使用 `form.setError()` 映射 |
| zod schema 与 API 类型不匹配 | 使用 `z.infer<typeof schema>` 自动推导类型 |
| 不使用 `<FormMessage />` | 始终在 `<FormItem>` 中包含 `<FormMessage />` 显示验证错误 |

## 项目参考

- `src/components/ui/form.tsx` — shadcn/ui Form 组件（基于 react-hook-form）
- `src/components/ui/input.tsx` — shadcn/ui Input 组件
- `src/components/ui/button.tsx` — shadcn/ui Button 组件
