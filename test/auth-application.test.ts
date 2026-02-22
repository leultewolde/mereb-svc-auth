import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthApplicationModule } from '../src/application/auth/use-cases.js';

test('VerifyBearerTokenUseCase delegates to verifier and returns expected shape', async () => {
  const calls: string[] = [];
  const published: Array<{ type: string; payload: unknown }> = [];
  const auth = createAuthApplicationModule({
    jwtVerifier: {
      async verify(token: string) {
        calls.push(token);
        return { sub: 'user-1', scope: 'read' };
      }
    },
    authAuditPublisher: {
      async publishTokenVerified(input) {
        published.push({ type: 'verified', payload: input });
      },
      async publishTokenVerificationFailed(input) {
        published.push({ type: 'failed', payload: input });
      }
    }
  });

  const result = await auth.useCases.verifyBearerToken.execute({ token: 'abc' });

  assert.deepEqual(calls, ['abc']);
  assert.deepEqual(published, [
    { type: 'verified', payload: { sub: 'user-1' } }
  ]);
  assert.deepEqual(result, {
    valid: true,
    sub: 'user-1',
    payload: { sub: 'user-1', scope: 'read' }
  });
});

test('VerifyBearerTokenUseCase publishes failure audit event and rethrows', async () => {
  const published: Array<{ type: string; payload: unknown }> = [];
  const auth = createAuthApplicationModule({
    jwtVerifier: {
      async verify() {
        throw new TypeError('bad token');
      }
    },
    authAuditPublisher: {
      async publishTokenVerified(input) {
        published.push({ type: 'verified', payload: input });
      },
      async publishTokenVerificationFailed(input) {
        published.push({ type: 'failed', payload: input });
      }
    }
  });

  await assert.rejects(
    () => auth.useCases.verifyBearerToken.execute({ token: 'bad' }),
    (error) => error instanceof TypeError
  );

  assert.deepEqual(published, [
    { type: 'failed', payload: { errorName: 'TypeError' } }
  ]);
});
