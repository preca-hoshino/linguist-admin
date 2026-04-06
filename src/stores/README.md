# src/stores — 状态管理模块

> 项目总览：参见 [README.md](../README.md)

## 简介

全局应用状态的储存管控与方法暴露层。依托诸如 Zustand 这类的现代轻量状体控制框架打造，代替 Context 构建更稳健、支持异步并发动作且兼顾高性能读写的无头单例数据中心（Headless stores）。

## 目录结构

```
stores/
├── appStore.ts          # 总体界面级的配置型开关或者系统运转标记管理
└── authStore.ts         # 有关身份核对、验证参数留存的信息聚合并控制操作
```

## 主要模型 / 仓库

### `authStore` 的典型实现

维持或管理认证相关诸如 `token`、用户信息及判定逻辑。运用持久层中间件（`persist`）与浏览器的 Storage 的接口进行对接挂钩，自动读取并注入至客户端状态树内；暴露快捷且稳妥地清空函数用于处理用户断代退出。

## 使用方式

无论是在典型的 React Render 生命周期中还是脱机处于别的 JavaScript 上下文都可流畅调用：

```tsx
import { useAuthStore } from '../stores/authStore'

export function UserProfile() {
  // 脱离复杂 Props 的 Drilling 并仅截获必须的状态触发视图变更
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return <button onClick={clearAuth}>Logout for {user?.name}</button>
}
```

```tsx
// 在纯 API 或者请求监听中枢获取其只读实体状态
import { useAuthStore } from '../stores/authStore'

export function performNetworkInterceptor() {
  const token = useAuthStore.getState().token
  // ..将口令埋在请求 Headers 体内传递给 Gateway..
}
```

## 新增 / 重构 / 删除向导

### 创建新应用仓库

- 按业务板块去新增 Store 的划分机制是推荐方式，不要图一时的轻便将上百种无内在统一联络的业务键全部混淆存放于单独一个超大 `globalStore` 文件内。
- 为了开发效率，不妨加挂附带诸如 `devtools` 或 `immer` 的底层拦截能力件。

### 重构

- **维护类型安全与破坏性重命名**：更改储存属性名称或重塑子结构对象前，特别注意采用本地持续保存项的 `authStore` 这类文件；因缓存内仍含有旧形态数据，贸然更名经常招引未命中的 UI 异常错误。

### 删除

- 在撤掉弃用状态或者将原有统一属性降级分配至单个子级 UI 作为内部变量之时，使用编译器验证排除掉外接对此存储层无意遗留的呼叫请求。
