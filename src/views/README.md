# src/views — 业务视图模块

> 项目总览：参见 [README.md](../README.md)
> 
> 相关模块：[`src/router/README.md`](../router/README.md)（路由配置层挂载点）、[`src/components/README.md`](../components/README.md)（底层元件依赖）

## 简介

对应项目中的具体功能级大页面或核心区块（即传统意义上的 Pages 或 Features 等级）。这里不存放散装、细颗粒的微件，而是将复数的高阶组件、API 抓取逻辑与系统状态串连组织在一起的实际展示“画板”。

## 目录结构

```
views/
├── HelloWorldView.tsx       # 通用示意与占位根页面
├── dashboard/               # 平台中控看板聚合相关页
├── settings/                # 账号与偏好设定面板域
├── models/                  # 模型能力、渠道及虚拟路由管理核心模块
├── users/                   # 人员与管理员结构体系控制页
└── [其他域名称]/            # 与路由划分高度贴合的子模块区块大视图
```

## 主要模块组织流派

### 各领域的内部拆分

对于包含相当复杂逻辑的 `views` 下属业务域（例如 `models/` 或 `users/`），我们采用了严格的就近拆分原则：各自模块下包含独立的 `components/` 夹层用于重构复杂的弹出式表单和长列表页，并具备专属 `constants.ts` 或者独立细化的 `README.md`。主路口一般就是模块根路径下的 `index.tsx` 或组件主文件。

## 使用方式

这些页面绝大多数不应被其他组件所引入，它们是在路由表配置层进行绑定的终点站：

```tsx
// 在对应的路由层如  src/router/dashboard/index.tsx：
import { DashboardView } from '@/views/dashboard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardView,
})
```

## 新增 / 重构 / 删除向导

### 新增系统页面/功能屏幕

- **独立域切分**：为全新的功能域在 `views/` 内创建一个匹配名的新文件夹。
- **关联挂载**：开发完毕之后，进入 `src/router/` 层新建对应的访问路径和对应的 `createFileRoute` 获取链接地址。

### 重构

- **剥离组件**：若是该层级组件日渐臃肿而内含多处重复的列表构建逻辑或表单区块，将这部分切分成更小的 React 通用块后转移至应用主 `src/components/` 区域内以供其他地方服用。

### 删除

- 欲整体作废某些大版面，既要进入当前 `views/xxx` 文件夹执行抹除，亦要退回路由路由树中拆掉路由声明点，确保最终编译和跳转行为中对该区的指向真正阻断。
