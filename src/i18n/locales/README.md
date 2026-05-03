# src/i18n/locales — 语言翻译资源

> 父模块：[`src/i18n/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)

## 简介

存放所有语言的翻译键值映射文件。每种语言对应独立的 TypeScript 模块，以结构嵌套的对象表示，所有语言文件须保持**完全相同的键结构**，英文（`en.ts`）作为类型锚点。

## 目录结构

```
locales/
├── en.ts                  # 英文聚合入口（import 子模块 → export default）
├── zh-CN.ts               # 简体中文聚合入口
├── en/                    # 英文翻译子模块（按领域拆分）
│   ├── common.ts          (~47 行)  通用 / 表格 / 空态
│   ├── nav.ts             (~19 行)  导航标签
│   ├── settings.ts        (~43 行)  设置页
│   ├── auth.ts            ( ~8 行)  认证 / 登出
│   ├── dashboard.ts       (~142 行) 仪表盘
│   ├── data.ts            ( ~4 行)  数据页
│   ├── users.ts           ( ~4 行)  用户管理
│   ├── api-keys.ts        (~30 行)  API Key 管理
│   ├── models-page.ts     (~440 行) 模型管理（最大模块）
│   ├── mcps-page.ts       (~152 行) MCP 工具管理
│   ├── command.ts         ( ~8 行)  命令面板
│   ├── connect-drawer.ts  (~23 行)  快速接入抽屉
│   ├── config-drawer.ts   (~18 行)  外观设置抽屉
│   └── apps.ts            (~48 行)  应用管理
└── zh-CN/
    └── (14 个文件，与 en/ 结构对称)
```

## 核心接口

| 文件 | 说明 |
| --- | --- |
| `en.ts` | 英文聚合入口：从 `en/` 子模块 import 后 `export default` 合并导出。作为 TS 类型推断基准。 |
| `zh-CN.ts` | 简体中文聚合入口：结构与 `en.ts` 对称。 |
| `en/*.ts` / `zh-CN/*.ts` | 按业务领域拆分的翻译子模块。每个模块 `export default { ... }`。 |

## 新增 / 重构 / 删除向导

### 新增翻译键

1. 在对应的 `en/<module>.ts` 中添加英文键值；
2. 在 `zh-CN/<module>.ts` 中对称添加中文翻译；
3. TypeScript 编译器会在聚合层自动校验键结构一致性。

### 修改翻译

- 直接更改对应子模块文件中的字符串值。
- **不得改变键名**（否则须同步 `en/` 与 `zh-CN/` 双方）。

### 新增语言文件

1. 新建 `locales/<locale>/` 目录，创建 14 个子模块文件，键结构完全对照 `en/`；
2. 新建 `locales/<locale>.ts` 聚合入口（参照 `en.ts`）；
3. 在父模块 `index.ts` 的 `resources` 中注册新语言。

### 删除翻译键

- 同步删除 `en/` 与 `zh-CN/` 中对应的键，并通过 `npm run check:types` 确认无遗留引用。
