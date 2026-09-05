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
import { DemoFlowPanel } from '../../demo/DemoFlowPanel';
import { useDemo } from '../../demo/useDemo';
import { isMockDataMode } from '../../demo/config';

export interface GraduateThermoScreenProps {
  thermoStateId?: string;
  onNavigateToPayments?: () => void;
}

export const GraduateThermoScreen: React.FC<GraduateThermoScreenProps> = ({
  thermoStateId = 'thermo-locked-default',
  onNavigateToPayments,
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
        <DemoFlowPanel flow="thermo" />
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold text-silver-50">
              Termo conmemorativo
            </h1>
            {getStatusBadge('LOCKED')}
          </div>
          <p className="text-xs text-silver-400">
            {thermoState.eventName}
          </p>
        </div>

        {/* Locked Hero Section */}
        <div className="p-6 bg-obsidian-900/60 border border-silver-800/60 rounded-xl flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-obsidian-800 border border-silver-700 text-silver-400 flex items-center justify-center">
            <Icon name="lock" size={26} />
          </div>

          <div className="space-y-1.5 max-w-sm">
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
          <div className="w-full bg-obsidian-900 rounded-xl p-4 border border-silver-800 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-silver-400 font-medium">Avance financiero actual</span>
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

          <Button
            variant="primary"
            size="md"
            fullWidth
            iconEnd="chevron-right"
            onClick={onNavigateToPayments}
          >
            Ver mis pagos
          </Button>
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
        <DemoFlowPanel flow="thermo" />
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold text-silver-50">
              Termo conmemorativo
            </h1>
            {getStatusBadge('AVAILABLE')}
          </div>
          <p className="text-xs text-silver-400">
            {thermoState.eventName}
          </p>
        </div>

        {/* Celebration Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-500/20 via-obsidian-850 to-obsidian-850 border border-gold-500/40 space-y-1">
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

        {/* Personalization Form */}
        <div className="p-5 bg-obsidian-900/40 border border-silver-800/60 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-silver-100">
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
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 3. REQUESTED / IN_PRODUCTION / DELIVERED States (Read-only)
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto animate-fadeIn font-sans pb-16">
      <DemoFlowPanel flow="thermo" />
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-silver-50">
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

      {/* Status Summary Section */}
      <div className="p-5 bg-obsidian-900/40 border border-silver-800/60 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-obsidian-800 border border-silver-700 text-gold-400 flex items-center justify-center">
            <Icon name={currentStatus === 'DELIVERED' ? 'check' : currentStatus === 'IN_PRODUCTION' ? 'clock' : 'mail'} size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-silver-100">
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
        </div>

        {/* Personalization Details */}
        <div className="p-3.5 bg-obsidian-900 rounded-xl border border-silver-800 space-y-2">
          <span className="text-[11px] font-semibold text-silver-400 uppercase tracking-wider block">
            Datos de grabado registrados
          </span>
          {Object.entries(personalization).length > 0 ? (
            Object.entries(personalization).map(([key, val]) => {
              const field = thermoState.personalizationFields.find((f) => f.key === key);
              return (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-silver-400">{field?.label || key}:</span>
                  <span className="font-bold text-gold-400">{val || '—'}</span>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-silver-500 italic">Sin texto de grabado registrado</span>
          )}
        </div>

        {/* Delivery Details if Delivered */}
        {currentStatus === 'DELIVERED' && thermoState.deliveryInfo && (
          <div className="p-3.5 bg-obsidian-900 rounded-xl border border-status-success/30 space-y-1.5 text-xs">
            <span className="text-[11px] font-semibold text-status-success uppercase tracking-wider block">
              Comprobante de entrega
            </span>
            {thermoState.deliveryInfo.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-silver-400">Fecha de entrega:</span>
                <span className="font-medium text-silver-200">{thermoState.deliveryInfo.deliveredAt}</span>
              </div>
            )}
            {thermoState.deliveryInfo.receivedBy && (
              <div className="flex justify-between">
                <span className="text-silver-400">Recibido por:</span>
                <span className="font-medium text-silver-200">{thermoState.deliveryInfo.receivedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Thermo Note */}
      {thermoState.hasAdditionalThermo && (
        <Alert variant="info" title="Termo adicional contratado">
          Tienes {thermoState.additionalThermoCount || 1} termo adicional registrado en tu paquete.
        </Alert>
      )}
    </div>
  );
};
