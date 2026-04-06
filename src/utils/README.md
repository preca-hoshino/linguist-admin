# src/utils — 基础工具库模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：全项目绝大部件（调用方）

## 简介

包含项目内高度通用的纯工具类函数（Utility / Helper）。主要涉及日期转换、字符串处理、特定格式校验、基础请求异常翻译等边界杂活。工具函数自身应尽可能保持纯函数的特性（无副作用，无 React 依赖）。

## 目录结构

```
utils/
├── utils.ts                 # 常见通配的帮助函数（如 className 合并）
├── cookies.ts               # 存取与处理 Cookie 的原生包装方法
├── handle-server-error.ts   # 后端报错文本提取与转化器
└── show-submitted-data.tsx  # 用于开发排障的日志或表数据拦截器
```

## 核心函数

### `utils.ts` 内的 `cn()` 函数

基于 `clsx` 与 `tailwind-merge` 建立的强力类名排查连接器，解决传递组件 `className` 合并且化解冲突。

### 后端支持辅助

配合请求库抛出及接收行为制作的数据转换包络，诸如 `handleServerError` 提供标准化的用户吐字信息。

## 使用方式

```ts
import { cn } from '../utils/utils'
import { getCookie } from '../utils/cookies'

export function Pill({ active, className }) {
  return (
    // 根据状态自动化裁定最终的类名
    <div className={cn("base-pill", active && "bg-blue", className)} />
  )
}
```

## 新增 / 重构 / 删除向导

### 新增工具

- 新增方法需强调纯正独立，测试不涉及 UI 环境；尽量把大号功能依据逻辑拆放入单独带有表明用途的模块文件（如 `date-utils.ts`）。

### 重构

- **向后兼容**：重构任意底层工具切记入参及出参不可进行突破性更改，或应当留存旧有函数作标记（如加上 `@deprecated` 备注）再过渡；配合 `npm run type-check` 扫描。

### 删除

- 大面通过 TS 编译器与全局字符串扫描，在充分确信孤立且被摒弃时放心剔除对应脚本段落或文件。
