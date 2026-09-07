import React, { useState } from 'react';
import { Badge, Button } from '../../../design-system';
import type { GraduateThermoViewModel } from './thermoViewModel';
import {
  getThermoStatusLabel,
  getThermoBadgeVariant,
  canStartProduction,
  canMarkDelivered,
} from './thermoViewModel';
import { ThermoTransitionModal } from './ThermoTransitionModal';

export interface ThermoDetailProps {
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
      <div className="flex flex-col gap-6 animate-fadeIn font-sans pb-16" data-testid="thermo-detail">
        {/* Navigation */}
        <div>
          <button
            onClick={onClose}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-silver-400 hover:text-silver-100 transition-colors mb-3 cursor-pointer"
            aria-label="Volver al listado"
          >
            ← Volver al listado
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-display text-silver-50">
                Termo de {graduate.fullName}
              </h2>
              <span className="font-mono text-xs font-bold text-gold-400 bg-obsidian-900 px-2 py-0.5 rounded border border-gold-500/30">
                {graduate.contractFolio}
              </span>
            </div>
            <div>
              <Badge variant={badgeVariant} size="md">
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        {/* Detail Card: Shows strictly Folio, Nombre, Mesa, Personalización, Estado actual, Acción válida siguiente */}
        <div className="p-6 bg-obsidian-850 border border-silver-800/80 rounded-xl flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-b border-silver-800/60 pb-6">
            {/* 1. Folio */}
            <div>
              <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                Folio
              </span>
              <span className="font-mono text-base font-bold text-gold-400">
                {graduate.contractFolio}
              </span>
            </div>

            {/* 2. Nombre */}
            <div>
              <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                Nombre
              </span>
              <span className="text-base font-bold text-silver-100">
                {graduate.fullName}
              </span>
            </div>

            {/* 3. Mesa */}
            <div>
              <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                Mesa
              </span>
              <span className="text-base font-medium text-silver-200">
                {graduate.tableSummary}
              </span>
            </div>

            {/* 4. Estado actual */}
            <div>
              <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block mb-1">
                Estado actual
              </span>
              <div>
                <Badge variant={badgeVariant} size="sm">
                  {statusLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* 5. Personalización */}
          <div className="border-b border-silver-800/60 pb-6">
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block mb-2">
              Personalización
            </span>
            {graduate.customName ? (
              <div className="p-3 bg-obsidian-900 rounded-lg border border-silver-800 inline-block">
                <span className="text-base font-bold text-gold-400 font-display tracking-wide">
                  "{graduate.customName}"
                </span>
              </div>
            ) : (
              <p className="text-xs text-silver-400 italic">
                Sin personalización registrada
              </p>
            )}
          </div>

          {/* 6. Acción válida siguiente */}
          <div>
            <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block mb-2">
              Acción válida siguiente
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-obsidian-900/80 rounded-lg border border-silver-800/60">
              <p className="text-xs text-silver-300">
                {isStartProductionAllowed &&
                  'La solicitud fue realizada por el graduado. Inicia el proceso de producción.'}
                {isMarkDeliveredAllowed &&
                  'El termo se encuentra en producción. Confirma la entrega física al graduado.'}
                {!isStartProductionAllowed &&
                  !isMarkDeliveredAllowed &&
                  graduate.thermoStatus === 'LOCKED' &&
                  'El termo se encuentra bloqueado por elegibilidad financiera. El desbloqueo es automático al cubrir pagos.'}
                {!isStartProductionAllowed &&
                  !isMarkDeliveredAllowed &&
                  graduate.thermoStatus === 'AVAILABLE' &&
                  'El termo está disponible para solicitar. El graduado debe completar su solicitud desde el portal.'}
                {!isStartProductionAllowed &&
                  !isMarkDeliveredAllowed &&
                  graduate.thermoStatus === 'DELIVERED' &&
                  'El termo ya ha sido entregado al graduado. Ciclo completado.'}
              </p>

              <div className="flex items-center gap-2 shrink-0">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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
