# Provider 配置展示通用组件 (Provider)

[← 回到 components](../README.md)

## 简介
集中管理各类模型服务商（Virtual Model Provider）的图标（Logo）、类型徽章（Badge）和表格显示（Cell），确保全站品牌展示一致性。

## 目录结构
``text
provider/
├── ProviderLogo.tsx   # 封装不同服务商的图标/品牌色映射
├── ProviderBadge.tsx  # 在表格与详情页中使用的高对比度或柔和态徽标
└── ProviderCell.tsx   # 面向 DataTable 列设计的带图文卡片式单元格
``

## 核心组件与接口

| 组件名 | 职责 |
|---|---|
| ProviderLogo | 根据 Provider 类型自动匹配内置 SVGs 或远程图片链接。 |
| ProviderBadge | 显示 Provider 名称与图标的组合徽章，常用于标签或归类标记。 |
| ProviderCell | 为表格（Data Table）配置项渲染富展现形式的服务商说明卡片。 |