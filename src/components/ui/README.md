# src/components/ui — 基础 UI 原子组件库

> 父模块：[`src/components/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)

## 简介

存放所有由 **shadcn/ui** 生成并纳入项目管理的基础 UI 原子组件。这些组件基于 Radix UI 无障碍原语构建，并配合 Tailwind CSS 样式系统，提供按钮、对话框、表单、下拉菜单等标准交互元素。

> **约定**：此目录下的组件**不应包含业务逻辑**，仅负责视觉呈现与无障碍交互。如需组合业务逻辑，请在 `src/components/` 根目录或对应视图的 `components/` 子目录中创建高阶组件。

## 目录结构

```
ui/
├── Accordion.tsx      # 折叠展开面板
├── Alert.tsx          # 静态通知提示框
├── AlertDialog.tsx    # 需要用户确认操作的弹窗对话框
├── Avatar.tsx         # 用户头像（图片 + 文字缩写 fallback）
├── Badge.tsx          # 状态徽章标签
├── Button.tsx         # 各类按钮变体（primary / secondary / ghost 等）
├── Calendar.tsx       # 日期选择日历
├── Card.tsx           # 信息卡片容器
├── Checkbox.tsx       # 复选框
├── Collapsible.tsx    # 可折叠内容区域
├── Command.tsx        # 命令面板（用于命令菜单 / Combobox）
├── Dialog.tsx         # 通用弹窗对话框
├── DropdownMenu.tsx   # 下拉操作菜单
├── Form.tsx           # 表单组件（集成 react-hook-form）
├── Input.tsx          # 文本输入框
├── InputOtp.tsx       # OTP 验证码输入框
├── Label.tsx          # 表单标签
├── Popover.tsx        # 悬浮气泡弹出层
├── Progress.tsx       # 进度条
├── RadioGroup.tsx     # 单选按钮组
├── ScrollArea.tsx     # 自定义滚动区域
├── Select.tsx         # 单值下拉选择器
├── Separator.tsx      # 分隔线
├── Sheet.tsx          # 侧拉抽屉
├── Sidebar.tsx        # 侧边栏骨架（应用级，非业务级）
├── Skeleton.tsx       # 骨架屏占位
├── Slider.tsx         # 滑块范围输入
├── Sonner.tsx         # Toast / 轻提示集成
├── Switch.tsx         # 开关切换
├── Table.tsx          # 原始 HTML 表格元素封装
├── Tabs.tsx           # 标签页切换
├── Textarea.tsx       # 多行文本框
└── Tooltip.tsx        # 悬停提示气泡
```

## 使用方式

```tsx
import { Button } from '../../components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'

export function EditDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑项目</DialogTitle>
        </DialogHeader>
        <Input placeholder="名称" />
        <Button onClick={onClose}>保存</Button>
      </DialogContent>
    </Dialog>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增 shadcn/ui 组件

使用 CLI 自动生成并加入此目录：

```bash
npx shadcn-ui@latest add <component-name>
```

生成产物将自动放置在此目录，**无需手动创建**。

### 重构现有组件

- 可以在组件内调整 Tailwind 类名以修改视觉效果；
- **不应**更改组件的 Props 接口（这会破坏所有调用方的类型契约）；
- 如需扩展特定样式变体，优先通过 `cva`（class-variance-authority）添加新 `variant`，而不是修改默认样式。

### 删除组件

- 通过全局搜索或 `npm run type-check` 确认组件无任何引用；
- 直接删除对应 `.tsx` 文件即可（此目录无统一 `index.ts`，各组件独立引用）。
