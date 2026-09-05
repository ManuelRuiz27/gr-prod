import React, { useState } from 'react';
import {
  Badge,
  Button,
  Input,
  Alert,
  Icon,
} from '../../design-system';
import {
  VISUAL_QA_GRADUATE_THERMO_STATES,
  type VisualGraduateThermoState,
  type VisualThermoStatus,
} from '../../fixtures/mealThermoVisualFixtures';
import { useDemo } from '../../demo/useDemo';
import { isMockDataMode } from '../../demo/config';

export interface GraduateThermoScreenProps {
  thermoStateId?: string;
}

export const GraduateThermoScreen: React.FC<GraduateThermoScreenProps> = ({
  thermoStateId = 'thermo-locked-default',
}) => {
  const { state: demoState } = useDemo();
  const thermoState: VisualGraduateThermoState =
    VISUAL_QA_GRADUATE_THERMO_STATES[thermoStateId] ||
    VISUAL_QA_GRADUATE_THERMO_STATES['thermo-locked-default'];

  // Status is purely authoritative from backend fixture/prop — NEVER calculated from progress
  const [currentStatus, setCurrentStatus] = useState<VisualThermoStatus>(thermoState.status);
  const effectiveStatus = (isMockDataMode && thermoStateId === 'thermo-locked-default')
    ? (demoState.thermo.status as VisualThermoStatus)
    : currentStatus;

  // Dynamic Personalization state — strictly initialized from actual captured fields (NEVER fullName fallback)
  const [personalization, setPersonalization] = useState<Record<string, string>>(
    () => ({ ...thermoState.personalization })
  );

  const [isPreviewSuccess, setIsPreviewSuccess] = useState(false);

  const handleFieldChange = (key: string, value: string) => {
    setPersonalization((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsPreviewSuccess(false);
  };

  const handleRequestSubmit = () => {
    setCurrentStatus('REQUESTED');
    setIsPreviewSuccess(true);
  };

  const getStatusBadge = (status: VisualThermoStatus) => {
    switch (status) {
      case 'LOCKED':
        return <Badge variant="neutral" size="sm">Bloqueado</Badge>;
      case 'AVAILABLE':
        return <Badge variant="gold" size="sm">Disponible para solicitar</Badge>;
      case 'REQUESTED':
        return <Badge variant="primary" size="sm">Solicitado</Badge>;
      case 'IN_PRODUCTION':
        return <Badge variant="warning" size="sm">En producción</Badge>;
      case 'DELIVERED':
        return <Badge variant="success" size="sm">Entregado</Badge>;
    }
  };

  // -------------------------------------------------------------------------
  // 1. LOCKED State
  // -------------------------------------------------------------------------
  if (effectiveStatus === 'LOCKED') {
    const threshold = thermoState.requiredThresholdPercentage;
    const progress = thermoState.financialProgressPercentage ?? 0;

    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fadeIn font-sans pb-16">
        {/* Header */}
        <div className="space-y-1 border-b border-silver-800/60 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
              Termo conmemorativo
            </h1>
            {getStatusBadge('LOCKED')}
          </div>
          <p className="text-xs text-silver-400">
            {thermoState.eventName}
          </p>
        </div>

        {/* Locked Flat Section */}
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-silver-100">
              Tu termo se encuentra bloqueado
            </h2>
            <p className="text-xs text-silver-400 leading-relaxed">
              {threshold !== undefined
                ? `La solicitud se habilitará cuando cubras el ${threshold}% del plan de pagos de tu graduación.`
                : 'La solicitud se habilitará cuando cumplas el avance financiero requerido por el evento.'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-silver-400">Avance financiero actual</span>
              <span className="font-bold text-silver-100 font-sans">
                {progress}% {threshold !== undefined ? `de ${threshold}% requerido` : ''}
              </span>
            </div>
            <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-silver-800">
              <div
                style={{ width: `${Math.min(progress, 100)}%` }}
                className="h-full bg-gold-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          <div className="pt-2"><a href="/graduate/payments"><Button variant="primary" size="md" iconEnd="chevron-right">Ver mis pagos</Button></a></div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. AVAILABLE State (Celebratory, Gold treatment)
  // -------------------------------------------------------------------------
  if (effectiveStatus === 'AVAILABLE') {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fadeIn font-sans pb-16">
        {/* Header */}
        <div className="space-y-1 border-b border-silver-800/60 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
              Termo conmemorativo
            </h1>
            {getStatusBadge('AVAILABLE')}
          </div>
          <p className="text-xs text-silver-400">
            {thermoState.eventName}
          </p>
        </div>

        {/* Celebration Banner */}
        <div className="py-2 space-y-1">
          <div className="flex items-center gap-2 text-gold-400 font-bold text-sm">
            <Icon name="check" size={16} />
            <span>¡Has alcanzado el requisito para tu termo!</span>
          </div>
          <p className="text-xs text-silver-300 leading-relaxed">
            Ingresa la personalización para el grabado y confirma tu solicitud para enviarlo al taller.
          </p>
        </div>

        {/* Additional Thermo Note if applicable */}
        {thermoState.hasAdditionalThermo && (
          <Alert variant="info" title="Termo adicional incluido">
            Tienes {thermoState.additionalThermoCount || 1} termo adicional contratado en tu paquete.
          </Alert>
        )}

        {/* Personalization Form - Flat Page Section */}
        <section aria-labelledby="personalization-heading" className="space-y-4">
          <h2 id="personalization-heading" className="text-xs font-bold uppercase tracking-wider text-silver-400">
            Personalización para grabado
          </h2>

          <div className="space-y-3">
            {thermoState.personalizationFields.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                placeholder={field.placeholder || 'Escribe el texto aquí…'}
                value={personalization[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                required={field.required}
                helperText="Verifica la ortografía cuidadosamente antes de solicitar."
              />
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="gold"
              size="lg"
              fullWidth
              iconStart="cup"
              onClick={handleRequestSubmit}
            >
              Personalizar y solicitar termo
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 3. REQUESTED / IN_PRODUCTION / DELIVERED States (Read-only)
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fadeIn font-sans pb-16">
      {/* Header */}
      <div className="space-y-1 border-b border-silver-800/60 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display text-silver-50 tracking-tight">
            Termo conmemorativo
          </h1>
          {getStatusBadge(effectiveStatus)}
        </div>
        <p className="text-xs text-silver-400">
          {thermoState.eventName}
        </p>
      </div>

      {/* Visual Mode Feedback Notice */}
      {isPreviewSuccess && (
        <Alert variant="success" title="Solicitud preparada en modo visual">
          La disponibilidad y datos definitivos serán validados por el backend al activar la persistencia.
        </Alert>
      )}

      {/* Status Summary Section - Flat Page Layout */}
      <section aria-labelledby="status-summary-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="status-summary-heading" className="text-base font-bold text-silver-100">
            {currentStatus === 'DELIVERED'
              ? 'Termo entregado'
              : currentStatus === 'IN_PRODUCTION'
              ? 'Termo en producción'
              : 'Solicitud enviada'}
          </h2>
          <p className="text-xs text-silver-400">
            {currentStatus === 'DELIVERED'
              ? 'Tu termo conmemorativo ha sido entregado exitosamente.'
              : currentStatus === 'IN_PRODUCTION'
              ? 'Tu termo se encuentra actualmente en proceso de grabado en taller.'
              : 'Tu solicitud ha sido registrada y está en espera de envío a producción.'}
          </p>
        </div>

        {/* Personalization Details */}
        <div className="divide-y divide-silver-800/60 border-t border-silver-800/60">
          <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block pt-3 pb-1">
            Datos de grabado registrados
          </span>
          {Object.entries(personalization).length > 0 ? (
            Object.entries(personalization).map(([key, val]) => {
              const field = thermoState.personalizationFields.find((f) => f.key === key);
              return (
                <div key={key} className="py-2 flex justify-between items-center text-xs">
                  <span className="text-silver-400">{field?.label || key}:</span>
                  <span className="font-bold text-gold-400">{val || '—'}</span>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-silver-500 italic py-2 block">Sin texto de grabado registrado</span>
          )}
        </div>

        {/* Delivery Details if Delivered */}
        {currentStatus === 'DELIVERED' && thermoState.deliveryInfo && (
          <div className="divide-y divide-silver-800/60 border-t border-silver-800/60 pt-2 text-xs">
            <span className="text-[11px] font-semibold text-status-success uppercase tracking-wider block pb-1">
              Comprobante de entrega
            </span>
            {thermoState.deliveryInfo.deliveredAt && (
              <div className="py-2 flex justify-between">
                <span className="text-silver-400">Fecha de entrega:</span>
                <span className="font-medium text-silver-200">{thermoState.deliveryInfo.deliveredAt}</span>
              </div>
            )}
            {thermoState.deliveryInfo.receivedBy && (
              <div className="py-2 flex justify-between">
                <span className="text-silver-400">Recibido por:</span>
                <span className="font-medium text-silver-200">{thermoState.deliveryInfo.receivedBy}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Additional Thermo Note */}
      {thermoState.hasAdditionalThermo && (
        <Alert variant="info" title="Termo adicional contratado">
          Tienes {thermoState.additionalThermoCount || 1} termo adicional registrado en tu paquete.
        </Alert>
      )}
    </div>
  );
};
