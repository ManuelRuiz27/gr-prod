import type { ThermoStatus } from '../fixtures';

export type ThermoStatusTone =
  | 'neutral'
  | 'gold'
  | 'primary'
  | 'warning'
  | 'success';

export interface ThermoStatusPresentation {
  label: string;
  tone: ThermoStatusTone;
}

const THERMO_STATUS_PRESENTATION: Record<ThermoStatus, ThermoStatusPresentation> = {
  LOCKED: {
    label: 'Bloqueado',
    tone: 'neutral',
  },
  AVAILABLE: {
    label: 'Disponible',
    tone: 'gold',
  },
  REQUESTED: {
    label: 'Solicitado',
    tone: 'primary',
  },
  IN_PRODUCTION: {
    label: 'En producción',
    tone: 'warning',
  },
  DELIVERED: {
    label: 'Entregado',
    tone: 'success',
  },
};

export function getThermoStatusPresentation(
  status: ThermoStatus
): ThermoStatusPresentation {
  return THERMO_STATUS_PRESENTATION[status];
}
