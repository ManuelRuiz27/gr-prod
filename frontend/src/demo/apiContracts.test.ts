import { describe, expect, it } from 'vitest';
import { handlers } from '../mocks/handlers';

describe('demo mock API contract routes', () => {
  const routes = handlers.map((handler) => handler.info.header);

  it('uses the normative group, contract, seating, meal, thermo and cancellation paths', () => {
    expect(routes).toEqual(expect.arrayContaining([
      'GET */api/v1/me/events/:eventId/group',
      'POST */api/v1/me/events/:eventId/group-members',
      'POST */api/v1/me/events/:eventId/contract-line-items/quote',
      'POST */api/v1/me/events/:eventId/contract-line-items',
      'POST */api/v1/me/events/:eventId/contract/accept',
      'PUT */api/v1/me/events/:eventId/table-assignments',
      'PUT */api/v1/me/events/:eventId/group-members/:memberId/meal-selection',
      'POST */api/v1/me/events/:eventId/thermo/request',
      'PATCH */api/v1/me/events/:eventId/thermo',
      'POST */api/v1/admin/events/:eventId/graduates/:membershipId/cancel',
    ]));
    expect(routes).not.toContain('POST */api/v1/admin/events/:eventId/graduates/:membershipId/cancellation');
    expect(routes).not.toContain('GET */api/v1/me/events/:eventId/group-members');
  });
});
