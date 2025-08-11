export type EventName = `${string}:${string}`; // Example: "orders:created"

export interface EventEnvelope<Name extends EventName = EventName, Payload = unknown> {
  id: string;                 // unique id (uuid/v4)
  name: Name;                 // canonical event name
  channel: string;            // logical family, e.g. "orders"
  payload: Payload;
  timestamp: string;          // ISO 8601
  meta?: Record<string, any>; // optional metadata (source, version, partitionKey, clientEventId)
}

export interface EventMetadata {
  source?: string;
  version?: number;
  partitionKey?: string;
  clientEventId?: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
}

export interface EventOptions {
  clientEventId?: string;
  correlationId?: string;
  partitionKey?: string;
  immediate?: boolean; // bypass queue for immediate processing
} 