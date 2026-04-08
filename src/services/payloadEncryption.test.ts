import { afterEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

describe('payload encryption', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    localStorage.clear();
  });

  it('round-trips frontend payloads with backend-compatible metadata', async () => {
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_ENABLED', 'true');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_KEY', 'frontend-shared-secret');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_ALGORITHM', 'aes-256-gcm');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_IV_LENGTH', '12');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_TAG_LENGTH', '16');
    vi.stubEnv('VITE_ENCRYPTED_PAYLOAD_SEPARATOR', '.');

    const {
      buildPayloadContext,
      decryptRequestPayload,
      encryptPayload,
    } = await import('@/services/payloadEncryption');

    const context = buildPayloadContext('POST', 'http://localhost:3006/api/v1/auth/login');
    const encrypted = await encryptPayload(
      { email: 'citizen@example.com', password: 'secret' },
      context,
    );
    const decrypted = await decryptRequestPayload<{
      email: string;
      password: string;
    }>(encrypted, context);

    expect(encrypted.encrypted).toBe(true);
    expect(encrypted.algorithm).toBe('aes-256-gcm');
    expect(encrypted.payload.split('.')).toHaveLength(3);
    expect(decrypted).toEqual({
      email: 'citizen@example.com',
      password: 'secret',
    });
  });

  it('encrypts JSON requests and decrypts encrypted JSON responses in the api client', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3006');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_ENABLED', 'true');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_KEY', 'frontend-shared-secret');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_ALGORITHM', 'aes-256-gcm');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_IV_LENGTH', '12');
    vi.stubEnv('VITE_PAYLOAD_ENCRYPTION_TAG_LENGTH', '16');
    vi.stubEnv('VITE_ENCRYPTED_PAYLOAD_SEPARATOR', '.');

    const payloadEncryption = await import('@/services/payloadEncryption');
    const { login } = await import('@/services/api');

    server.use(
      http.post('http://localhost:3006/api/v1/auth/login', async ({ request }) => {
        expect(request.headers.get('x-payload-encrypted')).toBe('true');

        const body = (await request.json()) as { payload?: string };
        expect(typeof body.payload).toBe('string');

        const requestContext = payloadEncryption.buildPayloadContext(
          request.method,
          request.url,
        );
        const requestPayload =
          await payloadEncryption.decryptRequestPayload<{
            email: string;
            password: string;
            deviceInfo: string;
          }>(
            {
              encrypted: true,
              algorithm: 'aes-256-gcm',
              payload: body.payload ?? '',
            },
            requestContext,
          );

        expect(requestPayload.email).toBe('admin@npf.gov.ng');
        expect(requestPayload.password).toBe('Password123!');
        expect(requestPayload.deviceInfo).toContain('Mozilla');

        const responsePayload = await payloadEncryption.encryptResponsePayload(
          {
            success: true,
            data: {
              tokens: {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
              },
            },
          },
          requestContext,
        );

        return HttpResponse.json(responsePayload, {
          headers: {
            'x-payload-encrypted': 'true',
            'x-encryption-algorithm': 'aes-256-gcm',
          },
        });
      }),
    );

    const response = await login({
      email: 'admin@npf.gov.ng',
      password: 'Password123!',
    });

    expect(response.data.tokens.accessToken).toBe('access-token');
    expect(localStorage.getItem('spcap_token')).toBe('access-token');
    expect(localStorage.getItem('spcap_refresh_token')).toBe('refresh-token');
  });
});
