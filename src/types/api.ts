// src/types/api.ts — 前端 API 调用通用类型（对应后端协议）
import type { ResourceObjectType } from './resource-types';

/** 列表响应结构 */
export interface ListResponse<T> {
  readonly object: 'list';
  readonly data: T[];
  readonly has_more: boolean;
  readonly total: number;
}

/** 删除确认响应结构 */
export interface DeletedResponse {
  readonly id: string;
  readonly object: ResourceObjectType;
  readonly deleted: true;
}

/** 后端统一错误体结构 */
export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly type:
    | 'invalid_request_error'
    | 'authentication_error'
    | 'not_found_error'
    | 'conflict_error'
    | 'server_error';
  readonly param: string | null;
}

/**
 * 核心：Discriminated Union 作为前端 API 层的统一返回结构
 * 组件层无需 try/catch，直接判断 result.ok
 */
export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiErrorBody };
