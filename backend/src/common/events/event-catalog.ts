export const EventName = {
  // 1. Event
  EVENT_UPDATED: 'event.updated.v1',

  // 2. GraduateMembership
  MEMBERSHIP_STATUS_CHANGED: 'membership.status_changed.v1',

  // 3. GraduateContract
  CONTRACT_ACCEPTED: 'contract.accepted.v1',
  CONTRACT_CANCELLED: 'contract.cancelled.v1',

  // 4. PaymentPlan
  PAYMENT_PLAN_UPDATED: 'payment_plan.updated.v1',

  // 5. PaymentSubmission
  PAYMENT_SUBMISSION_CREATED: 'payment_submission.created.v1',
  PAYMENT_SUBMISSION_APPROVED: 'payment_submission.approved.v1',
  PAYMENT_SUBMISSION_REJECTED: 'payment_submission.rejected.v1',

  // 6. PaymentTransaction
  PAYMENT_TRANSACTION_CONFIRMED: 'payment_transaction.confirmed.v1',
  PAYMENT_TRANSACTION_REVERSED: 'payment_transaction.reversed.v1',

  // 7. Refund
  REFUND_REQUESTED: 'refund.requested.v1',
  REFUND_CONFIRMED: 'refund.confirmed.v1',
  REFUND_FAILED: 'refund.failed.v1',

  // 8. EventTable
  TABLE_CREATED: 'table.created.v1',
  TABLE_UPDATED: 'table.updated.v1',
  TABLE_DELETED: 'table.deleted.v1',
  TABLE_STATUS_CHANGED: 'table.status_changed.v1',

  // 9. TableAssignment
  TABLE_ASSIGNMENT_CHANGED: 'table_assignment.changed.v1',

  // 10. MealSelection
  MEAL_SELECTION_UPDATED: 'meal_selection.updated.v1',

  // 11. ThermoRequest
  THERMO_UPDATED: 'thermo.updated.v1',

  // 12. ExportJob
  EXPORT_COMPLETED: 'export.completed.v1',
  EXPORT_FAILED: 'export.failed.v1',

  // 13. ReconciliationCase
  RECONCILIATION_CASE_CREATED: 'reconciliation_case.created.v1',
  RECONCILIATION_CASE_RESOLVED: 'reconciliation_case.resolved.v1',
} as const;

export type EventNameType = (typeof EventName)[keyof typeof EventName];

export type EventAudience = 'ALL_ATTENDEES' | 'SPECIFIC_USER' | 'ADMIN';

export interface EventMetadata {
  audience: EventAudience;
  realtimeExposure: boolean;
  isPublicSeating: boolean;
}

export const EVENT_METADATA_MAP: Record<string, EventMetadata> = {
  [EventName.EVENT_UPDATED]: { audience: 'ALL_ATTENDEES', realtimeExposure: true, isPublicSeating: false },
  [EventName.MEMBERSHIP_STATUS_CHANGED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.CONTRACT_ACCEPTED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.CONTRACT_CANCELLED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.PAYMENT_PLAN_UPDATED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.PAYMENT_SUBMISSION_CREATED]: { audience: 'ADMIN', realtimeExposure: true, isPublicSeating: false },
  [EventName.PAYMENT_SUBMISSION_APPROVED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.PAYMENT_SUBMISSION_REJECTED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.PAYMENT_TRANSACTION_CONFIRMED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.PAYMENT_TRANSACTION_REVERSED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.REFUND_REQUESTED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.REFUND_CONFIRMED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.REFUND_FAILED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.TABLE_CREATED]: { audience: 'ALL_ATTENDEES', realtimeExposure: true, isPublicSeating: true },
  [EventName.TABLE_UPDATED]: { audience: 'ALL_ATTENDEES', realtimeExposure: true, isPublicSeating: true },
  [EventName.TABLE_DELETED]: { audience: 'ALL_ATTENDEES', realtimeExposure: true, isPublicSeating: true },
  [EventName.TABLE_STATUS_CHANGED]: { audience: 'ALL_ATTENDEES', realtimeExposure: true, isPublicSeating: true },
  [EventName.TABLE_ASSIGNMENT_CHANGED]: { audience: 'ALL_ATTENDEES', realtimeExposure: true, isPublicSeating: true },
  [EventName.MEAL_SELECTION_UPDATED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.THERMO_UPDATED]: { audience: 'SPECIFIC_USER', realtimeExposure: true, isPublicSeating: false },
  [EventName.EXPORT_COMPLETED]: { audience: 'ADMIN', realtimeExposure: true, isPublicSeating: false },
  [EventName.EXPORT_FAILED]: { audience: 'ADMIN', realtimeExposure: true, isPublicSeating: false },
  [EventName.RECONCILIATION_CASE_CREATED]: { audience: 'ADMIN', realtimeExposure: true, isPublicSeating: false },
  [EventName.RECONCILIATION_CASE_RESOLVED]: { audience: 'ADMIN', realtimeExposure: true, isPublicSeating: false },
};

export function getEventMetadata(eventType: string): EventMetadata {
  return (
    EVENT_METADATA_MAP[eventType] || {
      audience: 'ADMIN',
      realtimeExposure: false,
      isPublicSeating: false,
    }
  );
}
