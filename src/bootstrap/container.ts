import { createAuthApplicationModule, type AuthApplicationModule } from '../application/auth/use-cases.js';
import { SharedJwtVerifierAdapter } from '../adapters/outbound/security/shared-jwt-verifier.js';
import { createAuthAuditEventPublisherAdapter } from '../adapters/outbound/events/auth-audit-event-publisher.js';

export interface AuthContainer {
  auth: AuthApplicationModule;
}

export function createContainer(input: {
  issuer: string;
  audience?: string;
}): AuthContainer {
  const jwtVerifier = new SharedJwtVerifierAdapter({
    issuer: input.issuer,
    audience: input.audience
  });
  const authAuditPublisher = createAuthAuditEventPublisherAdapter();

  return {
    auth: createAuthApplicationModule({ jwtVerifier, authAuditPublisher })
  };
}
