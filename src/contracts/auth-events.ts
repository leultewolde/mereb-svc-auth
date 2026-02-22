export const AUTH_AUDIT_EVENT_TOPICS = {
  tokenVerified: 'auth.token.verified.v1',
  tokenVerificationFailed: 'auth.token.verification_failed.v1'
} as const;

export interface AuthTokenVerifiedAuditEventData {
  sub?: string;
  has_sub: boolean;
}

export interface AuthTokenVerificationFailedAuditEventData {
  error_name: string;
}
