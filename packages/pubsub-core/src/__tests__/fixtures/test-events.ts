import { z } from 'zod';
import { vi } from 'vitest';
import type { EventDefinition, EventEnvelope, ActionCtx } from '../../types/index.js';

// Payload schemas for ping and pong events
export const pingPayloadSchema = z.object({
  message: z.string(),
  timestamp: z.string()
});

export const pongPayloadSchema = z.object({
  reply: z.string(),
  originalMessage: z.string(),
  timestamp: z.string()
});

// Type aliases for convenience
export type PingPayload = z.infer<typeof pingPayloadSchema>;
export type PongPayload = z.infer<typeof pongPayloadSchema>;

// Mock ActionCtx for testing
export const createMockActionCtx = (overrides?: Partial<ActionCtx>): ActionCtx => ({
  user: { id: 'test-user', roles: ['user'] },
  requestId: 'test-request-123',
  services: {
    db: {
      insert: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    cache: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn()
    },
    logger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    },
    idempotency: {
      check: vi.fn(),
      runIfNotProcessed: vi.fn()
    }
  },
  emit: vi.fn(),
  meta: {},
  ...overrides
});

// Test ping event definition (CSE - Client Sent Event)
export const testPingEvent: EventDefinition<PingPayload, { success: boolean }> = {
  name: 'ping',
  channel: 'pingpong',
  payloadSchema: pingPayloadSchema,
  direction: 'CSE',
  description: 'Test ping event that triggers a pong response',
  version: 1,
  action: async (ctx, payload) => {
    // Mock action that emits a pong response
    const pongPayload: PongPayload = {
      reply: `Pong! Received: ${payload.message}`,
      originalMessage: payload.message,
      timestamp: new Date().toISOString()
    };

    await ctx.emit({
      id: crypto.randomUUID(),
      name: 'pong',
      channel: 'pingpong',
      payload: pongPayload,
      timestamp: new Date().toISOString()
    });
    
    return { success: true };
  }
};

// Test pong event definition (SSE - Server Sent Event)
export const testPongEvent: EventDefinition<PongPayload> = {
  name: 'pong',
  channel: 'pingpong',
  payloadSchema: pongPayloadSchema,
  direction: 'SSE',
  description: 'Test pong event sent in response to ping',
  version: 1
  // No action needed for SSE events
};

// Helper functions to create test event envelopes
export const createTestPingEnvelope = (
  message: string,
  overrides?: Partial<EventEnvelope<'ping', PingPayload>>
): EventEnvelope<'ping', PingPayload> => ({
  id: crypto.randomUUID(),
  name: 'ping',
  channel: 'pingpong',
  payload: { 
    message, 
    timestamp: new Date().toISOString() 
  },
  timestamp: new Date().toISOString(),
  meta: {
    source: 'test',
    version: 1
  },
  ...overrides
});

export const createTestPongEnvelope = (
  reply: string,
  originalMessage: string,
  overrides?: Partial<EventEnvelope<'pong', PongPayload>>
): EventEnvelope<'pong', PongPayload> => ({
  id: crypto.randomUUID(),
  name: 'pong',
  channel: 'pingpong',
  payload: { 
    reply, 
    originalMessage, 
    timestamp: new Date().toISOString() 
  },
  timestamp: new Date().toISOString(),
  meta: {
    source: 'server',
    version: 1
  },
  ...overrides
});

// Collection of test events for easy import
export const testEvents = {
  ping: testPingEvent,
  pong: testPongEvent
} as const;

// Sample event envelopes for testing
export const samplePingEnvelope = createTestPingEnvelope('Hello from test!');
export const samplePongEnvelope = createTestPongEnvelope(
  'Pong! Received: Hello from test!', 
  'Hello from test!'
);

// Validation helpers
export const validatePingPayload = (payload: unknown): payload is PingPayload => {
  return pingPayloadSchema.safeParse(payload).success;
};

export const validatePongPayload = (payload: unknown): payload is PongPayload => {
  return pongPayloadSchema.safeParse(payload).success;
};

// Event envelope validation
export const isValidEventEnvelope = (event: unknown): event is EventEnvelope => {
  return (
    typeof event === 'object' &&
    event !== null &&
    'id' in event &&
    'name' in event &&
    'channel' in event &&
    'payload' in event &&
    'timestamp' in event
  );
};
