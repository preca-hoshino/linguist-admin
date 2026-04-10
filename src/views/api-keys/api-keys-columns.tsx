/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from '@tanstack/react-table';
import { Copy, Eye, EyeOff, Key } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableColumnHeader } from '@/components/data-table';
import { Badge } from '@/components/ui/Badge';
import type { ApiKey } from '@/types';
import { cn } from '@/utils/utils';
import { ApiKeysRowActions } from './api-keys-row-actions';

function formatDate(dateStr: string | null): string {
  if (dateStr === null || dateStr === '') {
    return '-';
  }
  return new Date(dateStr).toLocaleString();
}

function KeyValueCell({ row }: { readonly row: import('@tanstack/react-table').Row<ApiKey> }): React.JSX.Element {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const keyValue = row.getValue<string>('key_value') || row.original.key_prefix; // fallback

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(keyValue);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <Key className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="font-mono text-sm tracking-tight w-[300px] truncate">{show ? keyValue : '•'.repeat(24)}</span>
      <button
        type="button"
        title="Toggle visibility"
        className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer"
        onClick={() => {
          setShow(!show);
        }}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        title="Copy"
        className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer"
        onClick={handleCopy}
      >
        {copied ? <span className="text-xs text-green-600">Copied</span> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

export function useApiKeysColumns(): ColumnDef<ApiKey>[] {
  const { t } = useTranslation();

  return [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue<string>('id')}</span>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apiKeys.name', 'Name')} />,
      cell: ({ row }) => <span className="font-medium">{row.getValue<string>('name')}</span>,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'key_value',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apiKeys.keyValue', 'API Key')} />,
      cell: KeyValueCell,
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apiKeys.status', 'Status')} />,
      cell: ({ row }): React.JSX.Element => {
        const isActive = row.getValue<boolean>('is_active');
        const expiresAt = row.original.expires_at;

        const isExpired = expiresAt !== null && expiresAt !== '' ? new Date(expiresAt).getTime() < Date.now() : false;

        if (isExpired) {
          return (
            <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-600">
              {t('apiKeys.expired', 'Expired')}
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className={cn(isActive ? 'border-green-300 text-green-600' : 'border-muted text-muted-foreground')}
          >
            {isActive ? t('apiKeys.active', 'Active') : t('apiKeys.inactive', 'Inactive')}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apiKeys.createdAt', 'Created At')} />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.getValue<string | null>('created_at'))}</span>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'expires_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('apiKeys.expiresAt', 'Expires At')} />,
      cell: ({ row }): React.JSX.Element => {
        const expiresAt = row.getValue<string | null>('expires_at');
        return (
          <span className="text-sm text-muted-foreground">
            {expiresAt !== null && expiresAt !== ''
              ? formatDate(expiresAt)
              : t('apiKeys.neverExpires', 'Never Expires')}
          </span>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ApiKeysRowActions row={row} />,
    },
  ];
}
