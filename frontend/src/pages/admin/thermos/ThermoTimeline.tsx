import React from 'react';
import { Icon } from '../../../design-system';
import type { ThermoStatus } from '../../../fixtures/graduateFixtures';
import { getThermoStatusLabel } from './thermoViewModel';

interface ThermoTimelineProps {
  status: ThermoStatus;
}

const ORDERED_STAGES: { status: ThermoStatus; icon: 'lock' | 'check' | 'cup' | 'refresh' }[] = [
  { status: 'LOCKED', icon: 'lock' },
  { status: 'AVAILABLE', icon: 'check' },
  { status: 'REQUESTED', icon: 'cup' },
  { status: 'IN_PRODUCTION', icon: 'refresh' },
  { status: 'DELIVERED', icon: 'check' },
];

export const ThermoTimeline: React.FC<ThermoTimelineProps> = ({ status }) => {
  const currentIndex = ORDERED_STAGES.findIndex((s) => s.status === status);

  return (
    <div className="flex flex-col gap-6" data-testid="thermo-timeline">
      {/* Pipeline Steps */}
      <div className="relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-surface-high -z-0" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
          {ORDERED_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;
            const label = getThermoStatusLabel(stage.status);

            let circleClass = 'bg-surface-lowest border-2 border-surface-highest text-content-muted';
            let textClass = 'text-content-muted';
            let badgeText = 'Pendiente';

            if (isCurrent) {
              circleClass =
                stage.status === 'DELIVERED'
                  ? 'bg-emerald-500 border-2 border-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                  : stage.status === 'IN_PRODUCTION'
                  ? 'bg-amber-500 border-2 border-amber-600 text-white shadow-md ring-4 ring-amber-100'
                  : stage.status === 'REQUESTED'
                  ? 'bg-navy-900 border-2 border-navy-800 text-white shadow-md ring-4 ring-navy-200'
                  : stage.status === 'AVAILABLE'
                  ? 'bg-gold-500 border-2 border-gold-600 text-white shadow-md ring-4 ring-gold-100'
                  : 'bg-navy-800 border-2 border-navy-900 text-white shadow-md ring-4 ring-surface-high';
              textClass = 'text-navy-900 font-bold';
              badgeText = 'Estado actual';
            } else if (isCompleted) {
              circleClass = 'bg-navy-100 border-2 border-navy-400 text-navy-800';
              textClass = 'text-navy-800 font-medium';
              badgeText = 'Completado';
            }

            return (
              <div
                key={stage.status}
                className={`flex md:flex-col items-center md:text-center gap-3 md:gap-2 relative z-10 ${
                  isFuture ? 'opacity-50' : ''
                }`}
                data-testid={`timeline-step-${stage.status}`}
              >
                {/* Step Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${circleClass}`}
                >
                  <Icon name={stage.icon} size={15} />
                </div>

                {/* Step Content */}
                <div className="flex flex-col md:items-center">
                  <span className={`text-xs ${textClass}`}>{label}</span>
                  <span className="text-[10px] text-content-muted mt-0.5">
                    {badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit History Box */}
      <div className="p-3 bg-surface-low/50 rounded-xl border border-surface-low text-xs text-content-secondary flex items-start gap-2">
        <Icon name="info" size={14} className="mt-0.5 shrink-0 text-content-muted" />
        <div>
          <span className="font-semibold text-content-primary">Historial administrativo: </span>
          <span>No disponible hasta integrar backend.</span>
        </div>
      </div>
    </div>
  );
};
