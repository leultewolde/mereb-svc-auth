import { afterAll, beforeAll, test, expect } from 'vitest';
import { startOidcTestIssuer, type OidcTestIssuer } from '@mereb/shared-packages/testing/oidc';

let issuer: OidcTestIssuer;
let previousIssuer: string | undefined;
let previousAudience: string | undefined;

beforeAll(async () => {
  issuer = await startOidcTestIssuer({ audience: 'svc-auth' });
  previousIssuer = process.env.OIDC_ISSUER;
  previousAudience = process.env.OIDC_AUDIENCE;
  process.env.OIDC_ISSUER = issuer.issuer;
  process.env.OIDC_AUDIENCE = 'svc-auth';
});

afterAll(async () => {
  if (previousIssuer === undefined) {
    delete process.env.OIDC_ISSUER;
  } else {
    process.env.OIDC_ISSUER = previousIssuer;
  }

  if (previousAudience === undefined) {
    delete process.env.OIDC_AUDIENCE;
  } else {
    process.env.OIDC_AUDIENCE = previousAudience;
  }

  await issuer.close();
});

test('buildServer serves healthz and verifies JWTs against a live JWKS endpoint', async () => {
  const { buildServer } = await import('../src/server.js');
  const app = await buildServer();

  try {
    const token = await issuer.issueToken({ subject: 'user-1' });

    const healthz = await app.inject({
      method: 'GET',
      url: '/healthz'
    });
    expect(healthz.statusCode).toBe(200);
    expect(healthz.json()).toEqual({ status: 'ok' });

    const valid = await app.inject({
      method: 'POST',
      url: '/verify',
      headers: {
        authorization: `Bearer ${token}`
      }
    });
    expect(valid.statusCode).toBe(200);
    expect(valid.json()).toMatchObject({
      valid: true,
      sub: 'user-1'
    });

    const invalid = await app.inject({
      method: 'POST',
      url: '/verify',
      headers: {
        authorization: 'Bearer not-a-valid-jwt'
      }
    });
    expect(invalid.statusCode).toBe(401);
    expect(invalid.json()).toEqual({ valid: false });
  } finally {
    await app.close();
  }
});
