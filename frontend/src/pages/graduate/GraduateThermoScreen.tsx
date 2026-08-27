import React, { useState } from 'react';
import { Card, Badge, Button, Input, Alert } from '../../design-system';
import {
  currentGraduateMock,
  mockPaymentPlan,
  type ThermoStatus,
} from '../../fixtures';

export const GraduateThermoScreen: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<ThermoStatus>(currentGraduateMock.thermoStatus);
  const [nameToDisplay, setNameToDisplay] = useState(currentGraduateMock.thermoCustomName || currentGraduateMock.fullName);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const threshold = currentGraduateMock.thermoThreshold; // 70%
  const currentProgress = mockPaymentPlan.progressPercentage; // 60%
  const isUnlocked = currentProgress >= threshold || currentStatus !== 'LOCKED';

  const handleRequest = () => {
    setCurrentStatus('REQUESTED');
    setFeedbackMessage('Solicitud de termo enviada exitosamente.');
  };

  const getStatusBadge = (status: ThermoStatus) => {
    switch (status) {
      case 'LOCKED':
        return <Badge variant="neutral">Bloqueado</Badge>;
      case 'AVAILABLE':
        return <Badge variant="gold">Disponible para solicitar</Badge>;
      case 'REQUESTED':
        return <Badge variant="primary">Solicitado</Badge>;
      case 'IN_PRODUCTION':
        return <Badge variant="warning">En producción</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Entregado</Badge>;
    }
  };

  const getStatusExplanation = (status: ThermoStatus) => {
    switch (status) {
      case 'LOCKED':
        return `Tu termo se encuentra bloqueado. Al cubrir el ${threshold}% de tu plan de pagos pasará a estar disponible para solicitar.`;
      case 'AVAILABLE':
        return '¡Has alcanzado el umbral requerido! Tu termo ya está disponible para solicitar.';
      case 'REQUESTED':
        return 'Tu solicitud ha sido registrada y está en espera de envío a taller.';
      case 'IN_PRODUCTION':
        return 'Tu termo se encuentra actualmente en proceso de producción con el proveedor.';
      case 'DELIVERED':
        return 'Tu termo ha sido entregado exitosamente.';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Info */}
      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-900">Gestión de Termo Conmemorativo</h2>
          {getStatusBadge(currentStatus)}
        </div>
        <p className="text-xs text-content-secondary leading-relaxed">
          El termo conmemorativo se desbloquea automáticamente al cubrir el {threshold}% de tu plan de pagos.
        </p>
      </Card>

      {feedbackMessage && (
        <Alert variant="success" onDismiss={() => setFeedbackMessage(null)}>
          {feedbackMessage}
        </Alert>
      )}

      {/* Progress & Eligibility Status */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-content-muted">Progreso Financiero Actual</span>
          <span className="font-bold text-navy-900">{currentProgress}% de {threshold}% requerido</span>
        </div>
        <div className="w-full bg-surface-low rounded-full h-2.5 overflow-hidden">
          <div
            style={{ width: `${currentProgress}%` }}
            className={`h-full rounded-full transition-all ${
              isUnlocked ? 'bg-status-success' : 'bg-gold-400'
            }`}
          />
        </div>
        <div className="text-[11px] text-content-secondary">
          <span>{getStatusExplanation(currentStatus)}</span>
        </div>
      </Card>

      {/* Name confirmation when AVAILABLE or REQUESTED */}
      <Card className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-navy-900">Nombre Asociado al Termo</h3>
        <Input
          label="Nombre del Graduado"
          value={nameToDisplay}
          onChange={(e) => setNameToDisplay(e.target.value)}
          disabled={currentStatus === 'IN_PRODUCTION' || currentStatus === 'DELIVERED'}
          helperText="Nombre con el que se registrará tu termo en la lista de producción"
        />

        {currentStatus === 'AVAILABLE' && (
          <Button variant="gold" iconStart="check" onClick={handleRequest} className="mt-2">
            Confirmar y Solicitar Termo
          </Button>
        )}
      </Card>
    </div>
  );
};
