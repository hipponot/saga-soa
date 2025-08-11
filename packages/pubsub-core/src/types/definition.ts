import type { ZodSchema } from 'zod';
import type { EventEnvelope, EventOptions } from './event.js';

export interface EventDefinition<Payload = unknown, Result = unknown> {
  name: string;                       // canonical event name
  channel: string;                    // logical family
  payloadSchema?: ZodSchema<Payload>; // optional runtime schema for validation
  direction?: "SSE" | "CSE" | "BOTH";
  action?: (ctx: ActionCtx, payload: Payload, opts?: ActionOpts) => Promise<Result>;
  description?: string;
  version?: number;
  authScope?: string | ((ctx: ActionCtx) => boolean | Promise<boolean>);
  rateLimit?: {
    maxPerMinute?: number;
    maxPerHour?: number;
    maxPerDay?: number;
  };
}

export interface ActionCtx {
  user?: { id: string; roles: string[] };
  requestId?: string;
  services: {
    db: any; // DbClient - will be properly typed when integrated
    cache?: any; // CacheClient
    logger: any; // Logger
    idempotency?: any; // IdempotencyStore
    // ... other app services
  };
  emit: (event: EventEnvelope) => Promise<void>; // emit additional events
  meta: Record<string, any>; // additional context
}

export interface ActionOpts extends EventOptions {
  retryCount?: number;
  maxRetries?: number;
  timeout?: number;
}

export interface ChannelConfig {
  name: string;
  family?: string; // optional grouping of channels
  authScope?: string | ((ctx: ActionCtx) => boolean | Promise<boolean>);
  historyRetentionMs?: number; // history TTL for late subscribers
  ordered?: boolean; // whether ordering is guaranteed
  maxSubscribers?: number; // limit concurrent subscribers
  maxEventSize?: number; // max payload size in bytes
} 