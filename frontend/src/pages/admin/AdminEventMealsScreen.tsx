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
  buildPersonMealViewModels,
  type LocalMealSelectionPreview,
  type PersonMealRowViewModel,
} from './meals/mealViewModel';
import { MealSummary } from './meals/MealSummary';
import { GraduateMealsTable } from './meals/GraduateMealsTable';
import { GraduateMealDetail } from './meals/GraduateMealDetail';
import { EditMealSelectionModal } from './meals/EditMealSelectionModal';

interface AdminEventMealsContentProps {
  paramEventId?: string;
}

const AdminEventMealsContent: React.FC<AdminEventMealsContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  // 1. Event resolution — strictly from URL param, no fallback
  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  // 2. State
  const [selectedGraduateId, setSelectedGraduateId] = useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = useState<LocalMealSelectionPreview[]>([]);
  const [editingPerson, setEditingPerson] = useState<PersonMealRowViewModel | null>(null);

  // 3. Event-scoped meal options
  const eventMealOptions = useMemo(
    () =>
      paramEventId
        ? mockMealOptions.filter((o) => o.eventId === paramEventId)
        : [],
    [paramEventId]
  );

  // 4. Summary counts derived dynamically
  const mealCounts = useMemo(
    () =>
      paramEventId
        ? buildMealOptionCounts(mockGraduatesList, eventMealOptions, paramEventId)
        : [],
    [paramEventId, eventMealOptions]
  );

  const knownTotal = useMemo(() => totalKnownSelections(mealCounts), [mealCounts]);

  // 5. Person-level rows
  const personRows = useMemo(
    () =>
      paramEventId
        ? buildPersonMealViewModels(mockGraduatesList, paramEventId, localPreviews)
        : [],
    [paramEventId, localPreviews]
  );

  // 6. Graduate view-models
  const graduateViewModels = useMemo(
    () =>
      paramEventId ? buildGraduateMealViewModels(mockGraduatesList, paramEventId) : [],
    [paramEventId]
  );

  // 7. Selected graduate view-model for detail
  const selectedGraduate = selectedGraduateId
    ? graduateViewModels.find((g) => g.graduateId === selectedGraduateId) ?? null
    : null;

  const isAfterDeadline = false;

  const handlePreviewSave = (preview: LocalMealSelectionPreview) => {
    setLocalPreviews((prev) => {
      const next = prev.filter((p) => p.guestId !== preview.guestId);
      return [...next, preview];
    });
  };

  // Guard: no event ID in URL
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
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

  // Guard: event not found
  if (!event) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
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

  // Guard: no meal options configured for this event
  if (eventMealOptions.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: event.name, href: `/admin/events/${event.id}` },
            { label: 'Platillos', current: true },
          ]}
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Platillos
          </h1>
          <p className="text-xs text-silver-400">
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

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans pb-16">
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
        <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
          Gestión de Platillos
        </h1>
        <p className="text-xs text-silver-400">
          {event.name} • {event.venue} • {event.date}
        </p>
      </div>

      {/* Main layout: List or Detail */}
      {selectedGraduate ? (
        <GraduateMealDetail
          graduate={selectedGraduate}
          mealOptions={eventMealOptions}
          isAfterDeadline={isAfterDeadline}
          onClose={() => setSelectedGraduateId(null)}
          onPreviewSave={handlePreviewSave}
        />
      ) : (
        <>
          {/* Summary */}
          <MealSummary counts={mealCounts} totalKnown={knownTotal} />

          {/* Table by Person */}
          <GraduateMealsTable
            graduates={graduateViewModels}
            personRows={personRows}
            onViewDetail={(graduateId) => setSelectedGraduateId(graduateId)}
            onModifyPerson={(person) => setEditingPerson(person)}
          />
        </>
      )}

      {/* Edit modal when modifying a specific person from table */}
      {editingPerson && (
        <EditMealSelectionModal
          isOpen={true}
          onClose={() => setEditingPerson(null)}
          graduateId={editingPerson.graduateId}
          graduateName={editingPerson.graduateName}
          knownGuests={[
            {
              id: editingPerson.groupMemberId,
              name: editingPerson.memberName,
              mealName: editingPerson.mealName || '',
            },
          ]}
          mealOptions={eventMealOptions}
          isAfterDeadline={isAfterDeadline}
          onPreviewSave={handlePreviewSave}
          initialGuestId={editingPerson.groupMemberId}
        />
      )}
    </div>
  );
};

export const AdminEventMealsScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventMealsContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
