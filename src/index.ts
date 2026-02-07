import { buildServer } from './server.js';
import { getNumberEnv, initDefaultTelemetry, loadEnv } from '@mereb/shared-packages';

loadEnv();
initDefaultTelemetry('svc-auth');

const PORT = getNumberEnv('PORT', 4010);
const HOST = process.env.HOST ?? '0.0.0.0';

void (async () => {
  const app = await buildServer();
  await app.listen({ port: PORT, host: HOST });
})();
