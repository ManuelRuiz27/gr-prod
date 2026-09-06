import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
} from '../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  VISUAL_QA_GRADUATE_RECORDS,
  VISUAL_QA_SUBMISSIONS_QUEUE,
} from '../../fixtures';
import { ManualPaymentModal } from './payments/ManualPaymentModal';

export interface AdminDashboardScreenProps {
  isLoading?: boolean;
  partialError?: string | null;
  eventsOverride?: typeof mockEvents;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  isLoading = false,
  partialError = null,
  eventsOverride,
}) => {
  const navigate = useNavigate();
  const events = eventsOverride ?? mockEvents;
  const activeEvents = events.filter((event) => event.status === 'OPEN');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Manual payment modal state for "Registrar abono" quick action
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentGradId, setSelectedPaymentGradId] = useState<string | undefined>();
  const [selectedPaymentEventId, setSelectedPaymentEventId] = useState<string>(
    activeEvents[0]?.id || events[0]?.id || ''
  );

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search across mockGraduatesList & VISUAL_QA_GRADUATE_RECORDS
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return mockGraduatesList
      .map((graduate) => {
        const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
        const event = events.find((e) => e.id === graduate.eventId);
        const folio = record?.folio || '—';
        const phone = record?.phone || '—';
        const eventName = event?.name || 'Evento';
        const institution = event?.institution || '';

        return {
          id: graduate.id,
          eventId: graduate.eventId,
          fullName: graduate.fullName,
          folio,
          phone,
          eventName,
          institution,
        };
      })
      .filter((item) => {
        return (
          item.folio.toLowerCase().includes(q) ||
          item.fullName.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.eventName.toLowerCase().includes(q) ||
          item.institution.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [searchQuery, events]);

  // Operational pending items calculated from real fixtures
  const pendingSummary = useMemo(() => {
    const pendingProofs = VISUAL_QA_SUBMISSIONS_QUEUE.filter(
      (s) => s.status === 'PENDING_REVIEW'
    );
    const overdueGraduates = mockGraduatesList.filter((g) => {
      const rec = VISUAL_QA_GRADUATE_RECORDS[g.id];
      return rec?.financialStatus === 'VENCIDO';
    });

    return {
      proofCount: pendingProofs.length,
      overdueCount: overdueGraduates.length,
      primaryEvent: activeEvents[0] || events[0],
    };
  }, [activeEvents, events]);

  const handleOpenManualPayment = (gradId?: string, evId?: string) => {
    if (evId) setSelectedPaymentEventId(evId);
    setSelectedPaymentGradId(gradId);
    setIsPaymentModalOpen(true);
    setIsSearchOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-7 font-sans">
        <div className="flex justify-between border-b border-silver-800 pb-6">
          <Skeleton width={180} height={36} />
          <Skeleton width={132} height={40} />
        </div>
        <div className="space-y-4">
          <Skeleton height={48} />
          <Skeleton height={96} />
          <Skeleton height={140} />
        </div>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Buenas tardes"
          displayFont={false}
          actions={
            <Link to="/admin/events/new">
              <Button variant="primary">Nuevo evento</Button>
            </Link>
          }
        />
        <EmptyState
          title="Aún no hay eventos"
          description="Crea un evento para comenzar la operación."
          actionLabel="Nuevo evento"
          onAction={() => navigate('/admin/events/new')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight">
            Buenas tardes
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            Panel operativo de graduados, cobranza y eventos
          </p>
        </div>
      </header>

      {partialError && (
        <Alert variant="error" title="No pudimos actualizar una parte del resumen">
          {partialError}
        </Alert>
      )}

      {/* Global Search Box (Omnibox) */}
      <div ref={searchContainerRef} className="relative">
        <Input
          id="globalSearchInput"
          placeholder="Buscar graduado, folio o escuela..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => {
            if (searchQuery.trim()) setIsSearchOpen(true);
          }}
          iconStart="search"
          aria-label="Buscar graduado, folio o escuela"
          className="text-sm"
        />

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-obsidian-900 border border-silver-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-silver-800/60">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-silver-400">
                No encontramos graduados, folios ni escuelas para &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 hover:bg-obsidian-800/80 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer group"
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(`/admin/events/${result.eventId}/graduates/${result.id}`);
                  }}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gold-400 font-semibold">{result.folio}</span>
                      <span className="font-bold text-silver-100 group-hover:text-silver-50 truncate">
                        {result.fullName}
                      </span>
                    </div>
                    <span className="text-[11px] text-silver-400 truncate mt-0.5">
                      {result.eventName} {result.institution ? `· ${result.institution}` : ''} · Tel: {result.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="px-2 py-1 text-[11px] font-semibold text-silver-300 hover:text-gold-400 transition-colors"
                      onClick={() => handleOpenManualPayment(result.id, result.eventId)}
                    >
                      Abonar
                    </button>
                    <Link
                      to={`/admin/events/${result.eventId}/graduates/${result.id}`}
                      className="text-gold-400 group-hover:translate-x-0.5 transition-transform"
                    >
                      →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="secondary"
          size="md"
          iconStart="payment"
          fullWidth
          onClick={() => handleOpenManualPayment()}
        >
          Registrar abono
        </Button>

        <Button
          variant="secondary"
          size="md"
          iconStart="check"
          fullWidth
          onClick={() => {
            const targetEventId = pendingSummary.primaryEvent?.id || 'evt-derecho-2027';
            navigate(`/admin/events/${targetEventId}/payments?tab=comprobantes`);
          }}
        >
          Revisar comprobantes
        </Button>

        <Link to="/admin/events/new" className="block w-full">
          <Button variant="primary" size="md" iconStart="plus" fullWidth>
            + Evento
          </Button>
        </Link>
      </div>

      {/* Pendientes Operativos */}
      <section aria-labelledby="pendientes-heading" className="space-y-3">
        <h2 id="pendientes-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Pendientes
        </h2>

        <div className="bg-obsidian-900/60 rounded-xl border border-silver-800/80 divide-y divide-silver-800/60">
          {pendingSummary.proofCount > 0 ? (
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-silver-100 text-sm">
                  {pendingSummary.proofCount} comprobantes por revisar
                </p>
                <p className="text-xs text-silver-400 mt-0.5">
                  {pendingSummary.primaryEvent?.name || 'Evento'}
                </p>
              </div>
              <Link
                to={`/admin/events/${pendingSummary.primaryEvent?.id || 'evt-derecho-2027'}/payments?tab=comprobantes`}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
              >
                Revisar →
              </Link>
            </div>
          ) : null}

          {pendingSummary.overdueCount > 0 ? (
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-silver-100 text-sm">
                  {pendingSummary.overdueCount} contratos con pago vencido
                </p>
                <p className="text-xs text-silver-400 mt-0.5">
                  {pendingSummary.primaryEvent?.name || 'Evento'}
                </p>
              </div>
              <Link
                to={`/admin/events/${pendingSummary.primaryEvent?.id || 'evt-derecho-2027'}/payments?tab=cartera`}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
              >
                Revisar →
              </Link>
            </div>
          ) : null}

          {pendingSummary.proofCount === 0 && pendingSummary.overdueCount === 0 && (
            <div className="p-4 text-xs text-silver-400 text-center">
              No hay pendientes urgentes que requieran atención en este momento.
            </div>
          )}
        </div>
      </section>

      {/* Eventos Activos — Lista Operativa Simple */}
      <section aria-labelledby="events-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="events-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
            Eventos
          </h2>
          <Link
            to="/admin/events"
            className="text-xs text-silver-400 hover:text-silver-200 transition-colors"
          >
            Ver catálogo completo →
          </Link>
        </div>

        <div className="bg-obsidian-900/60 rounded-xl border border-silver-800/80 divide-y divide-silver-800/60">
          {activeEvents.map((event) => (
            <Link
              key={event.id}
              to={`/admin/events/${event.id}`}
              className="p-4 flex items-center justify-between gap-4 hover:bg-obsidian-800/50 transition-colors group"
            >
              <div>
                <h3 className="font-semibold text-silver-100 group-hover:text-silver-50 text-sm">
                  {event.name}
                </h3>
                <p className="text-xs text-silver-400 mt-0.5">
                  {event.institution} · {event.date}
                </p>
              </div>
              <span className="text-gold-400 group-hover:translate-x-1 transition-transform text-sm font-semibold">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Modal de Pago Manual Contextual */}
      {selectedPaymentEventId && (
        <ManualPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPaymentGradId(undefined);
          }}
          eventId={selectedPaymentEventId}
          initialGraduateId={selectedPaymentGradId}
        />
      )}
    </div>
  );
};

