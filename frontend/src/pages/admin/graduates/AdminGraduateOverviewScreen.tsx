import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Badge,
  EmptyState,
  Button,
  Modal,
  Input,
  Select,
  Alert,
  Icon,
} from '../../../design-system';
import {
  mockEvents,
  mockGraduatesList,
  mockPaymentPlansMap,
  VISUAL_QA_GRADUATE_RECORDS,
  type GraduateGroupMemberMock,
} from '../../../fixtures';
import { getThermoStatusPresentation } from '../../../lib/thermoStatusPresentation';
import { CancelMembershipModal } from '../cancellation/CancelMembershipModal';
import { ManualPaymentModal } from '../payments/ManualPaymentModal';

export const AdminGraduateOverviewScreen: React.FC = () => {
  const { eventId, graduateId } = useParams();
  const navigate = useNavigate();

  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Meal Override Modal State
  const [isMealOverrideModalOpen, setIsMealOverrideModalOpen] = useState(false);
  const [overrideMember, setOverrideMember] = useState<GraduateGroupMemberMock | null>(null);
  const [overrideMeal, setOverrideMeal] = useState('Tradicional');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideFeedback, setOverrideFeedback] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const event = mockEvents.find((item) => item.id === eventId);
  const graduate = mockGraduatesList.find(
    (item) => item.id === graduateId && item.eventId === eventId
  );

  if (!event || !graduate) {
    return (
      <div className="flex flex-col gap-6 font-sans animate-fadeIn">
        <EmptyState
          icon="search"
          title="Graduado no encontrado"
          description="No encontramos este graduado dentro del evento."
          actionLabel="Volver a graduados"
          onAction={() => navigate(`/admin/events/${eventId || ''}/graduates`)}
        />
      </div>
    );
  }

  const visualRecord = VISUAL_QA_GRADUATE_RECORDS[graduate.id];
  const folio = visualRecord?.folio || '—';
  const phone = visualRecord?.phone || '—';
  const plan = mockPaymentPlansMap[graduate.id];

  // Financial figures
  const totalAmountStr = visualRecord?.totalAmount || (plan ? `$${plan.totalAmount.toLocaleString('es-MX')}` : '—');
  const paidAmountStr = visualRecord?.paidAmount || (plan ? `$${plan.paidAmount.toLocaleString('es-MX')}` : '—');
  const balanceAmountStr = visualRecord?.balanceAmount || (plan ? `$${plan.pendingAmount.toLocaleString('es-MX')}` : '—');

  const nextInstallment = plan?.installments.find((i) => i.status !== 'PAID');

  const thermoPresentation = getThermoStatusPresentation(graduate.thermoStatus);
  const visualGuests = visualRecord?.guests || [];
  const groupMembers: GraduateGroupMemberMock[] =
    visualGuests.length > 0
      ? visualGuests
      : (graduate.guests || []).map((g) => ({
          id: g.id,
          name: g.name,
          meal: g.meal,
          tableNumber: graduate.tableNumber,
          productType: 'Adulto',
          status: 'Confirmado',
        }));

  // Meals summary
  const mealSummary = (() => {
    let vegCount = 0;
    let normalCount = 0;
    let pendingCount = 0;

    groupMembers.forEach((g) => {
      if (!g.meal) {
        pendingCount++;
      } else if (
        g.meal.toLowerCase().includes('vegetariano') ||
        g.meal.toLowerCase().includes('vegano')
      ) {
        vegCount++;
      } else {
        normalCount++;
      }
    });

    const parts: string[] = [];
    if (vegCount > 0) parts.push(`${vegCount} vegetariano${vegCount > 1 ? 's' : ''}`);
    if (normalCount > 0) parts.push(`${normalCount} normal${normalCount > 1 ? 'es' : ''}`);
    if (parts.length === 0 && groupMembers.length > 0) parts.push(`${groupMembers.length} seleccionados`);

    return {
      selectedText: parts.join(' · ') || 'Sin selección',
      pendingCount,
    };
  })();

  const allAuditLogs = visualRecord?.auditLogs || [];

  return (
    <article className="max-w-3xl mx-auto font-sans space-y-8 pb-16 animate-fadeIn">
      {/* Back Link */}
      <div>
        <Link
          to={`/admin/events/${event.id}/graduates`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-silver-400 hover:text-silver-200 transition-colors"
        >
          <Icon name="chevron-left" size={14} />
          <span>Volver a graduados</span>
        </Link>
      </div>

      {cancelFeedback && (
        <Alert variant="info" onDismiss={() => setCancelFeedback('')}>
          {cancelFeedback}
        </Alert>
      )}

      {overrideFeedback && (
        <Alert variant="success" onDismiss={() => setOverrideFeedback('')}>
          {overrideFeedback}
        </Alert>
      )}

      {/* Header: Identity, Folio, Direct Actions */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-silver-800/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-silver-50 tracking-tight font-display">
            {graduate.fullName}
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            Folio {folio} · {phone}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            iconStart="payment"
            onClick={() => setIsManualPaymentOpen(true)}
          >
            Registrar abono
          </Button>

          {/* Menú de Acciones ··· */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-silver-400 hover:text-silver-100 hover:bg-obsidian-800 border border-silver-800 transition-colors"
              aria-label="Más acciones del graduado"
              aria-expanded={isActionsMenuOpen}
            >
              <Icon name="more" size={16} />
            </button>

            {isActionsMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-obsidian-900 border border-silver-800 rounded-xl shadow-xl z-50 py-1 divide-y divide-silver-800/60">
                <div className="py-1">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs text-silver-200 hover:text-silver-50 hover:bg-obsidian-800 transition-colors"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      navigate(`/admin/events/${event.id}/tables`);
                    }}
                  >
                    Cambiar mesa
                  </button>

                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs text-silver-200 hover:text-silver-50 hover:bg-obsidian-800 transition-colors"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      const firstMember = visualRecord?.guests?.[0] || null;
                      setOverrideMember(firstMember);
                      setIsMealOverrideModalOpen(true);
                    }}
                  >
                    Modificar platillo
                  </button>

                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs text-silver-200 hover:text-silver-50 hover:bg-obsidian-800 transition-colors"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      setShowHistory(!showHistory);
                    }}
                  >
                    {showHistory ? 'Ocultar historial' : 'Ver historial'}
                  </button>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs text-status-error hover:bg-status-error/10 transition-colors font-medium"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      setIsCancelModalOpen(true);
                    }}
                  >
                    Cancelar contrato
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 1. Finanzas: Bloque conciso y directo */}
      <section aria-labelledby="finanzas-heading" className="space-y-1.5">
        <h2 id="finanzas-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Finanzas
        </h2>
        <div className="text-sm text-silver-200 space-y-0.5">
          <p className="font-semibold text-silver-100">
            {paidAmountStr} abonados de {totalAmountStr}
          </p>
          <p className="text-silver-300">
            Restan <span className="font-bold text-silver-50">{balanceAmountStr}</span>
          </p>
          {nextInstallment && (
            <p className="text-xs text-silver-400 pt-0.5">
              Próximo mínimo: ${nextInstallment.amount.toLocaleString('es-MX')} · {nextInstallment.dueDate}
            </p>
          )}
        </div>
      </section>

      {/* 2. Grupo: Lista simple de integrantes y mesas */}
      <section aria-labelledby="grupo-heading" className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="grupo-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
            Grupo
          </h2>
          <span className="text-xs text-silver-400">
            {graduate.ticketCount} lugares
          </span>
        </div>

        <div className="bg-obsidian-900/60 rounded-xl border border-silver-800/80 divide-y divide-silver-800/60">
          {groupMembers.length === 0 ? (
            <p className="p-3 text-xs text-silver-400 italic">
              Sin acompañantes registrados.
            </p>
          ) : (
            groupMembers.map((member, idx) => {
              const isChild =
                member.productType?.toLowerCase().includes('infantil') ||
                member.productType?.toLowerCase().includes('niño');

              return (
                <div
                  key={member.id || idx}
                  className="p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-silver-100">
                      {member.name}
                    </span>
                    {isChild && (
                      <Badge variant="neutral" size="sm">
                        Niño
                      </Badge>
                    )}
                  </div>

                  <span className="text-silver-300 font-medium">
                    {member.tableNumber !== null && member.tableNumber !== undefined
                      ? `Mesa ${member.tableNumber}`
                      : graduate.tableNumber !== null
                      ? `Mesa ${graduate.tableNumber}`
                      : 'Sin mesa'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 3. Platillos: Resumen operativo */}
      <section aria-labelledby="platillos-heading" className="space-y-1.5">
        <h2 id="platillos-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Platillos
        </h2>
        <div className="text-xs text-silver-300 space-y-0.5">
          <p>{mealSummary.selectedText}</p>
          {mealSummary.pendingCount > 0 && (
            <p className="text-status-warning font-semibold">
              {mealSummary.pendingCount} pendiente{mealSummary.pendingCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* 4. Termo conmemorativo */}
      <section aria-labelledby="termo-heading" className="space-y-1.5">
        <h2 id="termo-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Termo
        </h2>
        <div className="text-xs text-silver-300">
          <span className="font-medium text-silver-100">
            {thermoPresentation.label}
          </span>
        </div>
      </section>

      {/* 5. Contrato digital */}
      <section aria-labelledby="contrato-heading" className="space-y-1.5">
        <h2 id="contrato-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
          Contrato
        </h2>
        <div className="flex items-center justify-between text-xs">
          <span className="text-silver-300">
            {visualRecord?.contractStatus === 'ACCEPTED' ? 'Aceptado' : 'Pendiente de aceptación'}
          </span>
          <Link
            to="/graduate/contract"
            className="text-gold-400 hover:text-gold-300 font-semibold"
          >
            Ver contrato →
          </Link>
        </div>
      </section>

      {/* 6. Historial de Auditoría (Accesible vía menú ···) */}
      {showHistory && (
        <section aria-labelledby="historial-heading" className="space-y-3 pt-4 border-t border-silver-800/60 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 id="historial-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
              Historial y Auditoría
            </h2>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-xs text-silver-400 hover:text-silver-200"
            >
              Cerrar
            </button>
          </div>

          <div className="bg-obsidian-900/60 rounded-xl border border-silver-800/80 divide-y divide-silver-800/60 max-h-60 overflow-y-auto">
            {allAuditLogs.length === 0 ? (
              <p className="p-3 text-xs text-silver-400 italic">
                No hay registros de auditoría para este expediente.
              </p>
            ) : (
              allAuditLogs.map((log) => (
                <div key={log.id} className="p-3 text-xs space-y-0.5">
                  <div className="flex justify-between text-silver-400 text-[11px]">
                    <span>{log.actor}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="font-semibold text-silver-100">{log.action}</p>
                  {log.reason && (
                    <p className="text-silver-400 italic">Motivo: {log.reason}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Modales Reales Integrados */}
      {/* 1. Modal Registrar Abono Contextual */}
      <ManualPaymentModal
        isOpen={isManualPaymentOpen}
        onClose={() => setIsManualPaymentOpen(false)}
        eventId={event.id}
        initialGraduateId={graduate.id}
      />

      {/* 2. Modal Cancelar Membresía */}
      <CancelMembershipModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        graduateId={graduate.id}
        graduateName={graduate.fullName}
        contractFolio={visualRecord?.contractFolio || '—'}
        eventName={event.name}
        onConfirmSuccess={(feedback) => {
          setIsCancelModalOpen(false);
          setCancelFeedback(feedback);
        }}
      />

      {/* 3. Modal Modificar Platillo */}
      {overrideMember && (
        <Modal
          isOpen={isMealOverrideModalOpen}
          onClose={() => setIsMealOverrideModalOpen(false)}
          title={`Modificar platillo: ${overrideMember.name}`}
          description="Override administrativo de platillo con registro de motivo."
        >
          <div className="space-y-4 text-xs font-sans">
            <Select
              id="overrideMealSelect"
              label="Nueva opción de menú"
              value={overrideMeal}
              onChange={(e) => setOverrideMeal(e.target.value)}
              options={[
                { label: 'Menú Tradicional', value: 'Tradicional' },
                { label: 'Menú Vegano', value: 'Vegano' },
                { label: 'Menú Vegetariano', value: 'Vegetariano' },
                { label: 'Menú Infantil', value: 'Infantil' },
              ]}
            />

            <Input
              id="overrideReasonInput"
              label="Motivo del cambio administrativo"
              placeholder="Ej. Solicitud por alergia alimentaria notificada por graduado"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-silver-800/80">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsMealOverrideModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                disabled={!overrideReason.trim()}
                onClick={() => {
                  if (!overrideReason.trim()) return;
                  setIsMealOverrideModalOpen(false);
                  setOverrideFeedback('El cambio de menú administrativo fue registrado con motivo.');
                }}
              >
                Guardar cambio
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </article>
  );
};

