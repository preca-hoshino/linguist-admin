// src/api/mcp-stats.ts — MCP 统计 API 客户端

import type { ApiResult } from '../../types';
import { request } from '../client';

// ── 类型定义  ──────────────────────────────────────────────────────────────

export type McpStatsRange = '15m' | '1h' | '6h' | '24h' | '7d' | '14d' | '30d';
export type McpStatsDimension = 'global' | 'mcp_provider' | 'virtual_mcp';

export interface McpStatsParams {
  range?: McpStatsRange;
  dimension?: McpStatsDimension;
  id?: string;
  interval?: string;
  from?: string;
  to?: string;
}

export interface McpStatsOverview {
  total_requests: number;
  rpm: number;
  error_count: number;
  error_rate: number;
  avg_duration_ms: number | null;
  p95_duration_ms: number | null;
}

export interface McpStatsTimeSeriesPoint {
  ts: string;
  requests: number;
  errors: number;
  avg_duration_ms: number | null;
  p95_duration_ms: number | null;
  p99_duration_ms: number | null;
}

export interface McpTimeSeriesResult {
  object: 'list';
  data: McpStatsTimeSeriesPoint[];
}

export interface McpMethodBreakdownItem {
  method: string;
  count: number;
  error_count: number;
  avg_duration_ms: number | null;
}

export interface McpMethodBreakdownResult {
  object: 'list';
  data: McpMethodBreakdownItem[];
}

// ── 工具函数  ──────────────────────────────────────────────────────────────

function buildMcpStatsQuery(params?: McpStatsParams): string {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') {
        qs.set(k, String(v));
      }
    }
  }
  const query = qs.toString();
  return query ? `?${query}` : '';
}

// ── API 调用  ──────────────────────────────────────────────────────────────

export const getMcpStatsOverview = async (params?: McpStatsParams): Promise<ApiResult<McpStatsOverview>> =>
  await request<McpStatsOverview>('GET', `/mcp-stats/overview${buildMcpStatsQuery(params)}`);

export const getMcpStatsTimeSeries = async (params?: McpStatsParams): Promise<ApiResult<McpTimeSeriesResult>> =>
  await request<McpTimeSeriesResult>('GET', `/mcp-stats/time-series${buildMcpStatsQuery(params)}`);

export const getMcpMethodBreakdown = async (params?: McpStatsParams): Promise<ApiResult<McpMethodBreakdownResult>> =>
  await request<McpMethodBreakdownResult>('GET', `/mcp-stats/methods${buildMcpStatsQuery(params)}`);
