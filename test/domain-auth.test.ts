import { test } from 'vitest';
import assert from 'node:assert/strict';
import { extractSubject } from '../src/domain/auth/verified-token.js';

test('extractSubject returns string sub when present', () => {
  assert.equal(extractSubject({ sub: 'user-1' }), 'user-1');
});

test('extractSubject returns undefined for non-string sub', () => {
  assert.equal(extractSubject({ sub: 123 }), undefined);
});
