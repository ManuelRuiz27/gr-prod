export interface RealtimeEnvelope {
  id: string;
  type: string;
  timestamp: string;
  eventId?: string;
  targetAccountId?: string;
  data: Record<string, unknown>;
}

export interface ConnectedActor {
  id: string;
  role: string;
  eventId?: string;
}

export interface SseMessageEvent {
  id: string;
  type: string;
  data: string;
}
