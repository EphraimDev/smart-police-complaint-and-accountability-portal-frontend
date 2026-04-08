import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

describe('api token refresh', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_ENABLED', 'false');
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it('retries the original request after a successful refresh response with nested tokens', async () => {
    vi.resetModules();
    let meRequestCount = 0;
    const { fetchCurrentUser } = await import('@/services/api');

    server.use(
      http.get('http://localhost:3006/api/v1/users/me', ({ request }) => {
        meRequestCount += 1;
        const authHeader = request.headers.get('authorization');

        if (authHeader === 'Bearer refreshed-access-token') {
          return HttpResponse.json({
            id: 'usr-001',
            email: 'admin@npf.gov.ng',
            firstName: 'Superintendent',
            lastName: 'Abubakar',
            fullName: 'Superintendent Abubakar',
            role: 'admin',
          });
        }

        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
      http.post('http://localhost:3006/api/v1/auth/refresh', async ({ request }) => {
        const body = (await request.json()) as { refreshToken?: string };

        expect(body.refreshToken).toBe('initial-refresh-token');

        return HttpResponse.json({
          success: true,
          message: 'Token refreshed',
          correlationId: 'corr-123',
          data: {
            tokens: {
              accessToken: 'refreshed-access-token',
              refreshToken: 'refreshed-refresh-token',
              expiresIn: '15m',
              tokenType: 'Bearer',
            },
          },
        });
      }),
    );

    localStorage.setItem('spcap_token', 'expired-access-token');
    localStorage.setItem('spcap_refresh_token', 'initial-refresh-token');

    const user = await fetchCurrentUser();

    expect(user).toMatchObject({
      id: 'usr-001',
      email: 'admin@npf.gov.ng',
    });
    expect(meRequestCount).toBe(2);
    expect(localStorage.getItem('spcap_token')).toBe('refreshed-access-token');
    expect(localStorage.getItem('spcap_refresh_token')).toBe('refreshed-refresh-token');
  });
});
