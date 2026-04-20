# Markdown 渲染与交互组件 (Markdown Viewer)

[← 回到 components](../README.md)

## 简介
提供统一的高清代码语法高亮、交互式的剪贴板功能，以及特有的 XML/代码片段智能预先折叠与懒加载功能，专门针对 LLM 生成的长篇代码或思考链输出进行了调优。

## 目录结构
``text
markdown-viewer/
├── index.tsx             # 主入口组件 MarkdownViewer
├── parser.ts             # 专门编写的 XML 提取器与文本片段拆分逻辑
├── md-components.tsx     # 基于 react-markdown 深度定制的自定义渲染表
├── XmlCollapsible.tsx    # 遇到提取的块级 XML 自动注入的可折叠交互组件
└── CopyButton.tsx        # 集成拷贝与成功反馈动画的小型控件
``

## 核心组件与接口

| 组件名 / 函数 | 职责 |
|---|---|
| MarkdownViewer | 在外部页面中直接引用的容器组件。 |
| parseSegments | 位于 parser.ts 的词法提取器，负责在底层解析 emark 前先隔离特有标签。 |
| getMarkdownComponents | 包含处理 Markdown Table、代码片段染色、引用块定制等渲染规则。 |