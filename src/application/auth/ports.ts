import type { VerifiedTokenPayload } from '../../domain/auth/verified-token.js';

export interface JwtVerifierPort {
  verify(token: string): Promise<VerifiedTokenPayload>;
}

export interface AuthAuditEventPublisherPort {
  publishTokenVerified(input: {
    sub?: string;
  }): Promise<void>;
  publishTokenVerificationFailed(input: {
    errorName: string;
  }): Promise<void>;
}
