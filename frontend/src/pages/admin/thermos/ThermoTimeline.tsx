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
    <div className="flex flex-col gap-6 font-sans" data-testid="thermo-timeline">
      {/* Pipeline Steps */}
      <div className="relative">
        {/* Connecting line (desktop) */}
        <div className="hidden md:block absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-silver-800 -z-0" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
          {ORDERED_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;
            const label = getThermoStatusLabel(stage.status);

            let circleClass = 'bg-obsidian-900 border-2 border-silver-800 text-silver-500';
            let textClass = 'text-silver-400';
            let badgeText = 'Pendiente';

            if (isCurrent) {
              circleClass =
                stage.status === 'DELIVERED'
                  ? 'bg-status-success text-obsidian-950 border-2 border-status-success shadow-md ring-4 ring-status-success/20'
                  : stage.status === 'IN_PRODUCTION'
                  ? 'bg-status-warning text-obsidian-950 border-2 border-status-warning shadow-md ring-4 ring-status-warning/20'
                  : stage.status === 'REQUESTED'
                  ? 'bg-silver-200 text-obsidian-950 border-2 border-silver-300 shadow-md ring-4 ring-silver-400/20'
                  : stage.status === 'AVAILABLE'
                  ? 'bg-gold-500 text-obsidian-950 border-2 border-gold-400 shadow-md ring-4 ring-gold-500/20'
                  : 'bg-obsidian-800 text-silver-300 border-2 border-silver-700 shadow-md ring-4 ring-silver-800';
              textClass = 'text-silver-100 font-bold';
              badgeText = 'Estado actual';
            } else if (isCompleted) {
              circleClass = 'bg-obsidian-800 border-2 border-gold-500 text-gold-400';
              textClass = 'text-silver-300 font-medium';
              badgeText = 'Completado';
            }

            return (
              <div
                key={stage.status}
                className={`flex md:flex-col items-center md:text-center gap-3 md:gap-2 relative z-10 ${
                  isFuture ? 'opacity-45' : ''
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
                  <span className="text-[10px] text-silver-400 mt-0.5">
                    {badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit History Box */}
      <div className="p-3 bg-obsidian-900 rounded-xl border border-silver-800 text-xs text-silver-400 flex items-start gap-2">
        <Icon name="info" size={14} className="mt-0.5 shrink-0 text-silver-400" />
        <div>
          <span className="font-semibold text-silver-300">Historial administrativo: </span>
          <span>No disponible hasta integrar backend.</span>
        </div>
      </div>
    </div>
  );
};
