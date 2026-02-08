import Fastify, { type FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import { createFastifyLoggerOptions, getEnv, loadEnv, parseAuthHeader, verifyJwt } from '@mereb/shared-packages';

loadEnv();

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({logger: createFastifyLoggerOptions('svc-auth')});

  await app.register(helmet);
  await app.register(cors, { origin: true, credentials: true });
  await app.register(sensible);

  const issuer = getEnv('OIDC_ISSUER');
  const audience = process.env.OIDC_AUDIENCE;

  app.get('/healthz', async () => ({ status: 'ok' }));

  app.post('/verify', async (request, reply) => {
    try {
      const auth = parseAuthHeader(request.headers);
      if (!auth) {
        return reply.status(401).send({ error: 'Missing bearer token' });
      }
      const payload = await verifyJwt(auth, { issuer, audience });
      return { valid: true, sub: payload.sub, payload };
    } catch (error) {
      request.log.warn({ err: error }, 'Token verification failed');
      return reply.status(401).send({ valid: false });
    }
  });

  return app;
}
