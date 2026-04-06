export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

/**
 * 验证 JWT Token 是否为空或过期
 * 注意：由于安全性改版，用户信息不再从 JWT 中提取，而是通过 GET /api/me 实时获取
 *
 * @param token JWT 原始字符串
 * @returns 构造安全后的基础 Payload，如果 Token 非法或已过期返回 `null`
 */
export function validateAuthToken(token: string): JwtPayload | null {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];
    if (base64Url === undefined || base64Url === '') {
      return null;
    }

    // 基础的 Base64 规范替换
    let base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');

    // 补齐 '=' 防止 window.atob 抛出 DOMException
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = globalThis.atob(base64);
    let encodedPayload = '';
    for (let i = 0; i < binary.length; i++) {
      const hex = (binary.codePointAt(i) ?? 0).toString(16).padStart(2, '0');
      encodedPayload += `%${hex}`;
    }

    const jsonPayload = decodeURIComponent(encodedPayload);

    const payload = JSON.parse(jsonPayload) as JwtPayload;

    // 如果 JWT 中存在过期时间，在前端直接筛除超期数据
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return null;
    }

    return payload;
  } catch {
    // 静默降级，不抛出异常以免阻塞主线程 UI
    return null;
  }
}
