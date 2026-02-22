import { verifyJwt } from '@mereb/shared-packages';
import type { JwtVerifierPort } from '../../../application/auth/ports.js';
import type { VerifiedTokenPayload } from '../../../domain/auth/verified-token.js';

export class SharedJwtVerifierAdapter implements JwtVerifierPort {
  constructor(
    private readonly options: {
      issuer: string;
      audience?: string;
    }
  ) {}

  async verify(token: string): Promise<VerifiedTokenPayload> {
    return (await verifyJwt(token, {
      issuer: this.options.issuer,
      audience: this.options.audience
    })) as VerifiedTokenPayload;
  }
}
