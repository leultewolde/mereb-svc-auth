import { extractSubject, type TokenVerificationResult } from '../../domain/auth/verified-token.js';
import type { AuthAuditEventPublisherPort, JwtVerifierPort } from './ports.js';

export class VerifyBearerTokenUseCase {
  constructor(
    private readonly verifier: JwtVerifierPort,
    private readonly auditPublisher: AuthAuditEventPublisherPort
  ) {}

  async execute(input: { token: string }): Promise<TokenVerificationResult> {
    try {
      const payload = await this.verifier.verify(input.token);
      const sub = extractSubject(payload);
      await this.auditPublisher.publishTokenVerified({ sub });

      return {
        valid: true,
        sub,
        payload
      };
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      await this.auditPublisher.publishTokenVerificationFailed({ errorName });
      throw error;
    }
  }
}

export interface AuthApplicationModule {
  useCases: {
    verifyBearerToken: VerifyBearerTokenUseCase;
  };
}

export function createAuthApplicationModule(deps: {
  jwtVerifier: JwtVerifierPort;
  authAuditPublisher: AuthAuditEventPublisherPort;
}): AuthApplicationModule {
  return {
    useCases: {
      verifyBearerToken: new VerifyBearerTokenUseCase(
        deps.jwtVerifier,
        deps.authAuditPublisher
      )
    }
  };
}
