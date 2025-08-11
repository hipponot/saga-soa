import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'inversify';
import { EventService } from '../../../services/event.service.js';
import { MockLogger } from '../../../__tests__/mocks/mock-logger.js';
import { TYPES } from '../../../types/index.js';
import { z } from 'zod';
import type { EventDefinition } from '@saga-soa/pubsub-core';

describe('EventService', () => {
  let container: Container;
  let eventService: EventService;
  let mockLogger: MockLogger;

  beforeEach(() => {
    container = new Container();
    mockLogger = new MockLogger();
    
    container.bind(TYPES.Logger).toConstantValue(mockLogger);
    container.bind(EventService).toSelf();
    
    eventService = container.get(EventService);
  });

  describe('validateEvent', () => {
    it('should validate known events', async () => {
      const events = {
        'orders:created': {
          name: 'orders:created',
          channel: 'orders',
          payloadSchema: z.object({ orderId: z.string() })
        } as EventDefinition
      };

      const result = await eventService.validateEvent(
        'orders:created',
        { orderId: '123' },
        events
      );

      expect(result.valid).toBe(true);
      expect(result.eventDef).toBeDefined();
    });

    it('should reject unknown events', async () => {
      const events = {};

      const result = await eventService.validateEvent(
        'unknown:event',
        { data: 'test' },
        events
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unknown event: unknown:event');
    });

    it('should validate payload against schema', async () => {
      const events = {
        'orders:created': {
          name: 'orders:created',
          channel: 'orders',
          payloadSchema: z.object({ orderId: z.string() })
        } as EventDefinition
      };

      const result = await eventService.validateEvent(
        'orders:created',
        { orderId: 123 }, // Wrong type
        events
      );

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Payload validation failed');
    });
  });

  describe('executeAction', () => {
    it('should execute action and return result', async () => {
      const eventDef: EventDefinition = {
        name: 'orders:created',
        channel: 'orders',
        action: async (ctx, payload) => {
          return { success: true, orderId: payload.orderId };
        }
      };

      const ctx = {
        user: { id: 'user1', roles: ['user'] },
        services: {},
        meta: {}
      };

      const result = await eventService.executeAction(
        eventDef,
        { orderId: '123' },
        ctx
      );

      expect(result.result).toEqual({ success: true, orderId: '123' });
      expect(result.emittedEvents).toEqual([]);
    });

    it('should handle actions that emit events', async () => {
      const eventDef: EventDefinition = {
        name: 'orders:created',
        channel: 'orders',
        action: async (ctx, payload) => {
          await ctx.emit({
            id: 'event1',
            name: 'orders:processed',
            channel: 'orders',
            payload: { orderId: payload.orderId },
            timestamp: new Date().toISOString()
          });
          return { success: true };
        }
      };

      const ctx = {
        user: { id: 'user1', roles: ['user'] },
        services: {},
        meta: {}
      };

      const result = await eventService.executeAction(
        eventDef,
        { orderId: '123' },
        ctx
      );

      expect(result.result).toEqual({ success: true });
      expect(result.emittedEvents).toHaveLength(1);
      expect(result.emittedEvents[0].name).toBe('orders:processed');
    });

    it('should handle events without actions', async () => {
      const eventDef: EventDefinition = {
        name: 'orders:created',
        channel: 'orders'
      };

      const ctx = {
        user: { id: 'user1', roles: ['user'] },
        services: {},
        meta: {}
      };

      const result = await eventService.executeAction(
        eventDef,
        { orderId: '123' },
        ctx
      );

      expect(result.result).toBeUndefined();
      expect(result.emittedEvents).toEqual([]);
    });
  });

  describe('createEventEnvelope', () => {
    it('should create valid event envelope', () => {
      const event = eventService.createEventEnvelope(
        'orders:created',
        'orders',
        { orderId: '123' },
        { source: 'test' }
      );

      expect(event.name).toBe('orders:created');
      expect(event.channel).toBe('orders');
      expect(event.payload).toEqual({ orderId: '123' });
      expect(event.meta?.source).toBe('test');
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeDefined();
    });
  });

  describe('checkAuthorization', () => {
    it('should allow events without auth scope', async () => {
      const eventDef: EventDefinition = {
        name: 'orders:created',
        channel: 'orders'
      };

      const ctx = {
        user: { id: 'user1', roles: ['user'] },
        services: {},
        meta: {}
      };

      const result = await eventService.checkAuthorization(
        eventDef,
        { id: 'user1', roles: ['user'] },
        ctx
      );

      expect(result.authorized).toBe(true);
    });

    it('should check string-based auth scope', async () => {
      const eventDef: EventDefinition = {
        name: 'orders:created',
        channel: 'orders',
        authScope: 'admin'
      };

      const ctx = {
        user: { id: 'user1', roles: ['user'] },
        services: {},
        meta: {}
      };

      const result = await eventService.checkAuthorization(
        eventDef,
        { id: 'user1', roles: ['user'] },
        ctx
      );

      expect(result.authorized).toBe(false);
      expect(result.error).toContain('admin');
    });

    it('should allow users with required scope', async () => {
      const eventDef: EventDefinition = {
        name: 'orders:created',
        channel: 'orders',
        authScope: 'admin'
      };

      const ctx = {
        user: { id: 'user1', roles: ['user'] },
        services: {},
        meta: {}
      };

      const result = await eventService.checkAuthorization(
        eventDef,
        { id: 'user1', roles: ['admin'] },
        ctx
      );

      expect(result.authorized).toBe(true);
    });
  });
}); 