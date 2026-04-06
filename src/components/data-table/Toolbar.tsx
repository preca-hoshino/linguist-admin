import { Cross2Icon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTableFacetedFilter } from './FacetedFilter';
import { DataTableViewOptions } from './ViewOptions';

interface DataTableToolbarProps<TData> {
  readonly table: Table<TData>;
  readonly searchPlaceholder?: string;
  readonly searchKey?: string;
  readonly filters?: {
    readonly columnId: string;
    readonly title: string;
    readonly options: {
      readonly label: string;
      readonly value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>(readonlyProps: Readonly<DataTableToolbarProps<TData>>): React.JSX.Element {
  const { table, searchPlaceholder = 'Filter...', searchKey, filters = [], children } = readonlyProps;
  const isFiltered = table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {searchKey === undefined ? (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getState().globalFilter as string | undefined) ?? ''}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string | undefined) ?? ''}
            onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {children}
        <div className="flex gap-x-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) {
              return null;
            }
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            );
          })}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
