/**
 * AdminEventMealsScreen.tsx
 *
 * Route: /admin/events/:eventId/meals
 * Ticket: FRONTEND-05 — GR-07-08 — Platillos ADMIN
 *
 * Implements UX-A-MEAL-001, UX-A-MEAL-002, UX-A-MEAL-003
 *
 * Rules enforced:
 * - Strictly scoped to :eventId — no fallback to any hard-coded event ID.
 * - No hardcoded totals (68, 12, 8 removed).
 * - No invented guests, deadlines, selections, or history.
 * - No technical enum names exposed to the user.
 * - Deadline: EventSettings.meals_deadline not available in fixtures ->
 *   isAfterDeadline defaults to false, no date is invented.
 * - Local preview changes are identified as not persisted.
 */
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, EmptyState } from '../../design-system';
import { mockEvents } from '../../fixtures/eventFixtures';
import { mockMealOptions } from '../../fixtures/layoutFixtures';
import { mockGraduatesList } from '../../fixtures/graduateFixtures';
import {
  buildMealOptionCounts,
  totalKnownSelections,
  buildGraduateMealViewModels,
} from './meals/mealViewModel';
import { MealSummary } from './meals/MealSummary';
import { GraduateMealsTable } from './meals/GraduateMealsTable';
import { GraduateMealDetail } from './meals/GraduateMealDetail';

// ── Inner content — receives resolved event ID from the wrapper ───────────────

interface AdminEventMealsContentProps {
  paramEventId?: string;
}

const AdminEventMealsContent: React.FC<AdminEventMealsContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  // ── 1. Event resolution — strictly from URL param, no fallback ──────────────
  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  // ── 2. Detail panel state ───────────────────────────────────────────────────
  const [selectedGraduateId, setSelectedGraduateId] = useState<string | null>(null);

  // ── 3. Event-scoped meal options from catalogue ─────────────────────────────
  const eventMealOptions = useMemo(
    () =>
      paramEventId
        ? mockMealOptions.filter((o) => o.eventId === paramEventId)
        : [],
    [paramEventId]
  );

  // ── 4. Summary counts derived from real fixture data ────────────────────────
  const mealCounts = useMemo(
    () =>
      paramEventId
        ? buildMealOptionCounts(mockGraduatesList, eventMealOptions, paramEventId)
        : [],
    [paramEventId, eventMealOptions]
  );

  const knownTotal = useMemo(() => totalKnownSelections(mealCounts), [mealCounts]);

  // ── 5. Graduate view-models event-scoped ────────────────────────────────────
  const graduateViewModels = useMemo(
    () =>
      paramEventId ? buildGraduateMealViewModels(mockGraduatesList, paramEventId) : [],
    [paramEventId]
  );

  // ── 6. Selected graduate view-model ─────────────────────────────────────────
  const selectedGraduate = selectedGraduateId
    ? graduateViewModels.find((g) => g.graduateId === selectedGraduateId) ?? null
    : null;

  // ── 7. Deadline — EventSettings.meals_deadline not present in fixtures ───────
  //   Do NOT invent a date. isAfterDeadline remains false until real data arrives.
  const isAfterDeadline = false;

  // ── Guard: no event ID in URL ────────────────────────────────────────────────
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Platillos', current: true },
          ]}
        />
        <EmptyState
          icon="meal"
          title="Selecciona un evento"
          description="Para gestionar las opciones de platillo y las selecciones, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Guard: event not found ───────────────────────────────────────────────────
  if (!event) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Evento no encontrado', current: true },
          ]}
        />
        <EmptyState
          icon="alert"
          title="Evento no encontrado"
          description="No encontramos el evento solicitado para gestionar las opciones de platillo."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // ── Guard: no meal options configured for this event ────────────────────────
  if (eventMealOptions.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: event.name, href: `/admin/events/${event.id}` },
            { label: 'Platillos', current: true },
          ]}
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
            Gestión de Platillos
          </h2>
          <p className="text-xs text-content-secondary">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>
        <EmptyState
          icon="meal"
          title="Aún no hay opciones de platillo configuradas"
          description="Este evento no tiene opciones de platillo definidas. Configúralas desde los ajustes del evento."
        />
      </div>
    );
  }

  // ── Happy path ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Platillos', current: true },
        ]}
      />

      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold font-display text-navy-900 tracking-tight">
          Gestión de Platillos
        </h2>
        <p className="text-xs text-content-secondary">
          {event.name} • {event.venue} • {event.date}
        </p>
      </div>

      {/* Main layout — list + optional detail */}
      {selectedGraduate ? (
        // ── Detail view ──────────────────────────────────────────────────────
        <GraduateMealDetail
          graduate={selectedGraduate}
          mealOptions={eventMealOptions}
          isAfterDeadline={isAfterDeadline}
          onClose={() => setSelectedGraduateId(null)}
        />
      ) : (
        // ── List view ────────────────────────────────────────────────────────
        <>
          {/* UX-A-MEAL-001 summary */}
          <MealSummary counts={mealCounts} totalKnown={knownTotal} />

          {/* Graduate table */}
          <GraduateMealsTable
            graduates={graduateViewModels}
            onViewDetail={(graduateId) => setSelectedGraduateId(graduateId)}
          />
        </>
      )}
    </div>
  );
};

// ── Public export — wrapper that passes param and uses `key` to reset state ──

export const AdminEventMealsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventMealsContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
