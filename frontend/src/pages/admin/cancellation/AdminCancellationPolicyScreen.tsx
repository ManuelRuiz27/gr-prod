import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  EmptyState,
  Badge,
  Tabs,
} from '../../../design-system';
import { mockEvents } from '../../../fixtures/eventFixtures';
import {
  VISUAL_QA_CANCELLATION_POLICIES,
  type VisualCancellationPolicy,
} from '../../../fixtures/cancellationReportsAuditVisualFixtures';
import { CancellationPolicyEditor } from './CancellationPolicyEditor';

interface AdminCancellationPolicyContentProps {
  paramEventId?: string;
}

export const AdminCancellationPolicyContent: React.FC<AdminCancellationPolicyContentProps> = ({
  paramEventId,
}) => {
  const navigate = useNavigate();

  // 1. Resolve event strictly from URL param
  const event = paramEventId
    ? mockEvents.find((e) => e.id === paramEventId)
    : null;

  // 2. Load policies for event from QA fixtures
  const initialPolicies = useMemo(() => {
    return paramEventId && VISUAL_QA_CANCELLATION_POLICIES[paramEventId]
      ? VISUAL_QA_CANCELLATION_POLICIES[paramEventId]
      : [];
  }, [paramEventId]);

  const [policies, setPolicies] = useState<VisualCancellationPolicy[]>(initialPolicies);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(() => {
    // Default to ACTIVE policy if exists, otherwise first policy
    const active = initialPolicies.find((p) => p.status === 'ACTIVE');
    return active ? active.id : initialPolicies[0]?.id ?? '';
  });

  // Guard: No event ID in URL
  if (!paramEventId) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Configuración', href: '/admin' },
            { label: 'Política de cancelación', current: true },
          ]}
        />
        <EmptyState
          icon="alert"
          title="Selecciona un evento"
          description="Para consultar y configurar la política de cancelación, selecciona un evento desde el catálogo."
          actionLabel="Ver eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Guard: Event not found
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
          description="No encontramos el evento solicitado para consultar su política de cancelación."
          actionLabel="Volver a eventos"
          onAction={() => navigate('/admin/events')}
        />
      </div>
    );
  }

  // Guard: No policies configured for this event
  if (policies.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: event.name, href: `/admin/events/${event.id}` },
            { label: 'Configuración', href: `/admin/events/${event.id}/settings` },
            { label: 'Política de cancelación', current: true },
          ]}
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Política de cancelación
          </h1>
          <p className="text-xs text-silver-400">
            {event.name} • {event.venue} • {event.date}
          </p>
        </div>
        <EmptyState
          icon="alert"
          title="Sin política de cancelación configurada"
          description="Este evento no cuenta con reglas de penalización registradas. Crea un borrador inicial para definir los porcentajes aplicables."
          actionLabel="Crear borrador inicial"
          onAction={() => {
            const initialDraft: VisualCancellationPolicy = {
              id: `pol-draft-${Date.now()}`,
              eventId: event.id,
              version: 1,
              status: 'DRAFT',
              ranges: [
                { id: 'rng-init-1', daysBeforeMin: 0, daysBeforeMax: 30, penaltyPercent: 50, sortOrder: 1 },
                { id: 'rng-init-2', daysBeforeMin: 31, daysBeforeMax: null, penaltyPercent: 10, sortOrder: 2 },
              ],
            };
            setPolicies([initialDraft]);
            setSelectedPolicyId(initialDraft.id);
          }}
        />
      </div>
    );
  }

  const currentPolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  // Tab items for version selector
  const versionTabs = policies.map((p) => ({
    id: p.id,
    label: `Versión ${p.version} — ${
      p.status === 'ACTIVE'
        ? 'Activa'
        : p.status === 'DRAFT'
        ? 'Borrador'
        : 'Archivada'
    }`,
  }));

  const handleCreateNewVersion = () => {
    const maxVersion = policies.reduce((acc, p) => Math.max(acc, p.version), 0);
    const newDraft: VisualCancellationPolicy = {
      id: `pol-draft-v${maxVersion + 1}-${Date.now()}`,
      eventId: event.id,
      version: maxVersion + 1,
      status: 'DRAFT',
      ranges: currentPolicy ? [...currentPolicy.ranges.map((r) => ({ ...r, id: `rng-${Date.now()}-${r.id}` }))] : [],
    };
    setPolicies((prev) => [...prev, newDraft]);
    setSelectedPolicyId(newDraft.id);
  };

  const handlePublishPreview = () => {
    // In visual preview mode, we do NOT fake DB mutation, but provide honest notice
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fadeIn font-sans pb-16">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Plataforma GR', href: '/admin' },
          { label: 'Eventos', href: '/admin/events' },
          { label: event.name, href: `/admin/events/${event.id}` },
          { label: 'Configuración', href: `/admin/events/${event.id}/settings` },
          { label: 'Política de cancelación', current: true },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
              Política de cancelación
            </h1>
            <Badge
              variant={
                currentPolicy.status === 'ACTIVE'
                  ? 'success'
                  : currentPolicy.status === 'DRAFT'
                  ? 'warning'
                  : 'neutral'
              }
              size="sm"
            >
              Versión {currentPolicy.version} (
              {currentPolicy.status === 'ACTIVE'
                ? 'Activa'
                : currentPolicy.status === 'DRAFT'
                ? 'Borrador'
                : 'Archivada'}
              )
            </Badge>
          </div>
          <p className="text-xs text-silver-400">
            {event.name} • {event.venue} • {event.date}
            {currentPolicy.publishedAt && (
              <span> • Publicada el {currentPolicy.publishedAt}</span>
            )}
            {typeof currentPolicy.linkedContractsCount === 'number' && (
              <span> • {currentPolicy.linkedContractsCount} contratos vinculados</span>
            )}
          </p>
        </div>
      </div>

      {/* Version Tabs */}
      <div className="border-b border-silver-800">
        <Tabs
          tabs={versionTabs}
          activeTab={selectedPolicyId}
          onChange={(tabId) => setSelectedPolicyId(tabId)}
        />
      </div>

      {/* Policy Editor / Viewer */}
      <CancellationPolicyEditor
        key={currentPolicy.id}
        policy={currentPolicy}
        onPublishPreview={handlePublishPreview}
        onCreateNewVersion={handleCreateNewVersion}
      />
    </div>
  );
};

export const AdminCancellationPolicyScreen: React.FC = () => {
  const { eventId } = useParams();
  return (
    <AdminCancellationPolicyContent
      key={eventId ?? 'no-event'}
      paramEventId={eventId}
    />
  );
};
