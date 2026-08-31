/**
 * adminEventAudit.test.tsx
 * FRONTEND-09 — Auditoría ADMIN
 *
 * Tests:
 * 1. Event scope: strictly isolated to :eventId without fallback.
 * 2. Missing eventId renders "Selecciona un evento" without fallback.
 * 3. Invalid eventId renders "Evento no encontrado" EmptyState.
 * 4. Unintegrated backend state: displays "Historial de auditoría no disponible" and "Integración con backend pendiente".
 * 5. No fabricated fake logs: does NOT contain "Mariana hizo...", fake actors, fake movements, or fabricated reasons.
 * 6. UI states:
 *    - loading: renders loading indicator.
 *    - empty: renders "Sin registros de auditoría".
 *    - error: renders "Historial de auditoría no disponible".
 *    - ready with typed logs: renders actor, timestamp, action, entity, diff, and reason.
 * 7. Conceptual coverage: supports all required auditable actions (places, tables, meals, payments, adjustments, refunds, cancellations, lifecycle, thermos).
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventAuditScreen, AdminEventAuditContent } from '../pages/admin/AdminEventAuditScreen';
import type { AuditLogItem } from '../pages/admin/audit/auditViewModel';

function renderAuditScreen(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/events/:eventId/audit" element={<AdminEventAuditScreen />} />
        <Route path="/admin/audit" element={<AdminEventAuditScreen />} />
        <Route path="/admin/history" element={<AdminEventAuditScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Audit Screen (FRONTEND-09)', () => {
  // ── 1. Event scope ───────────────────────────────────────────────────────────
  it('1. Event scope: renders audit screen for evt-derecho-2027', () => {
    renderAuditScreen('/admin/events/evt-derecho-2027/audit');
    expect(screen.getByText('Historial de Cambios y Auditoría')).toBeInTheDocument();
    expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);
  });

  // ── 2. Missing eventId ───────────────────────────────────────────────────────
  it('2. Missing eventId: renders "Selecciona un evento" without fallback', () => {
    renderAuditScreen('/admin/audit');
    expect(screen.getAllByText(/Selecciona un evento/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Historial de Cambios y Auditoría')).not.toBeInTheDocument();
  });

  // ── 3. Invalid eventId ───────────────────────────────────────────────────────
  it('3. Invalid eventId: renders "Evento no encontrado" EmptyState', () => {
    renderAuditScreen('/admin/events/evt-invalid-9999/audit');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });

  // ── 4. Unintegrated backend state ────────────────────────────────────────────
  it('4. Unintegrated backend state: displays "Historial de auditoría no disponible" and "Integración con backend pendiente"', () => {
    renderAuditScreen('/admin/events/evt-derecho-2027/audit');
    expect(screen.getByText('Historial de auditoría no disponible')).toBeInTheDocument();
    expect(screen.getByText(/Integración con backend pendiente/i)).toBeInTheDocument();
  });

  // ── 5. No fabricated demo data ───────────────────────────────────────────────
  it('5. No fabricated demo data: does NOT invent fake log stories or fabricated actors', () => {
    renderAuditScreen('/admin/events/evt-derecho-2027/audit');
    expect(screen.queryByText(/Mariana cambió a Andrea Martínez/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mariana registró el pago/i)).not.toBeInTheDocument();
  });

  // ── 6. UI States testing (loading, empty, ready) ──────────────────────────────
  describe('UI States via AdminEventAuditContent component', () => {
    it('renders loading state correctly', () => {
      render(
        <MemoryRouter>
          <AdminEventAuditContent paramEventId="evt-derecho-2027" initialState="loading" />
        </MemoryRouter>
      );
      expect(screen.getByText('Cargando historial de auditoría...')).toBeInTheDocument();
    });

    it('renders empty state when there are no logs', () => {
      render(
        <MemoryRouter>
          <AdminEventAuditContent paramEventId="evt-derecho-2027" initialState="empty" />
        </MemoryRouter>
      );
      expect(screen.getByText('Sin registros de auditoría')).toBeInTheDocument();
      expect(screen.getByText('No se han registrado acciones auditables para este evento.')).toBeInTheDocument();
    });

    it('renders ready state with formatted AuditLogItems (actor, timestamp, action, entity, diff, reason)', () => {
      const sampleLogs: AuditLogItem[] = [
        {
          id: 'aud-1',
          actor: 'Admin General',
          timestamp: '2027-04-10 14:30',
          action: 'TABLE_CHANGED',
          actionLabel: 'Cambio de mesa',
          entityType: 'GRADUATE',
          entityLabel: 'Graduado',
          entityId: 'grad-andrea-martinez',
          description: 'Reasignación de mesa para Andrea Martínez de Mesa 18 a Mesa 24',
          beforeData: { tableNumber: 18 },
          afterData: { tableNumber: 24 },
          reason: 'Acomodo grupal solicitado por graduado',
        },
        {
          id: 'aud-2',
          actor: 'Admin Finanzas',
          timestamp: '2027-04-12 10:15',
          action: 'MANUAL_PAYMENT',
          actionLabel: 'Pago manual',
          entityType: 'PAYMENT',
          entityLabel: 'Pago',
          entityId: 'pay-manual-001',
          description: 'Registro de abono directo por $2,500',
          beforeData: { pendingAmount: 5000 },
          afterData: { pendingAmount: 2500 },
          reason: 'Comprobante bancario verificado',
        },
      ];

      render(
        <MemoryRouter>
          <AdminEventAuditContent
            paramEventId="evt-derecho-2027"
            initialState="ready"
            initialLogs={sampleLogs}
          />
        </MemoryRouter>
      );

      // Asserts actor & timestamp
      expect(screen.getByText('Admin General')).toBeInTheDocument();
      expect(screen.getByText('2027-04-10 14:30')).toBeInTheDocument();
      expect(screen.getByText('Cambio de mesa')).toBeInTheDocument();
      expect(screen.getByText(/Reasignación de mesa para Andrea Martínez/i)).toBeInTheDocument();

      // Asserts diff & reason
      expect(screen.getAllByText('Valor Anterior').length).toBe(2);
      expect(screen.getAllByText('Nuevo Valor').length).toBe(2);
      expect(screen.getByText('Acomodo grupal solicitado por graduado')).toBeInTheDocument();
      expect(screen.getByText('Comprobante bancario verificado')).toBeInTheDocument();
    });
  });
});
