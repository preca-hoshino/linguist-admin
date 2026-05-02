---
description: '表单规范 — react-hook-form、zod、zodResolver、shadcn/ui Form'
applyTo: 'src/**/*.tsx'
---

# 表单规范

react-hook-form + zod + shadcn/ui `<Form />` 组合。

---

## 1. 完整示例

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']).default('user'),
});

type FormData = z.infer<typeof schema>;

export function CreateUserForm(): React.JSX.Element {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'user' }, // 始终设置 defaultValues
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    const result = await createUser(data);
    if (result.ok) {
      toast.success('User created');
    } else if (result.error.param) {
      // API 字段级错误映射回表单
      form.setError(result.error.param as keyof FormData, { message: result.error.message });
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="Enter name" {...field} /></FormControl>
              <FormMessage /> {/* 自动显示验证错误 */}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
}
```

## 2. 动态字段 — `useFieldArray`

```typescript
const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

{fields.map((field, index) => (
  <div key={field.id}>
    <FormField control={form.control} name={`items.${index}.value`}
      render={({ field }) => (
        <FormItem><FormControl><Input {...field} /></FormControl></FormItem>
      )}
    />
    <Button type="button" onClick={() => remove(index)}>Remove</Button>
  </div>
))}
```

## 关键约束

- **始终设置 `defaultValues`** — 避免 uncontrolled/controlled 切换警告
- **提交时检查 `isSubmitting`** — 防重复提交
- **API 错误映射** — 根据 `error.param` 用 `form.setError()` 映射回字段
- **始终包含 `<FormMessage />`** — 显示验证错误
