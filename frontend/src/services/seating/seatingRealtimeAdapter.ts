import type { SeatingEvent } from './seatingRealtimeTypes';
import { applyRemoteSeatingEvent } from './seatingStore';

export interface SeatingRealtimeAdapter {
  subscribe(eventId: string, callback: (event: SeatingEvent) => void): () => void;
  publish(event: SeatingEvent): Promise<void>;
}

export const SEATING_EVENT_NAME = 'gr:seating-event';

class MockSeatingRealtimeAdapter implements SeatingRealtimeAdapter {
  private listeners: Map<string, Set<(event: SeatingEvent) => void>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('gr-seating-realtime');
        this.broadcastChannel.onmessage = (msgEvent) => {
          if (msgEvent.data && msgEvent.data.eventId) {
            const event = msgEvent.data as SeatingEvent;
            // 1. Aplica el evento remoto al store local sin republicar
            applyRemoteSeatingEvent(event);
            // 2. Notifica a suscriptores locales
            this.dispatchLocal(event);
          }
        };
      } catch {
        this.broadcastChannel = null;
      }
    }

    // Escucha también custom events del objeto window
    if (typeof window !== 'undefined') {
      window.addEventListener(SEATING_EVENT_NAME, ((customEv: CustomEvent<SeatingEvent>) => {
        if (
          customEv.detail &&
          customEv.detail.eventId &&
          (customEv.detail as unknown as { _originAdapter?: unknown })._originAdapter !== this
        ) {
          // 1. Aplica el evento remoto al store local sin republicar
          applyRemoteSeatingEvent(customEv.detail);
          // 2. Notifica a suscriptores locales
          this.dispatchLocal(customEv.detail);
        }
      }) as EventListener);
    }
  }

  subscribe(eventId: string, callback: (event: SeatingEvent) => void): () => void {
    if (!this.listeners.has(eventId)) {
      this.listeners.set(eventId, new Set());
    }
    const set = this.listeners.get(eventId)!;
    set.add(callback);

    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(eventId);
      }
    };
  }

  async publish(event: SeatingEvent): Promise<void> {
    // 1. Dispatch a escuchadores locales en memoria
    this.dispatchLocal(event);

    // 2. BroadcastChannel para otras pestañas/ventanas
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch {
        // Ignorar si el canal no está listo
      }
    }

    // 3. CustomEvent en window para compatibilidad con código externo
    if (typeof window !== 'undefined') {
      const taggedEvent = Object.assign({}, event, { _originAdapter: this });
      window.dispatchEvent(
        new CustomEvent(SEATING_EVENT_NAME, {
          detail: taggedEvent,
        })
      );
    }
  }

  private dispatchLocal(event: SeatingEvent) {
    const set = this.listeners.get(event.eventId);
    if (set) {
      set.forEach((callback) => {
        try {
          callback(event);
        } catch (err) {
          console.error('[SeatingRealtime] Error in subscriber callback:', err);
        }
      });
    }
  }
}

// Instancia singleton por omisión (Mock Adapter reactivo)
let activeAdapter: SeatingRealtimeAdapter = new MockSeatingRealtimeAdapter();

/**
 * Permite inyectar un adapter alternativo (ej. Supabase Realtime o WebSockets)
 */
export function setSeatingRealtimeAdapter(adapter: SeatingRealtimeAdapter) {
  activeAdapter = adapter;
}

export function getSeatingRealtimeAdapter(): SeatingRealtimeAdapter {
  return activeAdapter;
}

/**
 * Suscripción estándar tipada exigida por las especificaciones de FASE D1
 */
export function subscribeToSeating(
  eventId: string,
  callback: (event: SeatingEvent) => void
): () => void {
  return activeAdapter.subscribe(eventId, callback);
}

/**
 * Emisión de evento en tiempo real
 */
export async function publishSeatingEvent(event: SeatingEvent): Promise<void> {
  return activeAdapter.publish(event);
}
