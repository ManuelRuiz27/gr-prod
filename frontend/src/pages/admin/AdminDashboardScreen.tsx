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
  const [isPaymentIntent, setIsPaymentIntent] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Manual payment modal state for "Registrar abono" quick action
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentGradId, setSelectedPaymentGradId] = useState<string | undefined>();
  const [selectedPaymentEventId, setSelectedPaymentEventId] = useState<string | null>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setIsPaymentIntent(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search across mockGraduatesList & VISUAL_QA_GRADUATE_RECORDS
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      if (isPaymentIntent) {
        return mockGraduatesList.slice(0, 8).map((graduate) => {
          const record = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
          const event = events.find((e) => e.id === graduate.eventId);
          return {
            id: graduate.id,
            eventId: graduate.eventId,
            fullName: graduate.fullName,
            folio: record?.folio || '—',
            phone: record?.phone || '—',
            eventName: event?.name || 'Evento',
            institution: event?.institution || '',
          };
        });
      }
      return [];
    }

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
  }, [searchQuery, events, isPaymentIntent]);

  // Pending proofs grouped strictly per event
  const eventsWithPendingProofs = useMemo(() => {
    const map = new Map<string, number>();
    VISUAL_QA_SUBMISSIONS_QUEUE.forEach((s) => {
      if (s.status === 'PENDING_REVIEW') {
        map.set(s.eventId, (map.get(s.eventId) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([eventId, count]) => ({
        eventId,
        count,
      }))
      .filter((item) => events.some((e) => e.id === item.eventId));
  }, [events]);

  // Operational pending items grouped strictly by eventId
  const pendingByEvent = useMemo(() => {
    type EventPendingData = {
      eventId: string;
      eventName: string;
      proofCount: number;
      overdueCount: number;
    };
    const map = new Map<string, EventPendingData>();

    VISUAL_QA_SUBMISSIONS_QUEUE.forEach((s) => {
      if (s.status === 'PENDING_REVIEW') {
        const ev = events.find((e) => e.id === s.eventId);
        if (ev) {
          const current = map.get(s.eventId) || {
            eventId: s.eventId,
            eventName: ev.name,
            proofCount: 0,
            overdueCount: 0,
          };
          current.proofCount += 1;
          map.set(s.eventId, current);
        }
      }
    });

    mockGraduatesList.forEach((g) => {
      const rec = VISUAL_QA_GRADUATE_RECORDS[g.id];
      if (rec?.financialStatus === 'VENCIDO') {
        const ev = events.find((e) => e.id === g.eventId);
        if (ev) {
          const current = map.get(g.eventId) || {
            eventId: g.eventId,
            eventName: ev.name,
            proofCount: 0,
            overdueCount: 0,
          };
          current.overdueCount += 1;
          map.set(g.eventId, current);
        }
      }
    });

    return Array.from(map.values());
  }, [events]);

  const handleOpenManualPayment = (gradId: string, evId: string) => {
    setSelectedPaymentEventId(evId);
    setSelectedPaymentGradId(gradId);
    setIsPaymentModalOpen(true);
    setIsSearchOpen(false);
    setIsPaymentIntent(false);
  };

  const handleSelectSearchResult = (result: { id: string; eventId: string }) => {
    if (isPaymentIntent) {
      handleOpenManualPayment(result.id, result.eventId);
    } else {
      setIsSearchOpen(false);
      navigate(`/admin/events/${result.eventId}/graduates/${result.id}`);
    }
  };

  const handleQuickRegisterPayment = () => {
    setIsPaymentIntent(true);
    setIsSearchOpen(true);
    const inputEl = document.getElementById('globalSearchInput') as HTMLInputElement | null;
    if (inputEl) {
      inputEl.focus();
    }
  };

  const handleQuickReviewProofs = () => {
    if (eventsWithPendingProofs.length === 1) {
      navigate(`/admin/events/${eventsWithPendingProofs[0].eventId}/payments?tab=comprobantes`);
    } else {
      const el = document.getElementById('pendientes-heading');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
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
          placeholder={
            isPaymentIntent
              ? 'Selecciona un graduado para registrar abono...'
              : 'Buscar graduado, folio o escuela...'
          }
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => {
            if (searchQuery.trim() || isPaymentIntent) setIsSearchOpen(true);
          }}
          iconStart={isPaymentIntent ? 'payment' : 'search'}
          aria-label="Buscar graduado, folio o escuela"
          className="text-sm"
        />

        {/* Search Results Dropdown */}
        {isSearchOpen && (searchQuery.trim().length > 0 || isPaymentIntent) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-obsidian-900 border border-silver-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto divide-y divide-silver-800/60">
            {isPaymentIntent && (
              <div className="p-2.5 bg-gold-400/10 border-b border-gold-400/20 text-xs text-gold-400 flex items-center justify-between">
                <span>Selecciona el graduado para registrar el abono:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentIntent(false);
                    setIsSearchOpen(false);
                  }}
                  className="text-silver-400 hover:text-silver-200 text-[11px]"
                >
                  Cancelar
                </button>
              </div>
            )}
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-silver-400">
                No encontramos graduados, folios ni escuelas para &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-3 hover:bg-obsidian-800/80 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer group"
                  onClick={() => handleSelectSearchResult(result)}
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
          variant={isPaymentIntent ? 'primary' : 'secondary'}
          size="md"
          iconStart="payment"
          fullWidth
          onClick={handleQuickRegisterPayment}
        >
          Registrar abono
        </Button>

        <Button
          variant="secondary"
          size="md"
          iconStart="check"
          fullWidth
          onClick={handleQuickReviewProofs}
        >
          Revisar comprobantes
        </Button>

        <Link to="/admin/events/new" className="block w-full">
          <Button variant="primary" size="md" iconStart="plus" fullWidth>
            + Evento
          </Button>
        </Link>
      </div>

      {/* Pendientes Operativos Agrupados por Evento */}
      <section aria-labelledby="pendientes-heading" className="space-y-3">
        <h2 id="pendientes-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Pendientes
        </h2>

        <div className="bg-obsidian-900/60 rounded-xl border border-silver-800/80 divide-y divide-silver-800/60">
          {pendingByEvent.length === 0 ? (
            <div className="p-4 text-xs text-silver-400 text-center">
              No hay pendientes urgentes que requieran atención en este momento.
            </div>
          ) : (
            pendingByEvent.map((item) => (
              <div key={item.eventId} className="p-4 space-y-3">
                <p className="font-bold text-silver-100 text-sm">
                  {item.eventName}
                </p>

                <div className="space-y-2 pl-1">
                  {item.proofCount > 0 && (
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-silver-300">
                        {item.proofCount} comprobante{item.proofCount > 1 ? 's' : ''} por revisar
                      </span>
                      <Link
                        to={`/admin/events/${item.eventId}/payments?tab=comprobantes`}
                        className="font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
                      >
                        Revisar →
                      </Link>
                    </div>
                  )}

                  {item.overdueCount > 0 && (
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-silver-300">
                        {item.overdueCount} contrato{item.overdueCount > 1 ? 's' : ''} con pago vencido
                      </span>
                      <Link
                        to={`/admin/events/${item.eventId}/payments?tab=cartera&filter=overdue`}
                        className="font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
                      >
                        Revisar →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))
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

