import React, { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDialogState } from '@/composables/use-dialog-state'
import { listRequestLogs } from '@/api/request-logs'
import type { RequestLog } from '@/types'
import type { PaginationState, ColumnFiltersState } from '@tanstack/react-table'

export type LogsDialogType = 'delete' | 'batch-delete'

export type LogsFiltersType = {
  status?: string
  request_model?: string
  provider_kind?: string
  provider_id?: string
  api_key_prefix?: string
  user_format?: string
  is_stream?: string
}

type LogsContextType = {
  open: LogsDialogType | null
  setOpen: (str: LogsDialogType | null) => void
  currentRow: RequestLog | null
  setCurrentRow: React.Dispatch<React.SetStateAction<RequestLog | null>>
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  logs: RequestLog[]
  total: number
  loading: boolean
  error: string
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  filters: LogsFiltersType
  setFilters: React.Dispatch<React.SetStateAction<LogsFiltersType>>
  columnFilters: ColumnFiltersState
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
  globalFilter: string
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>
  loadLogs: () => Promise<void>
}

const LogsContext = React.createContext<LogsContextType | null>(null)

function buildFiltersFromTableState(globalValue: string, colValues: ColumnFiltersState): LogsFiltersType {
  const newFilters: LogsFiltersType = {}
  
  // search input maps to request_model
  if (globalValue !== '') {
    newFilters.request_model = globalValue
  }
  
  // facet filters
  for (const filter of colValues) {
    if (filter.id === 'api_key' && typeof filter.value === 'string' && filter.value !== '') {
      newFilters.api_key_prefix = filter.value
      continue
    }
    
    const value = filter.value as string[] | undefined | null
    const v0 = value?.[0]
    if (v0 == null || v0 === '') continue

    const mapping: Record<string, () => void> = {
      status: () => { newFilters.status = v0 },
      provider_kind: () => { newFilters.provider_kind = v0 },
      provider_id: () => { newFilters.provider_id = v0 },
      mode: () => { newFilters.is_stream = v0 === 'stream' ? 'true' : 'false' },
      source: () => { newFilters.user_format = v0 },
    }
    mapping[filter.id]?.()
  }
  
  return newFilters
}

export function LogsProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const { t } = useTranslation()
  const [open, setOpen] = useDialogState<LogsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RequestLog | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Table Server-side State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  
  // Table filters state mapped to API
  const [globalFilter, setGlobalFilter] = useState('') // mapped to request_model
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]) // mapped to status / provider_kind
  const [filters, setFilters] = useState<LogsFiltersType>({})

  // Update API filters when table state changes
  useEffect((): void => {
    setFilters(buildFiltersFromTableState(globalFilter, columnFilters))
    // When filters change, reset pagination to page 0
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, columnFilters])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        ...filters,
      }
      const res = await listRequestLogs(params)
      if (!res.ok) throw new Error(res.error.message)
      setLogs(res.data.data)
      setTotal(res.data.total)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : t('common.loadFailed', 'Failed to load logs'))
    } finally {
      setLoading(false)
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, t])

  // Reload when params change
  useEffect((): (() => void) => {
    const timeout = setTimeout((): void => {
      void load()
    }, 300) // debounce API calls
    return (): void => { clearTimeout(timeout); }
  }, [load])

  return (
    <LogsContext value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      selectedIds,
      setSelectedIds,
      logs,
      total,
      loading,
      error,
      pagination,
      setPagination,
      filters,
      setFilters,
      columnFilters,
      setColumnFilters,
      globalFilter,
      setGlobalFilter,
      loadLogs: load,
    }}>
      {children}
    </LogsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLogs(): LogsContextType {
  const ctx = React.useContext(LogsContext)
  if (ctx == null) {
    throw new Error('useLogs must be used within <LogsProvider>')
  }
  return ctx
}
