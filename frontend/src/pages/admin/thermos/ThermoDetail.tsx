import React, { useState } from 'react';
import { Badge, Button, Alert, Icon } from '../../../design-system';
import type { GraduateThermoViewModel } from './thermoViewModel';
import {
  getThermoStatusLabel,
  getThermoBadgeVariant,
  canStartProduction,
  canMarkDelivered,
} from './thermoViewModel';
import { ThermoTimeline } from './ThermoTimeline';
import { ThermoTransitionModal } from './ThermoTransitionModal';

interface ThermoDetailProps {
  graduate: GraduateThermoViewModel;
  onClose: () => void;
  onTransitionPreview: (graduateId: string, action: 'START_PRODUCTION' | 'MARK_DELIVERED') => void;
}

export const ThermoDetail: React.FC<ThermoDetailProps> = ({
  graduate,
  onClose,
  onTransitionPreview,
}) => {
  const [modalAction, setModalAction] = useState<'START_PRODUCTION' | 'MARK_DELIVERED' | null>(null);

  const statusLabel = getThermoStatusLabel(graduate.thermoStatus);
  const badgeVariant = getThermoBadgeVariant(graduate.thermoStatus);

  const isStartProductionAllowed = canStartProduction(graduate);
  const isMarkDeliveredAllowed = canMarkDelivered(graduate);

  return (
    <>
      <div className="flex flex-col gap-6 animate-fadeIn font-sans" data-testid="thermo-detail">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-silver-400 hover:text-silver-100 transition-colors mb-3"
            aria-label="Volver al listado"
          >
            ← Volver al listado
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-xl font-bold font-display text-silver-50">
                  Termo de {graduate.fullName}
                </h3>
                <Badge variant="gold" size="sm">
                  {graduate.contractFolio}
                </Badge>
              </div>
              {graduate.career && (
                <p className="text-xs text-silver-400 mt-0.5">
                  {graduate.career} • {graduate.tableSummary}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={badgeVariant} size="md">
                {statusLabel}
              </Badge>
              {graduate.hasLocalPreview && (
                <span className="text-[10px] text-status-warning font-semibold bg-obsidian-900 px-2 py-0.5 rounded border border-status-warning/40">
                  vista previa
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Local Preview Notice */}
        {graduate.hasLocalPreview && (
          <Alert variant="info" title="Vista previa local — No guardado">
            Los cambios reflejan modificaciones locales no persistidas. Se revertirán al cambiar de evento o recargar.
          </Alert>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Avance Financiero */}
          <div className="p-5 bg-obsidian-850 border border-silver-800/80 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
                  Avance financiero
                </span>
                <div className="w-7 h-7 rounded-full bg-obsidian-800 text-silver-300 flex items-center justify-center">
                  <Icon name="payment" size={14} />
                </div>
              </div>

              {graduate.progressPercentage !== null ? (
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-extrabold text-silver-50 font-sans">
                      {graduate.progressPercentage}%
                    </span>
                    <span className="text-xs text-silver-400">pagado</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-obsidian-900 rounded-full overflow-hidden mt-3 border border-silver-800">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(graduate.progressPercentage, 100)}%` }}
                    />
                  </div>
                  {graduate.paidAmount !== null && graduate.totalAmount !== null && (
                    <p className="text-[11px] text-silver-400 mt-2 font-sans">
                      ${graduate.paidAmount.toLocaleString()} de ${graduate.totalAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-silver-500 mb-1">—</div>
                  <p className="text-xs text-silver-300 font-medium">
                    Sin dato financiero disponible
                  </p>
                  <p className="text-[11px] text-silver-400 mt-1">
                    No hay plan financiero asociado a este graduado en este evento.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Umbral del Evento */}
          <div className="p-5 bg-obsidian-850 border border-silver-800/80 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
                  Umbral del evento
                </span>
                <div className="w-7 h-7 rounded-full bg-obsidian-800 text-silver-300 flex items-center justify-center">
                  <Icon name="settings" size={14} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-silver-500 mb-1">—</div>
                <p className="text-xs text-silver-300 font-medium">
                  Configuración no disponible
                </p>
                <p className="text-[11px] text-silver-400 mt-1">
                  El porcentaje de desbloqueo se define en los ajustes del evento.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Personalización Conocida */}
          <div className="p-5 bg-obsidian-850 border border-silver-800/80 rounded-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider">
                  Personalización conocida
                </span>
                <div className="w-7 h-7 rounded-full bg-obsidian-800 text-silver-300 flex items-center justify-center">
                  <Icon name="edit" size={14} />
                </div>
              </div>

              {graduate.customName ? (
                <div>
                  <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800 text-center mb-2">
                    <span className="text-base font-bold text-gold-400 tracking-wide font-display">
                      "{graduate.customName}"
                    </span>
                  </div>
                  <p className="text-[11px] text-silver-400">
                    Texto de personalización registrado.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-silver-500 mb-1">—</div>
                  <p className="text-xs text-silver-300 font-medium">
                    Sin personalización registrada
                  </p>
                  <p className="text-[11px] text-silver-400 mt-1">
                    No se ha registrado texto para personalización.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="p-5 bg-obsidian-850 border border-silver-800/80 rounded-lg">
          <h4 className="text-sm font-bold text-silver-100 mb-4">
            Línea de tiempo de producción
          </h4>
          <ThermoTimeline status={graduate.thermoStatus} />
        </div>

        {/* Admin Operative Actions */}
        <div className="p-5 bg-obsidian-850 border border-silver-800/80 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-silver-100">
                Gestión operativa del termo
              </h4>
              <p className="text-xs text-silver-400 mt-0.5">
                {isStartProductionAllowed &&
                  'La solicitud fue realizada por el graduado. Inicia el proceso de producción.'}
                {isMarkDeliveredAllowed &&
                  'El termo se encuentra en producción. Confirma la entrega física al graduado.'}
                {graduate.hasLocalPreview &&
                  'Existe una transición local en vista previa. No es posible realizar nuevas transiciones hasta persistir en servidor.'}
                {!isStartProductionAllowed &&
                  !isMarkDeliveredAllowed &&
                  !graduate.hasLocalPreview &&
                  graduate.baseStatus === 'LOCKED' &&
                  'El termo se encuentra bloqueado por elegibilidad financiera. El desbloqueo es automático.'}
                {!isStartProductionAllowed &&
                  !isMarkDeliveredAllowed &&
                  !graduate.hasLocalPreview &&
                  graduate.baseStatus === 'AVAILABLE' &&
                  'El termo está disponible para solicitar. El graduado debe completar su solicitud desde el portal.'}
                {!isStartProductionAllowed &&
                  !isMarkDeliveredAllowed &&
                  !graduate.hasLocalPreview &&
                  graduate.baseStatus === 'DELIVERED' &&
                  'El termo ya ha sido entregado al graduado. Ciclo operativo completado.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isStartProductionAllowed && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModalAction('START_PRODUCTION')}
                >
                  Marcar en producción
                </Button>
              )}

              {isMarkDeliveredAllowed && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModalAction('MARK_DELIVERED')}
                >
                  Marcar como entregado
                </Button>
              )}

              {graduate.hasLocalPreview && (
                <Badge variant="warning" size="sm">
                  Cambio pendiente de backend
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Audit History */}
        <div className="p-5 bg-obsidian-850 border border-silver-800/80 rounded-lg">
          <h4 className="text-sm font-bold text-silver-100 mb-2">
            Historial de cambios
          </h4>
          <p className="text-xs text-silver-400">
            No hay historial disponible. El registro de auditoría estará disponible cuando la integración con el backend esté activa.
          </p>
        </div>
      </div>

      {/* Transition Confirmation Modal */}
      {modalAction && (
        <ThermoTransitionModal
          isOpen={Boolean(modalAction)}
          onClose={() => setModalAction(null)}
          graduateName={graduate.fullName}
          action={modalAction}
          onConfirm={() => {
            onTransitionPreview(graduate.graduateId, modalAction);
          }}
        />
      )}
    </>
  );
};
