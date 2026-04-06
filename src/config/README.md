# src/config — 配置模块

> 项目总览：参见 [README.md](../README.md)

## 简介

集中管理项目全局范围内的静态配置常量和基础系统数据定义（如应用字体、界面全局参数等）。此类文件不应包含任何网络副作用和动态路由逻辑，在应用启动及常态运行中为各类子系统提供底层支撑。

## 目录结构

```
config/
├── fonts.ts     # 项目包含及引用的字体族常量和策略定义
└── runtime.ts   # 后台系统的环境配置/运行期默认常量
```

## 核心项定义

### `fonts.ts` / `runtime.ts`

向外直接暴露静态对象或环境映射数据。作为系统内部字典，减少散落在各代码角落中的魔术字符串现象。

## 使用方式

```ts
import { fonts } from '../config/fonts'
import { runtimeConfig } from '../config/runtime'

export function App() {
  return (
    <div style={{ fontFamily: fonts.sans }}>
      Dashboard BaseURL - {runtimeConfig.API_PREFIX}
    </div>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增配置项

- 短平快的方法是在现有的 `fonts.ts` 或 `runtime.ts` 对象内部拓展所需的属性节点。
- 若为全新业务领域或全新系统模块的环境配置（如涉及外部授权平台的常数配置等），建议在此下属独立新建类似 `oauth.ts` 文件。

### 重构

- 改动配置变量值或键名时，请务必全路径项目检索或利用 TypeScript compiler 工具链（`npm run type-check`）以扫描各使用端面的适配情况。

### 删除

- 通过工具链确认相关无引后方可删除。若项目中有对不存在项的可选链使用情况，应留意是否造成不预期的 UI 折降。
