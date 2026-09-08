import { AccountRole } from '@prisma/client';

export type ActorType = 'PUBLIC' | 'GRADUATE' | 'ADMIN' | 'PROVIDER' | 'SYSTEM';

export interface ActorContext {
  accountId?: string;
  email?: string;
  fullName?: string;
  role?: AccountRole;
  actorType: ActorType;
  membershipId?: string;
  eventId?: string;
  sessionId?: string;
  requestId?: string;
}
