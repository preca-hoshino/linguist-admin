import { createFileRoute } from '@tanstack/react-router'
import { getRequestLog } from '@/api/request-logs'
import { ModelLogDetailPage } from '@/views/models/logs/logs-detail-page'

export const Route = createFileRoute('/_authenticated/models/logs/$id')({
  loader: async ({ params }) => {
    const result = await getRequestLog(params.id)
    if (!result.ok) throw new Error(result.error.message)
    return { log: result.data }
  },
  component: ModelLogDetailPage,
})
