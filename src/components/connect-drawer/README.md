# 接入指引配置向导 (Connect Drawer)

[← 回到 components](../README.md)

## 简介
提供给用户一种图形化向导方式，以帮助用户从当前页面拉取系统/应用所需要的 LLM 连接或 MCP 挂接配置，包括 Python/NodeJS 的 SDK 调用片段与系统终端 Curl 代码。

## 目录结构
``text
connect-drawer/
├── index.tsx               # 抽屉基础容器（ConnectDrawer）及挂载在内部的 Accordion 步骤页
├── types.ts                # 各类语言与支持的连接格式相关的枚举定义
├── snippet-template.tsx    # 提供根据入参组合并渲染交互式关键字的高亮代码组件
├── snippets.tsx            # 核心业务组件，组合具体的 cURL / NodeJS / Python 逻辑
└── InteractiveToken.tsx    # 可被用户一点即复制的交互式文本展示节点
``

## 核心组件与接口

| 组件名 | 职责 |
|---|---|
| ConnectDrawer | 收拢业务抽屉配置；响应来自右上角 Header 的触发信号。 |
| uildModelSnippet | 根据 SDK 语言分发出对应 LLM 模型的链接代码段落。 |
| uildMcpSnippet | 负责组装诸如 Cursor 或 Trae 支持的具体 MCP Schema 代码配置。 |