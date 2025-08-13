# PubSub Next Steps - Focused Development Plan

## Overview
This document outlines a focused development plan to implement core pubsub functionality with a working ping-pong example that demonstrates Client-Sent Events (CSE) and Server-Sent Events (SSE) in the saga-soa ecosystem.

## Focus Areas
1. **In-Memory Adapter**: Implement a working in-memory adapter for development and testing
2. **Ping-Pong CSE**: Create a simple ping-pong message system to demonstrate CSE functionality
3. **Web Client Integration**: Integrate the ping-pong functionality into the web-client trpc page

## Phase 1: Restructure Adapter Architecture and Implement In-Memory Adapter

### 1.1 Move Adapter Interfaces to Server Package (`packages/pubsub-server`)
- [x] Move `PubSubAdapter` interface from `packages/pubsub-core/src/adapters/base-adapter.ts` to `packages/pubsub-server/src/adapters/base-adapter.ts`
- [x] Move `AdapterConfig` and `AdapterMetrics` interfaces to server package
- [x] Update `packages/pubsub-core/src/adapters/index.ts` to remove adapter exports
- [x] Update `packages/pubsub-core/src/index.ts` to remove adapter exports
- [x] Update all imports in `pubsub-server` to use local adapter interfaces instead of importing from core

### 1.2 Implement In-Memory Adapter (`packages/pubsub-server`)
- [x] Create `packages/pubsub-server/src/adapters/in-memory-adapter.ts`
- [x] Implement `InMemoryAdapter` class extending `PubSubAdapter` interface
- [x] Add in-memory event storage with channel-based organization
- [x] Implement subscriber management with proper cleanup
- [x] Add basic event history with configurable retention
- [x] Export from `packages/pubsub-server/src/adapters/index.ts`

### 1.3 Add In-Memory Adapter Tests
- [x] Create `packages/pubsub-server/src/__tests__/unit/adapters/in-memory-adapter.test.ts`
- [x] Test publish/subscribe functionality
- [x] Test multiple subscribers per channel
- [x] Test event history and persistence
- [x] Test subscriber cleanup and memory management

### 1.4 Update Package Exports
- [x] Add in-memory adapter to `packages/pubsub-server/src/adapters/index.ts`
- [x] Ensure proper TypeScript exports
- [x] Update package.json if needed

### 1.5 Create Test Event Fixtures (`packages/pubsub-core`)
- [x] Create `packages/pubsub-core/src/__tests__/fixtures/test-events.ts`
- [x] Define test `ping` CSE event fixture with proper payload schema
- [x] Define test `pong` SSE event fixture with proper payload schema
- [x] Use core types (`EventEnvelope`, `EventDefinition`) for type safety
- [x] Create mock `ActionCtx` for testing event actions

### 1.6 Add Event Construction Tests (`packages/pubsub-core`)
- [x] Create `packages/pubsub-core/src/__tests__/unit/types/event-construction.test.ts`
- [x] Test ping event construction using core types
- [x] Test pong event construction using core types
- [x] Verify event envelope structure and validation
- [x] Test event definition schema validation
- [x] Ensure events are properly typed with generics

## Phase 2: Implement Ping-Pong CSE Functionality

### 2.1 Create Ping-Pong Event Definitions (`apps/examples/trpc-api`)
- [ ] Create `apps/examples/trpc-api/src/sectors/pubsub/` directory
- [ ] Create `apps/examples/trpc-api/src/sectors/pubsub/events.ts`
- [ ] Reference test event fixtures from `@saga-soa/pubsub-core` for consistent structure
- [ ] Define `ping` event with payload schema (e.g., `{ message: string, timestamp: string }`)
- [ ] Define `pong` event with payload schema (e.g., `{ reply: string, originalMessage: string, timestamp: string }`)
- [ ] Implement ping event action that automatically emits pong response
- [ ] Set up proper channel configuration for "pingpong" channel
- [ ] Ensure events import types from `@saga-soa/pubsub-core` (not adapter interfaces)

### 2.2 Create PubSub Sector (`apps/examples/trpc-api`)
- [ ] Create `apps/examples/trpc-api/src/sectors/pubsub/pubsub.controller.ts`
- [ ] Extend `AbstractTRPCController` from `@saga-soa/api-core`
- [ ] Implement ping-pong tRPC procedures
- [ ] Add proper error handling and validation
- [ ] Integrate with existing inversify container

### 2.3 Update Main API Integration
- [ ] Add pubsub sector to `apps/examples/trpc-api/src/sectors/index.ts`
- [ ] Ensure pubsub sector is loaded in main API
- [ ] Configure in-memory adapter from `@saga-soa/pubsub-server` for development
- [ ] Test ping-pong functionality via tRPC

## Phase 3: Web Client Integration

### 3.1 Create PubSub Client Utilities (`packages/pubsub-client`)
- [ ] Create `packages/pubsub-client` package structure
- [ ] Implement basic tRPC client integration
- [ ] Add typed event sending for ping-pong
- [ ] Create simple client API for sending CSE messages

### 3.2 Update Web Client TRPC Page
- [ ] Modify `apps/examples/web-client/app/trpc-api/page.tsx`
- [ ] Add ping-pong functionality section
- [ ] Implement ping button that sends CSE message
- [ ] Display pong responses from server
- [ ] Add real-time subscription to pingpong channel
- [ ] Show event history and timestamps

### 3.3 Add Client-Side Event Handling
- [ ] Create React hooks for pubsub operations
- [ ] Implement connection management
- [ ] Add error handling and reconnection logic
- [ ] Create event display components

## Phase 4: Testing and Validation

### 4.1 Integration Testing
- [ ] Test complete ping-pong flow from web client
- [ ] Verify CSE messages are processed correctly
- [ ] Test automatic pong responses
- [ ] Validate real-time updates via subscriptions

### 4.2 End-to-End Testing
- [ ] Test web client → tRPC API → pubsub server → response flow
- [ ] Verify event persistence and history
- [ ] Test multiple concurrent ping-pong operations
- [ ] Validate error handling and edge cases

## Technical Implementation Details

### Test Event Fixtures Structure
```typescript
// packages/pubsub-core/src/__tests__/fixtures/test-events.ts
import { z } from 'zod';
import type { EventDefinition, EventEnvelope } from '../../types/index.js';

export const pingPayloadSchema = z.object({
  message: z.string(),
  timestamp: z.string()
});

export const pongPayloadSchema = z.object({
  reply: z.string(),
  originalMessage: z.string(),
  timestamp: z.string()
});

export const testPingEvent: EventDefinition<
  z.infer<typeof pingPayloadSchema>,
  { success: boolean }
> = {
  name: 'ping',
  channel: 'pingpong',
  payloadSchema: pingPayloadSchema,
  direction: 'CSE',
  action: async (ctx, payload) => {
    // Mock action for testing
    return { success: true };
  }
};

export const testPongEvent: EventDefinition<
  z.infer<typeof pongPayloadSchema>
> = {
  name: 'pong',
  channel: 'pingpong',
  payloadSchema: pongPayloadSchema,
  direction: 'SSE'
};

export const createTestPingEnvelope = (message: string): EventEnvelope<'ping', z.infer<typeof pingPayloadSchema>> => ({
  id: crypto.randomUUID(),
  name: 'ping',
  channel: 'pingpong',
  payload: { message, timestamp: new Date().toISOString() },
  timestamp: new Date().toISOString()
});

export const createTestPongEnvelope = (reply: string, originalMessage: string): EventEnvelope<'pong', z.infer<typeof pongPayloadSchema>> => ({
  id: crypto.randomUUID(),
  name: 'pong',
  channel: 'pingpong',
  payload: { reply, originalMessage, timestamp: new Date().toISOString() },
  timestamp: new Date().toISOString()
});
```

### In-Memory Adapter Structure
```typescript
export class InMemoryAdapter implements PubSubAdapter {
  private events = new Map<string, EventEnvelope[]>();
  private subscribers = new Map<string, Set<(event: EventEnvelope) => Promise<void>>>();
  private maxHistory = 100; // configurable per channel
  
  async publish(event: EventEnvelope): Promise<void> {
    // Store event in history
    // Notify all subscribers
  }
  
  async subscribe(channel: string, handler: (event: EventEnvelope) => Promise<void>): Promise<{ unsubscribe: () => Promise<void> }> {
    // Add handler to subscribers
    // Return unsubscribe function
  }
  
  async fetchHistory(channel: string, opts: { since?: string, limit?: number }): Promise<EventEnvelope[]> {
    // Return stored events with filtering
  }
}
```

### Ping-Pong Event Definitions
```typescript
import { z } from 'zod';
import type { EventDefinition } from '@saga-soa/pubsub-core';

export const pingEvent: EventDefinition<
  { message: string; timestamp: string },
  { success: boolean }
> = {
  name: 'ping',
  channel: 'pingpong',
  payloadSchema: z.object({
    message: z.string(),
    timestamp: z.string()
  }),
  direction: 'CSE',
  action: async (ctx, payload) => {
    // Emit pong response
    await ctx.emit({
      id: crypto.randomUUID(),
      name: 'pong',
      channel: 'pingpong',
      payload: {
        reply: `Pong! Received: ${payload.message}`,
        originalMessage: payload.message,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
    return { success: true };
  }
};

export const pongEvent: EventDefinition<
  { reply: string; originalMessage: string; timestamp: string }
> = {
  name: 'pong',
  channel: 'pingpong',
  payloadSchema: z.object({
    reply: z.string(),
    originalMessage: z.string(),
    timestamp: z.string()
  }),
  direction: 'SSE'
};

export const events = { 
  "ping": pingEvent,
  "pong": pongEvent
};
```

### Web Client Integration
```typescript
// React hook for ping-pong
export const usePingPong = () => {
  const [pongMessages, setPongMessages] = useState<EventEnvelope[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const sendPing = useCallback(async (message: string) => {
    // Send ping via tRPC
    // Subscribe to pong responses
  }, []);
  
  return { sendPing, pongMessages, isConnected };
};
```

## Success Criteria

### Phase 1 Success
- [ ] In-memory adapter passes all tests
- [ ] Adapter can handle multiple subscribers
- [ ] Event history is properly maintained
- [ ] Memory usage is reasonable and doesn't leak

### Phase 2 Success
- [ ] Ping CSE messages are processed by server
- [ ] Server automatically responds with pong events
- [ ] Events are properly routed through the pingpong channel
- [ ] tRPC procedures work correctly

### Phase 3 Success
- [ ] Web client can send ping messages
- [ ] Pong responses are displayed in real-time
- [ ] Event history is visible
- [ ] Connection management works reliably

### Overall Success
- [ ] Complete ping-pong flow works end-to-end
- [ ] Real-time updates function properly
- [ ] Error handling is robust
- [ ] Performance is acceptable for development use

## Dependencies and Prerequisites

### Required Packages
- `@saga-soa/pubsub-core` (existing) - provides event types and definitions
- `@saga-soa/pubsub-server` (existing) - provides server runtime and adapter implementations
- `@saga-soa/api-core` (existing) - provides base controller classes
- `@saga-soa/logger` (existing) - provides logging functionality

### Development Tools
- TypeScript 5.8+
- Vitest for testing
- tsup for builds
- Existing monorepo tooling

## Implementation Phases

- **Phase 1**: Restructure + In-Memory Adapter + Test Events
- **Phase 2**: Ping-Pong CSE Implementation  
- **Phase 3**: Web Client Integration
- **Phase 4**: Testing & Validation

## Next Steps

1. **Start with Phase 1**: Restructure adapter architecture and implement in-memory adapter
2. **Move to Phase 2**: Create ping-pong events and sector
3. **Complete Phase 3**: Integrate with web client
4. **Validate Phase 4**: Test complete flow and fix issues

## Architectural Benefits of This Restructure

- **Cleaner Separation**: Core package focuses only on fundamental types and definitions
- **Better Dependencies**: Server package owns runtime concerns like adapters
- **Logical Organization**: Adapter interfaces live with their implementations
- **Reduced Coupling**: Core package doesn't depend on server implementation details

This focused approach will deliver a working pubsub system that demonstrates the core CSE/SSE functionality while building on the existing solid foundation.
