import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { RealtimeEnvelope, ConnectedActor, SseMessageEvent } from './realtime.types';
import { getEventMetadata, EventName } from '../events/event-catalog';
import { OutboxEvent } from '@prisma/client';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly eventSubject = new Subject<RealtimeEnvelope>();

  /**
   * Broadcasts an OutboxEvent as a sanitized RealtimeEnvelope to active SSE streams.
   */
  public broadcast(outboxEvent: OutboxEvent): boolean {
    const meta = getEventMetadata(outboxEvent.event_type);
    if (!meta.realtimeExposure) {
      this.logger.debug(`Event ${outboxEvent.event_type} (${outboxEvent.id}) has no realtime exposure. Skipped.`);
      return false;
    }

    const rawPayload = (outboxEvent.payload as Record<string, unknown>) || {};
    const sanitizedData = this.sanitizePayload(outboxEvent.event_type, rawPayload);

    const envelope: RealtimeEnvelope = {
      id: outboxEvent.id,
      type: outboxEvent.event_type,
      timestamp: outboxEvent.created_at.toISOString(),
      eventId: typeof rawPayload.eventId === 'string' ? rawPayload.eventId : undefined,
      targetAccountId: typeof rawPayload.accountId === 'string' ? rawPayload.accountId : undefined,
      data: sanitizedData,
    };

    this.eventSubject.next(envelope);
    return true;
  }

  /**
   * Returns a filtered SSE Observable stream for a specific authenticated actor.
   */
  public getStreamForActor(actor: ConnectedActor): Observable<SseMessageEvent> {
    return this.eventSubject.asObservable().pipe(
      filter((envelope) => this.isAuthorized(actor, envelope)),
      map((envelope) => ({
        id: envelope.id,
        type: envelope.type,
        data: JSON.stringify(envelope.data),
      })),
    );
  }

  /**
   * Evaluates if a given actor is authorized to receive a specific event envelope.
   */
  public isAuthorized(actor: ConnectedActor, envelope: RealtimeEnvelope): boolean {
    // 1. Event filter: if actor asked for a specific eventId, ensure match
    if (actor.eventId && envelope.eventId && actor.eventId !== envelope.eventId) {
      return false;
    }

    // 2. ADMIN role receives all authorized operational events for the event
    if (actor.role === 'ADMIN') {
      return true;
    }

    // 3. GRADUATE role checks
    const meta = getEventMetadata(envelope.type);

    // Public seating updates: allowed for all attendees of the event
    if (meta.isPublicSeating || meta.audience === 'ALL_ATTENDEES') {
      return true;
    }

    // Specific user updates: strictly check that the target account matches the actor
    if (meta.audience === 'SPECIFIC_USER') {
      return envelope.targetAccountId === actor.id;
    }

    // Deny all other events (e.g. reconciliation cases, admin-only jobs)
    return false;
  }

  /**
   * Strips all internal secrets, passwords, tokens, and third-party nominal details.
   */
  public sanitizePayload(eventType: string, payload: Record<string, unknown>): Record<string, unknown> {
    const copy = { ...payload };

    // Global forbidden fields
    const forbiddenKeys = [
      'password',
      'password_hash',
      'token',
      'access_token',
      'refresh_token',
      'secret',
      'api_key',
      'access_code',
      'credentials',
      'headers',
      'stack',
    ];

    for (const key of Object.keys(copy)) {
      const lower = key.toLowerCase();
      if (forbiddenKeys.some((f) => lower.includes(f))) {
        delete copy[key];
      }
    }

    // Special seating projection: ensure NO nominal or PII details of other graduates leak
    if (eventType === EventName.TABLE_ASSIGNMENT_CHANGED) {
      return {
        eventId: copy.eventId,
        tableId: copy.tableId,
        occupied: copy.occupied,
        available: copy.available,
        status: copy.status,
        occurredAt: copy.occurredAt || new Date().toISOString(),
      };
    }

    return copy;
  }
}
