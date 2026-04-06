import { describe, expect, it, vi } from 'vitest';
import { login } from '../auth';
import { request } from '../client';

vi.mock('../client');

describe('auth API', () => {
  it('should call request correctly on login()', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      ok: true,
      data: { access_token: '123', expires_in: 3600, token_type: 'Bearer' },
    });

    const result = await login('test@example.com', 'password123');

    expect(request).toHaveBeenCalledWith('POST', '/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual({
      ok: true,
      data: { access_token: '123', expires_in: 3600, token_type: 'Bearer' },
    });
  });
});
