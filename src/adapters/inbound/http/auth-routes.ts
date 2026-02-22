import type { FastifyInstance } from 'fastify';
import { parseAuthHeader } from '@mereb/shared-packages';
import type { VerifyBearerTokenUseCase } from '../../../application/auth/use-cases.js';

export async function registerAuthRoutes(
  app: FastifyInstance,
  deps: {
    verifyBearerToken: VerifyBearerTokenUseCase;
  }
) {
  app.get('/healthz', async () => ({ status: 'ok' }));

  app.post('/verify', async (request, reply) => {
    try {
      const auth = parseAuthHeader(request.headers);
      if (!auth) {
        return reply.status(401).send({ error: 'Missing bearer token' });
      }

      return await deps.verifyBearerToken.execute({ token: auth });
    } catch (error) {
      request.log.warn({ err: error }, 'Token verification failed');
      return reply.status(401).send({ valid: false });
    }
  });
}
