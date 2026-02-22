export interface VerifiedTokenPayload {
  sub?: unknown;
  [key: string]: unknown;
}

export interface TokenVerificationResult {
  valid: true;
  sub?: string;
  payload: VerifiedTokenPayload;
}

export function extractSubject(payload: VerifiedTokenPayload): string | undefined {
  return typeof payload.sub === 'string' ? payload.sub : undefined;
}
