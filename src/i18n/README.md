# src/i18n — 国际化模块

> 项目总览：参见 [README.md](../README.md)
>
> 相关模块：[`src/config/README.md`](../config/README.md)（全局配置）、[`src/components/README.md`](../components/README.md)（UI 文案消费方）

## 简介

集中管理项目的多语言国际化配置。基于 `i18next` + `react-i18next` 实现，支持运行时语言切换；翻译资源以 TypeScript 对象形式组织在 `locales/` 子目录下，保证完整类型推断与编译期键值校验。

## 目录结构

```
i18n/
├── index.ts          # i18next 初始化入口，注册语言资源与默认语言
└── locales/          # 各语言翻译字典文件
    ├── en.ts         # 英文（English）翻译资源
    └── zh-CN.ts      # 简体中文翻译资源
```

## 核心接口

| 文件 / 导出 | 说明 |
| --- | --- |
| `index.ts` default export | 已初始化的 `i18next` 实例，在 `main.tsx` 导入以触发副作用完成注册 |
| `locales/en.ts` | 英文键值映射对象（兼作类型锚点，用于推断其他语言的翻译键） |
| `locales/zh-CN.ts` | 简体中文键值映射对象 |

## 使用方式

在任意组件中获取翻译文本：

```tsx
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('dashboard.title')}</h1>
}
```

在非 React 上下文（如 API 拦截器、工具函数）中使用：

```ts
import i18n from '../i18n'

const msg = i18n.t('errors.unauthorized')
```

## 新增 / 重构 / 删除向导

### 新增翻译键

1. 在 `locales/en.ts` 中增加对应的键值对（英文为基准语言，决定类型形态）；
2. 在 `locales/zh-CN.ts` 中同步添加对应的中文翻译，确保两个文件**键结构完全一致**；
3. 在组件中通过 `t('your.new.key')` 引用，TypeScript 会对键拼写进行强类型校验。

### 新增语言

1. 在 `locales/` 下新建 `<locale>.ts` 文件，参照 `en.ts` 的结构填写翻译；
2. 在 `index.ts` 中向 `resources` 对象注册新语言，并视需求调整 `supportedLngs`。

### 修改现有翻译

- 直接修改 `locales/*.ts` 中的对应字符串值即可，无需更改 TypeScript 类型（键名不变则类型自动兼容）。
- 若需重命名某个键，须全局搜索全部 `t('old.key')` 调用并同步替换，避免运行时键缺失。

### 删除翻译键

- 在 `locales/*.ts` 中移除键值后，运行 `npm run type-check` 确认无遗留的 `t()` 调用引用。
