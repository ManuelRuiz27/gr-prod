import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, EmptyState } from '../../design-system';
import { mockEvents } from '../../fixtures/eventFixtures';
import { mockGraduatesList } from '../../fixtures/graduateFixtures';
import { mockPaymentPlansMap } from '../../fixtures/paymentFixtures';
import {
  buildGraduateThermoViewModels,
  buildThermoStatusCounts,
} from './thermos/thermoViewModel';
import { ThermoSummary } from './thermos/ThermoSummary';
import { ThermoTable } from './thermos/ThermoTable';
import { ThermoDetail } from './thermos/ThermoDetail';

interface AdminEventThermosContentProps {
  paramEventId?: string;
}

const AdminEventThermosContent: React.FC<AdminEventThermosContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  // 1. Event resolution — strictly from URL param, no fallback
  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  // 2. Detail selection state
  const [selectedGraduateId, setSelectedGraduateId] = useState<string | null>(null);

  // 3. Local previews state (non-persisted transitions)
  const [localPreviews, setLocalPreviews] = useState<
    Record<string, 'IN_PRODUCTION' | 'DELIVERED'>
  >({});

  const handleTransitionPreview = (
    graduateId: string,
    action: 'START_PRODUCTION' | 'MARK_DELIVERED'
  ) => {
    setLocalPreviews((prev) => ({
      ...prev,
      [graduateId]: action === 'START_PRODUCTION' ? 'IN_PRODUCTION' : 'DELIVERED',
    }));
  };

  // 4. View models event-scoped
  const graduateViewModels = useMemo(() => {
    return paramEventId
      ? buildGraduateThermoViewModels(
          mockGraduatesList,
          mockPaymentPlansMap,
          paramEventId,
          localPreviews
        )
      : [];
  }, [paramEventId, localPreviews]);

  // 5. KPI counts derived dynamically
  const thermoCounts = useMemo(
    () => buildThermoStatusCounts(graduateViewModels),
    [graduateViewModels]
  );

  // 6. Selected graduate view model
  const selectedGraduate = selectedGraduateId
    ? graduateViewModels.find((g) => g.graduateId === selectedGraduateId) ?? null
    : null;

  // Guard: no event ID in URL
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Termos', current: true },
          ]}
        />
        <EmptyState
          icon="cup"
          title="Selecciona un evento"
          description="Para gestionar los termos conmemorativos, selecciona un evento desde el catálogo."
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
          description="No encontramos el evento solicitado para gestionar los termos conmemorativos."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Guard: no graduates / thermos associated to this event
  if (graduateViewModels.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: event.name, href: `/admin/events/${event.id}` },
            { label: 'Termos', current: true },
          ]}
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Termos
          </h1>
          <p className="text-xs text-silver-400">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>
        <EmptyState
          icon="cup"
          title="Aún no hay termos asociados a este evento"
          description="Este evento no tiene graduados registrados para gestión de termos."
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
          { label: 'Termos', current: true },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
          Control de Termos Conmemorativos
        </h1>
        <p className="text-xs text-silver-400">
          {event.name} • Control y seguimiento de producción conmemorativa
        </p>
      </div>

      {/* Main layout: Detail view or List view */}
      {selectedGraduate ? (
        <ThermoDetail
          graduate={selectedGraduate}
          onClose={() => setSelectedGraduateId(null)}
          onTransitionPreview={handleTransitionPreview}
        />
      ) : (
        <>
          <ThermoSummary counts={thermoCounts} />
          <ThermoTable
            graduates={graduateViewModels}
            onViewDetail={(graduateId) => setSelectedGraduateId(graduateId)}
          />
        </>
      )}
    </div>
  );
};

export const AdminEventThermosScreen: React.FC = () => {
  const { eventId: paramEventId } = useParams();
  return (
    <AdminEventThermosContent
      key={paramEventId ?? 'no-event'}
      paramEventId={paramEventId}
    />
  );
};
