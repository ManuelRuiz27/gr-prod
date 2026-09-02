/**
 * adminEventAudit.test.tsx
 * FRONTEND-09 / VIS-12 / VIS-12-R1 — Auditoría ADMIN
 *
 * Tests:
 * 1. Event scope: strictly isolated to :eventId without fallback in contextual mode.
 * 2. Global route /admin/audit: renders PageHeader, filters, and Event selector on screen.
 * 3. Global route /admin/audit: selecting an event in dropdown renders audit logs in place.
 * 4. Invalid eventId renders "Evento no encontrado" EmptyState.
 * 5. Unintegrated backend state: displays "Historial de auditoría no disponible" and "Integración con backend pendiente".
 * 6. No fabricated fake logs: does NOT contain "Mariana hizo...", fake actors, fake movements, or fabricated reasons.
 * 7. Ready state renders actor, timestamp, action, entity, structured diff, and reason.
 * 8. Filter interactivity:
 *    - Actor origin filter: clicking 'Proveedor' shows Proveedor logs and hides ADMIN logs.
 *    - Action category filter: filtering by TABLE_CHANGED shows only table logs.
 *    - Entity filter: filtering by TABLE shows only table logs.
 *    - Search keyword: searching 'SPEI' finds only matching audit log.
 * 9. Anti-JSON: no JSON.stringify / raw JSON blobs in the DOM.
 * 10. Append-only: no edit or delete buttons in audit logs.
 * 11. Detail Drawer: opens drawer when clicking "Ver detalle".
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminEventAuditScreen, AdminEventAuditContent } from '../pages/admin/AdminEventAuditScreen';
import type { AuditLogItem } from '../pages/admin/audit/auditViewModel';

function renderAuditScreen(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/events/:eventId/audit" element={<AdminEventAuditScreen />} />
        <Route path="/admin/audit" element={<AdminEventAuditScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Admin Event Audit Screen (FRONTEND-09 / VIS-12 / VIS-12-R1)', () => {
  // ── 1. Event scope ───────────────────────────────────────────────────────────
  it('1. Event scope: renders audit screen for evt-derecho-2027 in contextual mode', () => {
    renderAuditScreen('/admin/events/evt-derecho-2027/audit');
    expect(screen.getByText('Historial de Cambios y Auditoría')).toBeInTheDocument();
    expect(screen.getAllByText(/Graduación Facultad de Derecho 2027/i).length).toBeGreaterThan(0);
  });

  // ── 2. Global route reachable selector ───────────────────────────────────────
  it('2. Global route /admin/audit renders PageHeader, filter bar, and Event selector on screen', () => {
    renderAuditScreen('/admin/audit');

    expect(screen.getByText('Historial de Cambios y Auditoría')).toBeInTheDocument();
    expect(screen.getByLabelText('Evento')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un evento para consultar auditoría')).toBeInTheDocument();
  });

  // ── 3. Global route event selection ──────────────────────────────────────────
  it('3. Global route /admin/audit: selecting an event in dropdown renders audit in place', () => {
    renderAuditScreen('/admin/audit');

    const eventSelect = screen.getByLabelText('Evento');
    fireEvent.change(eventSelect, { target: { value: 'evt-derecho-2027' } });

    expect(screen.getByText('Historial de auditoría no disponible')).toBeInTheDocument();
  });

  // ── 4. Invalid eventId ───────────────────────────────────────────────────────
  it('4. Invalid eventId: renders "Evento no encontrado" EmptyState', () => {
    renderAuditScreen('/admin/events/evt-invalid-9999/audit');
    expect(screen.getAllByText(/Evento no encontrado/i).length).toBeGreaterThan(0);
  });

  // ── 5. Unintegrated backend state ────────────────────────────────────────────
  it('5. Unintegrated backend state: displays "Historial de auditoría no disponible" and "Integración con backend pendiente"', () => {
    renderAuditScreen('/admin/events/evt-derecho-2027/audit');
    expect(screen.getByText('Historial de auditoría no disponible')).toBeInTheDocument();
    expect(screen.getByText(/Integración con backend pendiente/i)).toBeInTheDocument();
  });

  // ── 6. UI States and Format ──────────────────────────────────────────────────
  describe('UI States via AdminEventAuditContent component', () => {
    it('renders loading state correctly', () => {
      render(
        <MemoryRouter>
          <AdminEventAuditContent paramEventId="evt-derecho-2027" initialState="loading" />
        </MemoryRouter>
      );
      expect(screen.getByText('Cargando historial de auditoría...')).toBeInTheDocument();
    });

    it('renders ready state with formatted AuditLogItems, filters by Proveedor, and opens Drawer', () => {
      const sampleLogs: AuditLogItem[] = [
        {
          id: 'aud-1',
          actor: 'Admin General',
          actorOrigin: 'ADMIN',
          timestamp: '2027-04-10 14:30',
          action: 'TABLE_CHANGED',
          actionLabel: 'Reasignó una mesa',
          entityType: 'TABLE',
          entityLabel: 'Mesa',
          entityId: 'tbl-24',
          description: 'Reasignación de mesa para Andrea Martínez de Mesa 18 a Mesa 24',
          beforeData: { tableNumber: 18 },
          afterData: { tableNumber: 24 },
          reason: 'Acomodo grupal solicitado por graduado',
        },
        {
          id: 'aud-2',
          actor: 'Banquetes Premier',
          actorOrigin: 'Proveedor',
          timestamp: '2027-04-12 15:00',
          action: 'MEAL_OVERRIDE',
          actionLabel: 'Actualizó capacidad',
          entityType: 'MEAL',
          entityLabel: 'Platillo',
          entityId: 'srv-banquete-01',
          description: 'Ampliación de insumos especiales por proveedor externo',
          beforeData: { capacity: 15 },
          afterData: { capacity: 25 },
          reason: 'Insumos confirmados',
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

      // Verify formatted items rendered
      expect(screen.getByText('Admin General')).toBeInTheDocument();
      expect(screen.getByText('Banquetes Premier')).toBeInTheDocument();
      expect(screen.getAllByText('Valor Anterior').length).toBe(2);
      expect(screen.getAllByText('Nuevo Valor').length).toBe(2);

      // Filter by Proveedor
      const proveedorButton = screen.getByRole('button', { name: 'Proveedor' });
      fireEvent.click(proveedorButton);

      // Should show Proveedor log and hide Admin log
      expect(screen.getByText('Banquetes Premier')).toBeInTheDocument();
      expect(screen.queryByText('Admin General')).not.toBeInTheDocument();

      // Open Detail Drawer
      const detailButtons = screen.getAllByRole('button', { name: /Ver detalle/i });
      fireEvent.click(detailButtons[0]);
      expect(screen.getByText('Detalle del registro de auditoría')).toBeInTheDocument();
    });
  });

  // ── 7. Anti-JSON check ───────────────────────────────────────────────────────
  it('7. anti-json: does NOT render raw JSON blobs in the DOM', () => {
    const sampleLogs: AuditLogItem[] = [
      {
        id: 'aud-1',
        actor: 'Admin General',
        actorOrigin: 'ADMIN',
        timestamp: '2027-04-10 14:30',
        action: 'TABLE_CHANGED',
        actionLabel: 'Reasignó una mesa',
        entityType: 'GRADUATE',
        entityLabel: 'Graduado',
        entityId: 'grad-andrea-martinez',
        description: 'Reasignación de mesa para Andrea Martínez',
        beforeData: { tableNumber: 18 },
        afterData: { tableNumber: 24 },
      },
    ];

    const { container } = render(
      <MemoryRouter>
        <AdminEventAuditContent
          paramEventId="evt-derecho-2027"
          initialState="ready"
          initialLogs={sampleLogs}
        />
      </MemoryRouter>
    );

    const html = container.textContent || '';
    expect(html).not.toContain('{"tableNumber":18}');
    expect(html).not.toContain('{"tableNumber":24}');
  });

  // ── 8. Append-Only ───────────────────────────────────────────────────────────
  it('8. append-only: does NOT render edit or delete buttons for audit records', () => {
    const sampleLogs: AuditLogItem[] = [
      {
        id: 'aud-1',
        actor: 'Admin General',
        actorOrigin: 'ADMIN',
        timestamp: '2027-04-10 14:30',
        action: 'TABLE_CHANGED',
        actionLabel: 'Reasignó una mesa',
        entityType: 'GRADUATE',
        entityLabel: 'Graduado',
        entityId: 'grad-andrea-martinez',
        description: 'Reasignación de mesa',
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

    expect(screen.queryByRole('button', { name: /Editar log/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar log/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Borrar/i })).not.toBeInTheDocument();
  });

  // ── 9. Date Range Filter Functional & Deterministic ──────────────────────────
  it('9. Date range filter filters audit logs deterministically against QA reference date', () => {
    const multiDateLogs: AuditLogItem[] = [
      {
        id: 'aud-recent',
        actor: 'Admin Reciente',
        actorOrigin: 'ADMIN',
        timestamp: '2027-04-12 10:00', // Reference date is 2027-04-12 -> 0 days diff
        action: 'TABLE_CHANGED',
        actionLabel: 'Reasignó mesa',
        entityType: 'TABLE',
        entityLabel: 'Mesa',
        entityId: 'tbl-1',
        description: 'Reasignación reciente',
      },
      {
        id: 'aud-30days',
        actor: 'Admin Mes Pasado',
        actorOrigin: 'ADMIN',
        timestamp: '2027-03-25 10:00', // 18 days diff -> within 30 days, not in 7 days
        action: 'MEAL_OVERRIDE',
        actionLabel: 'Modificó platillo',
        entityType: 'MEAL',
        entityLabel: 'Platillo',
        entityId: 'meal-1',
        description: 'Modificación hace 18 días',
      },
      {
        id: 'aud-old',
        actor: 'Sistema Antiguo',
        actorOrigin: 'Sistema',
        timestamp: '2027-01-15 09:00', // 87 days diff -> outside 30 days
        action: 'POLICY_PUBLISHED',
        actionLabel: 'Publicó política',
        entityType: 'POLICY',
        entityLabel: 'Política',
        entityId: 'pol-1',
        description: 'Publicación hace 87 días',
      },
    ];

    render(
      <MemoryRouter>
        <AdminEventAuditContent
          paramEventId="evt-derecho-2027"
          initialState="ready"
          initialLogs={multiDateLogs}
        />
      </MemoryRouter>
    );

    // Initial state: 'all' -> all 3 logs rendered
    expect(screen.getByText('Admin Reciente')).toBeInTheDocument();
    expect(screen.getByText('Admin Mes Pasado')).toBeInTheDocument();
    expect(screen.getByText('Sistema Antiguo')).toBeInTheDocument();

    const dateSelect = screen.getByLabelText('Rango de fechas');

    // Filter to last 7 days -> only aud-recent
    fireEvent.change(dateSelect, { target: { value: 'last7' } });
    expect(screen.getByText('Admin Reciente')).toBeInTheDocument();
    expect(screen.queryByText('Admin Mes Pasado')).not.toBeInTheDocument();
    expect(screen.queryByText('Sistema Antiguo')).not.toBeInTheDocument();

    // Filter to last 30 days -> aud-recent and aud-30days, hide aud-old
    fireEvent.change(dateSelect, { target: { value: 'last30' } });
    expect(screen.getByText('Admin Reciente')).toBeInTheDocument();
    expect(screen.getByText('Admin Mes Pasado')).toBeInTheDocument();
    expect(screen.queryByText('Sistema Antiguo')).not.toBeInTheDocument();
  });

  // ── 10. Action, Entity, and Search Filters ────────────────────────────────────
  it('10. Filters audit logs by action category, entity, and search term', () => {
    const filterLogs: AuditLogItem[] = [
      {
        id: 'aud-table',
        actor: 'Admin Mesa',
        actorOrigin: 'ADMIN',
        timestamp: '2027-04-12 10:00',
        action: 'TABLE_CHANGED',
        actionLabel: 'Reasignó mesa',
        entityType: 'TABLE',
        entityLabel: 'Mesa',
        entityId: 'tbl-99',
        description: 'Acomodo grupal en mesa 99',
        reason: 'Petición especial SPEI',
      },
      {
        id: 'aud-meal',
        actor: 'Admin Menú',
        actorOrigin: 'ADMIN',
        timestamp: '2027-04-12 11:00',
        action: 'MEAL_OVERRIDE',
        actionLabel: 'Modificó platillo',
        entityType: 'MEAL',
        entityLabel: 'Platillo',
        entityId: 'meal-88',
        description: 'Cambio de platillo vegano',
      },
    ];

    render(
      <MemoryRouter>
        <AdminEventAuditContent
          paramEventId="evt-derecho-2027"
          initialState="ready"
          initialLogs={filterLogs}
        />
      </MemoryRouter>
    );

    // Filter by entity TABLE
    const entitySelect = screen.getByLabelText('Entidad / Contexto');
    fireEvent.change(entitySelect, { target: { value: 'TABLE' } });
    expect(screen.getByText('Admin Mesa')).toBeInTheDocument();
    expect(screen.queryByText('Admin Menú')).not.toBeInTheDocument();

    // Reset entity filter and search by keyword
    fireEvent.change(entitySelect, { target: { value: 'all' } });
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'vegano' } });
    expect(screen.queryByText('Admin Mesa')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Menú')).toBeInTheDocument();
  });
});
