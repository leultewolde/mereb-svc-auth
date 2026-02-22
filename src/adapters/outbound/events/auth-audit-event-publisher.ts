import {
  buildKafkaConfigFromEnv,
  createIntegrationEventEnvelope,
  createLogger,
  getProducer
} from '@mereb/shared-packages';
import type { AuthAuditEventPublisherPort } from '../../../application/auth/ports.js';
import {
  AUTH_AUDIT_EVENT_TOPICS,
  type AuthTokenVerificationFailedAuditEventData,
  type AuthTokenVerifiedAuditEventData
} from '../../../contracts/auth-events.js';

type KafkaConfig = NonNullable<ReturnType<typeof buildKafkaConfigFromEnv>>;

const logger = createLogger('svc-auth-audit-events');

function isEnabled(): boolean {
  return (process.env.AUTH_AUDIT_EVENTS_ENABLED ?? 'false') === 'true';
}

class NoopAuthAuditEventPublisherAdapter implements AuthAuditEventPublisherPort {
  async publishTokenVerified(): Promise<void> {
    return;
  }

  async publishTokenVerificationFailed(): Promise<void> {
    return;
  }
}

class KafkaAuthAuditEventPublisherAdapter implements AuthAuditEventPublisherPort {
  constructor(private readonly config: KafkaConfig) {}

  async publishTokenVerified(input: { sub?: string }): Promise<void> {
    await this.publish<AuthTokenVerifiedAuditEventData>({
      topic: AUTH_AUDIT_EVENT_TOPICS.tokenVerified,
      eventType: AUTH_AUDIT_EVENT_TOPICS.tokenVerified,
      key: input.sub ?? 'unknown',
      data: {
        sub: input.sub,
        has_sub: Boolean(input.sub)
      }
    });
  }

  async publishTokenVerificationFailed(input: {
    errorName: string;
  }): Promise<void> {
    await this.publish<AuthTokenVerificationFailedAuditEventData>({
      topic: AUTH_AUDIT_EVENT_TOPICS.tokenVerificationFailed,
      eventType: AUTH_AUDIT_EVENT_TOPICS.tokenVerificationFailed,
      key: input.errorName,
      data: {
        error_name: input.errorName
      }
    });
  }

  private async publish<TData>(input: {
    topic: string;
    eventType: string;
    key: string;
    data: TData;
  }): Promise<void> {
    try {
      const producer = await getProducer(this.config);
      const envelope = createIntegrationEventEnvelope({
        eventType: input.eventType,
        producer: 'svc-auth',
        data: input.data
      });

      await producer.send({
        topic: input.topic,
        messages: [
          {
            key: input.key,
            value: JSON.stringify(envelope)
          }
        ]
      });
    } catch (error) {
      logger.warn(
        {
          err: error,
          topic: input.topic,
          eventType: input.eventType
        },
        'Failed to publish auth audit event'
      );
    }
  }
}

export function createAuthAuditEventPublisherAdapter(): AuthAuditEventPublisherPort {
  if (!isEnabled()) {
    return new NoopAuthAuditEventPublisherAdapter();
  }

  const config = buildKafkaConfigFromEnv({ clientId: 'svc-auth' });
  if (!config) {
    logger.warn(
      'AUTH_AUDIT_EVENTS_ENABLED=true but Kafka config missing; audit event publishing disabled'
    );
    return new NoopAuthAuditEventPublisherAdapter();
  }

  return new KafkaAuthAuditEventPublisherAdapter(config);
}
