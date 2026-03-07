# svc-auth

`svc-auth` is the platform token verification service. It validates bearer tokens against the configured OIDC issuer and exposes a small REST API used by gateway/platform workflows.

## API surface

- `GET /healthz` -> `{ "status": "ok" }`
- `POST /verify` -> verifies bearer token from `Authorization: Bearer <token>`

Successful verify response:

```json
{
  "valid": true,
  "sub": "user-1",
  "payload": {
    "sub": "user-1"
  }
}
```

Failure responses:

- missing token: `401 { "error": "Missing bearer token" }`
- invalid token: `401 { "valid": false }`

## Environment

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `OIDC_ISSUER` | yes | - | Issuer URL used for JWT verification. |
| `OIDC_AUDIENCE` | no | - | Expected audience/client ID. |
| `PORT` | no | `4010` | HTTP listen port. |
| `HOST` | no | `0.0.0.0` | HTTP listen host. |
| `AUTH_AUDIT_EVENTS_ENABLED` | no | `false` | Set `true` to publish auth audit events to Kafka. |
| `KAFKA_BROKERS` | conditional | - | Required when audit events are enabled. |

## Local development

```bash
pnpm --filter @services/svc-auth dev
pnpm --filter @services/svc-auth build
pnpm --filter @services/svc-auth start
```

## Tests

```bash
pnpm --filter @services/svc-auth test
pnpm --filter @services/svc-auth test:integration
pnpm --filter @services/svc-auth test:ci
```
