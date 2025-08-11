import { inject, injectable } from 'inversify';
import { TYPES } from '../types/index.js';
import type { 
  EventDefinition, 
  EventEnvelope, 
  ActionCtx, 
  ActionOpts 
} from '@saga-soa/pubsub-core';
import type { Logger } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class EventService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger
  ) {}

  async validateEvent(
    name: string, 
    payload: any, 
    events: Record<string, EventDefinition>
  ): Promise<{ valid: boolean; eventDef?: EventDefinition; error?: string }> {
    const eventDef = events[name];
    if (!eventDef) {
      return { valid: false, error: `Unknown event: ${name}` };
    }

    // Validate payload schema if provided
    if (eventDef.payloadSchema) {
      try {
        eventDef.payloadSchema.parse(payload);
      } catch (error) {
        return { 
          valid: false, 
          error: `Payload validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
    }

    return { valid: true, eventDef };
  }

  async executeAction(
    eventDef: EventDefinition,
    payload: any,
    ctx: ActionCtx,
    opts: ActionOpts = {}
  ): Promise<{ result: any; emittedEvents: EventEnvelope[] }> {
    const emittedEvents: EventEnvelope[] = [];

    if (!eventDef.action) {
      return { result: undefined, emittedEvents: [] };
    }

    try {
      // Create enhanced context with emit function
      const enhancedCtx: ActionCtx = {
        ...ctx,
        emit: async (event: EventEnvelope) => {
          emittedEvents.push(event);
          this.logger.info('Action emitted event', { 
            eventName: event.name, 
            eventId: event.id 
          });
        }
      };

      // Execute the action
      const result = await eventDef.action(enhancedCtx, payload, opts);
      
      this.logger.info('Action executed successfully', { 
        eventName: eventDef.name, 
        result 
      });

      return { result, emittedEvents };
    } catch (error) {
      this.logger.error('Action execution failed', { 
        eventName: eventDef.name, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  createEventEnvelope(
    name: string,
    channel: string,
    payload: any,
    meta?: Record<string, any>
  ): EventEnvelope<any> {
    return {
      id: uuidv4(),
      name: name as any,
      channel,
      payload,
      timestamp: new Date().toISOString(),
      meta
    };
  }

  async checkAuthorization(
    eventDef: EventDefinition,
    user: any,
    ctx: ActionCtx
  ): Promise<{ authorized: boolean; error?: string }> {
    if (!eventDef.authScope) {
      return { authorized: true };
    }

    if (typeof eventDef.authScope === 'string') {
      // Simple string-based auth check
      if (!user || !user.roles.includes(eventDef.authScope)) {
        return { 
          authorized: false, 
          error: `User does not have required scope: ${eventDef.authScope}` 
        };
      }
    } else if (typeof eventDef.authScope === 'function') {
      // Function-based auth check
      try {
        const authorized = await eventDef.authScope(ctx);
        if (!authorized) {
          return { 
            authorized: false, 
            error: 'User not authorized for this event' 
          };
        }
      } catch (error) {
        return { 
          authorized: false, 
          error: `Authorization check failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        };
      }
    }

    return { authorized: true };
  }
} 