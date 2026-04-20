import type { AuditUserChatRequest, AuditUserChatResponse } from '@/types';

export function extractToolName(
  isFunc: boolean,
  obj: Record<string, unknown>,
  funcObj: Record<string, unknown> | null,
): string {
  if (isFunc && funcObj != null && typeof funcObj.name === 'string') {
    return funcObj.name;
  }
  if (typeof obj.name === 'string' && obj.name !== '') {
    return obj.name;
  }
  if (typeof obj.type === 'string' && obj.type !== '') {
    return obj.type;
  }
  return 'Unknown Tool';
}

export function asUserChatReq(body: unknown): AuditUserChatRequest | undefined {
  if (typeof body === 'object' && body !== null) {
    return body as AuditUserChatRequest;
  }
  return undefined;
}

export function asUserChatResp(body: unknown): AuditUserChatResponse | undefined {
  if (typeof body === 'object' && body !== null && 'choices' in body) {
    return body as AuditUserChatResponse;
  }
  return undefined;
}

export function extractToolDesc(
  isFunc: boolean,
  obj: Record<string, unknown>,
  funcObj: Record<string, unknown> | null,
): string | undefined {
  if (isFunc && funcObj?.description != null && funcObj.description !== '') {
    return typeof funcObj.description === 'string' ? funcObj.description : '';
  }
  if (obj.description != null && obj.description !== '') {
    return typeof obj.description === 'string' ? obj.description : '';
  }
  if (obj.type != null && obj.type !== '') {
    return typeof obj.type === 'string' ? `Built-in Tool: ${obj.type}` : 'Built-in Tool';
  }
  return undefined;
}

export function getToolInfo(tool: unknown): { name: string; desc?: string | undefined; schema: unknown } {
  const obj = typeof tool === 'object' && tool !== null ? (tool as Record<string, unknown>) : {};
  const funcObj =
    typeof obj.function === 'object' && obj.function !== null ? (obj.function as Record<string, unknown>) : null;

  const isFunction = obj.type === 'function' && funcObj != null;
  const name = extractToolName(isFunction, obj, funcObj);
  const desc = extractToolDesc(isFunction, obj, funcObj);
  const schema = isFunction ? funcObj.parameters : (obj.input_schema ?? {});
  return { name, desc, schema };
}

export function parseToolProperties(schemaObj: unknown): {
  properties: Array<{ field: string; type: string; description: string; isRequired: boolean }>;
  required: string[];
} {
  if (typeof schemaObj !== 'object' || schemaObj === null) {
    return { properties: [], required: [] };
  }
  const s = schemaObj as Record<string, unknown>;
  const properties =
    s.properties != null && typeof s.properties === 'object' ? (s.properties as Record<string, unknown>) : {};
  const required = (Array.isArray(s.required) ? s.required : []) as string[];

  const resultList = Object.keys(properties).map((key) => {
    const propVal = properties[key];
    const prop = propVal != null && typeof propVal === 'object' ? (propVal as Record<string, unknown>) : {};
    const typeStr = typeof prop.type === 'string' ? prop.type : 'any';
    const descStr = typeof prop.description === 'string' ? prop.description : '';
    const enumVal = prop.enum;
    const enumList = (Array.isArray(enumVal) ? enumVal : []) as unknown[];

    let finalType = typeStr;
    if (enumList.length > 0) {
      finalType = `${typeStr} (enum: ${enumList.map(String).join(' | ')})`;
    }

    if (prop.properties != null && typeof prop.properties === 'object') {
      finalType += ' (object)';
    }
    if (prop.items != null && typeof prop.items === 'object') {
      finalType += ' (array)';
    }

    return {
      field: key,
      type: finalType,
      description: descStr,
      isRequired: required.includes(key),
    };
  });
  return { properties: resultList, required };
}
