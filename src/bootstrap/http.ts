import Fastify, { type FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import {
  createFastifyLoggerOptions,
  getEnv,
  loadEnv
} from '@mereb/shared-packages';
import { registerAuthRoutes } from '../adapters/inbound/http/auth-routes.js';
import { createContainer } from './container.js';

loadEnv();

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: createFastifyLoggerOptions('svc-auth') });

  await app.register(helmet);
  await app.register(cors, { origin: true, credentials: true });
  await app.register(sensible);

  const issuer = getEnv('OIDC_ISSUER');
  const audience = process.env.OIDC_AUDIENCE;
  const container = createContainer({ issuer, audience });

  await registerAuthRoutes(app, {
    verifyBearerToken: container.auth.useCases.verifyBearerToken
  });

  return app;
}
