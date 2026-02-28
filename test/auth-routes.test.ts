import { test } from 'vitest';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { registerAuthRoutes } from '../src/adapters/inbound/http/auth-routes.js';

test('GET /healthz returns ok', async () => {
  const app = Fastify();
  await registerAuthRoutes(app, {
    verifyBearerToken: {
      async execute() {
        throw new Error('should not be called');
      }
    }
  });

  const response = await app.inject({
    method: 'GET',
    url: '/healthz'
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ok' });
  await app.close();
});

test('POST /verify returns 401 when bearer token missing', async () => {
  const app = Fastify();
  await registerAuthRoutes(app, {
    verifyBearerToken: {
      async execute() {
        throw new Error('should not be called');
      }
    }
  });

  const response = await app.inject({
    method: 'POST',
    url: '/verify'
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json(), { error: 'Missing bearer token' });
  await app.close();
});

test('POST /verify returns verification result on success', async () => {
  const app = Fastify();
  await registerAuthRoutes(app, {
    verifyBearerToken: {
      async execute() {
        return {
          valid: true as const,
          sub: 'user-1',
          payload: { sub: 'user-1' }
        };
      }
    }
  });

  const response = await app.inject({
    method: 'POST',
    url: '/verify',
    headers: {
      authorization: 'Bearer token'
    }
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), {
    valid: true,
    sub: 'user-1',
    payload: { sub: 'user-1' }
  });
  await app.close();
});

test('POST /verify returns 401 when verifier throws', async () => {
  const app = Fastify();
  await registerAuthRoutes(app, {
    verifyBearerToken: {
      async execute() {
        throw new Error('invalid token');
      }
    }
  });

  const response = await app.inject({
    method: 'POST',
    url: '/verify',
    headers: {
      authorization: 'Bearer bad-token'
    }
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json(), { valid: false });
  await app.close();
});
