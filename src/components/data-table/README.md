# src/components/data-table — 数据表格通用组件

> 父模块：[`src/components/README.md`](../README.md)
>
> 项目总览：参见 [README.md](../../README.md)
>
> 相关模块：[`src/views/README.md`](../../views/README.md)（业务视图的调用方）

## 简介

封装了基于 TanStack Table 的数据表格通用交互控件集合，供所有业务视图中的列表页复用。这些控件与具体的数据实体无关——它们只关注**如何渲染通用的表头、过滤器、分页、批量操作和列可见性**，而不关心是哪个业务域的数据。

## 目录结构

```
data-table/
├── index.ts             # 聚合导出，外部统一通过此入口引入
├── BulkActions.tsx      # 多选行后弹出的批量操作工具栏（如批量删除）
├── ColumnHeader.tsx     # 带排序箭头的可交互列标题组件
├── FacetedFilter.tsx    # 多值枚举过滤器（Faceted filter，下拉多选）
├── Pagination.tsx       # 分页控制器（上/下页、跳页、每页条数选择）
├── Toolbar.tsx          # 表格顶部工具栏（全局搜索框 + 过滤器入口）
└── ViewOptions.tsx      # 列可见性切换器（显示/隐藏指定列）
```

## 核心组件接口

| 组件 | 主要 Props | 说明 |
| --- | --- | --- |
| `DataTableColumnHeader` | `column`, `title` | 列头排序按钮，对接 TanStack Table 的 `column` API |
| `DataTableFacetedFilter` | `column`, `title`, `options` | 枚举值多选过滤，`options` 为 `{ label, value, icon? }[]` |
| `DataTablePagination` | `table` | 分页条，读取并控制 `table` 实例的页码/页大小状态 |
| `DataTableToolbar` | `table`, `filterColumns?` | 工具栏，内嵌搜索框及可选的 `FacetedFilter` 列表 |
| `DataTableBulkActions` | `table`, `actions` | 多行选中后出现的浮层工具条 |
| `DataTableViewOptions` | `table` | 列可见性下拉菜单 |

## 使用方式

```tsx
import {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '../../components/data-table'
import type { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<MyRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="名称" />
    ),
  },
]

export function MyTablePage() {
  // ...使用 useReactTable 创建 table 实例
  return (
    <div>
      <DataTableToolbar table={table} />
      {/* 表格主体 */}
      <DataTablePagination table={table} />
    </div>
  )
}
```

## 新增 / 重构 / 删除向导

### 新增通用控件

- 若新控件对多个业务列表均有复用价值，在此目录创建新 `.tsx` 文件并在 `index.ts` 中追加导出；
- 若控件仅适用于单一业务域（如仅用于 `models/providers`），应将其放置在对应视图的 `components/` 下，不要放在此处。

### 重构

- 修改通用组件的 Props 接口时须同步检查所有调用方，利用 `npm run type-check` 一次性发现类型断言错误。

### 删除

- 删除前确认所有业务列表页中均无对该控件的 `import`，然后同步从 `index.ts` 移除导出。
