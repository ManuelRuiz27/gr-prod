import React from 'react';
import { Card, Button, Badge } from '../../../design-system';
import type { CreateEventDraft, CreateEventStep } from './createEventDraft';

interface ReviewStepProps {
  draft: CreateEventDraft;
  onEditStep: (step: CreateEventStep) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  draft,
  onEditStep,
}) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-navy-900">Resumen y confirmación</h2>
          <p className="text-xs text-content-secondary">
            Revisa los detalles configurados antes de crear el evento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Información */}
          <div className="p-5 bg-surface-low rounded-2xl border border-surface-high space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Información</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-semibold text-gold-600 hover:text-gold-700"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-content-secondary">Nombre:</span>
                <span className="font-semibold text-content-primary text-right max-w-[200px] truncate">{draft.name || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Fecha:</span>
                <span className="font-semibold text-content-primary">{draft.eventDate || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Lugar:</span>
                <span className="font-semibold text-content-primary text-right max-w-[200px] truncate">{draft.venue || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Capacidad:</span>
                <span className="font-semibold text-content-primary">{draft.capacity || '0'} personas</span>
              </div>
            </div>
          </div>

          {/* 2. Plan financiero */}
          <div className="p-5 bg-surface-low rounded-2xl border border-surface-high space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Plan financiero</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-semibold text-gold-600 hover:text-gold-700"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-content-secondary">Precio total base:</span>
                <span className="font-semibold text-content-primary">${draft.baseAmount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Pago inicial requerido:</span>
                <Badge variant={draft.initialPaymentRequired ? 'success' : 'neutral'} size="sm">
                  {draft.initialPaymentRequired ? 'Sí' : 'No'}
                </Badge>
              </div>
              {draft.initialPaymentRequired && (
                <div className="flex justify-between">
                  <span className="text-content-secondary">Monto inicial:</span>
                  <span className="font-semibold text-content-primary">${draft.initialPaymentAmount || '0'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-content-secondary">Mensualidades:</span>
                <span className="font-semibold text-content-primary">{draft.installmentCount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Primer vencimiento:</span>
                <span className="font-semibold text-content-primary">{draft.firstDueDate || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Periodo de gracia:</span>
                <span className="font-semibold text-content-primary">{draft.gracePeriodDays || '0'} días</span>
              </div>
            </div>
          </div>

          {/* 3. Fechas límite */}
          <div className="p-5 bg-surface-low rounded-2xl border border-surface-high space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Fechas límite</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(3)}
                className="text-xs font-semibold text-gold-600 hover:text-gold-700"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-content-secondary">Lugares:</span>
                <span className="font-semibold text-content-primary">{draft.placesDeadline || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Cambio de mesa:</span>
                <span className="font-semibold text-content-primary">{draft.tableChangeDeadline || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-secondary">Platillos:</span>
                <span className="font-semibold text-content-primary">{draft.mealsDeadline || 'Sin definir'}</span>
              </div>
            </div>
          </div>

          {/* 4. Termo */}
          <div className="p-5 bg-surface-low rounded-2xl border border-surface-high space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-900">Termo</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(4)}
                className="text-xs font-semibold text-gold-600 hover:text-gold-700"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-content-secondary">Porcentaje de desbloqueo:</span>
                <span className="font-semibold text-content-primary">{draft.thermoThresholdPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
