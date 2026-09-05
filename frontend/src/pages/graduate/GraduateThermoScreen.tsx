import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../design-system';
import {
  VISUAL_QA_GRADUATE_THERMO_STATES,
  type VisualGraduateThermoState,
  type VisualThermoStatus,
} from '../../fixtures/mealThermoVisualFixtures';

export interface GraduateThermoScreenProps { thermoStateId?: string; }

const statusLabel: Record<Exclude<VisualThermoStatus, 'LOCKED' | 'AVAILABLE'>, string> = {
  REQUESTED: 'Solicitado', IN_PRODUCTION: 'En producción', DELIVERED: 'Entregado',
};

export const GraduateThermoScreen: React.FC<GraduateThermoScreenProps> = ({ thermoStateId = 'thermo-locked-default' }) => {
  const thermoState: VisualGraduateThermoState = VISUAL_QA_GRADUATE_THERMO_STATES[thermoStateId] ?? VISUAL_QA_GRADUATE_THERMO_STATES['thermo-locked-default'];
  const [status, setStatus] = useState<VisualThermoStatus>(thermoState.status);
  const [personalization, setPersonalization] = useState<Record<string, string>>(() => ({ ...thermoState.personalization }));

  if (status === 'LOCKED') {
    const progress = thermoState.financialProgressPercentage ?? 0;
    return <div className="mx-auto flex max-w-xl flex-col gap-6 pb-16 font-sans animate-fadeIn">
      <h1 className="font-display text-2xl font-bold text-silver-50">Mi termo</h1>
      <div className="space-y-2"><p className="text-sm text-silver-300">Disponible al alcanzar {thermoState.requiredThresholdPercentage}%</p><p className="text-lg font-semibold text-silver-100">Llevas {progress}%</p><div className="h-2 overflow-hidden rounded-full bg-obsidian-800"><div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.min(progress, 100)}%` }} /></div></div>
      <Link to="/graduate/payments"><Button variant="primary">Ver pagos</Button></Link>
    </div>;
  }

  if (status === 'AVAILABLE') {
    return <div className="mx-auto flex max-w-xl flex-col gap-6 pb-16 font-sans animate-fadeIn">
      <header className="space-y-1"><h1 className="font-display text-2xl font-bold text-silver-50">Mi termo</h1><p className="text-sm text-silver-300">Ya puedes personalizarlo</p></header>
      <div className="space-y-4">{thermoState.personalizationFields.map((field) => <Input key={field.key} label={field.label} value={personalization[field.key] ?? ''} placeholder={field.placeholder} required={field.required} onChange={(event) => setPersonalization((current) => ({ ...current, [field.key]: event.target.value }))} />)}</div>
      <Button variant="primary" fullWidth onClick={() => setStatus('REQUESTED')}>Solicitar termo</Button>
    </div>;
  }

  return <div className="mx-auto flex max-w-xl flex-col gap-5 pb-16 font-sans animate-fadeIn">
    <h1 className="font-display text-2xl font-bold text-silver-50">Mi termo</h1>
    <p className="text-lg font-semibold text-silver-100">{statusLabel[status]}</p>
    <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wider text-silver-400">Grabado</p>{Object.entries(personalization).map(([key, value]) => <p key={key} className="text-sm text-silver-200">{value || 'Sin texto registrado'}</p>)}</div>
  </div>;
};
