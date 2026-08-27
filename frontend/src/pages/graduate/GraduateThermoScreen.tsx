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
        return <Badge variant="warning">En Producción</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Entregado</Badge>;
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
          {currentStatus === 'LOCKED' ? (
            <span>Tu estado actual es <strong>LOCKED</strong>. Al alcanzar el {threshold}% pasará a <strong>AVAILABLE</strong>.</span>
          ) : currentStatus === 'AVAILABLE' ? (
            <span className="text-status-success font-semibold">¡Has alcanzado el umbral! Tu termo está disponible para solicitar.</span>
          ) : (
            <span>Estado de gestión: <strong>{currentStatus}</strong>.</span>
          )}
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

      {/* State Explorer / Demo Selector for UI validation */}
      <Card className="bg-surface-low border border-surface-high p-4 flex flex-col gap-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
          Estados Normativos del Termo (Demostración)
        </span>
        <p className="text-[11px] text-content-secondary">
          Explora cómo se visualiza cada uno de los 5 estados aprobados en la documentación:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {(['LOCKED', 'AVAILABLE', 'REQUESTED', 'IN_PRODUCTION', 'DELIVERED'] as ThermoStatus[]).map((st) => (
            <Button
              key={st}
              variant={currentStatus === st ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setCurrentStatus(st);
                setFeedbackMessage(null);
              }}
            >
              {st}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
