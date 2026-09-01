import React from 'react';
import { Card, SectionHeader, Badge, Icon } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface CancellationPolicyStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const CancellationPolicyStep: React.FC<CancellationPolicyStepProps> = ({
  draft,
}) => {
  const isConfigured = Boolean(draft.cancellationPolicySummary && draft.cancellationPolicySummary.trim() !== '');

  return (
    <div className="space-y-6 font-sans">
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-silver-800/80 pb-4">
          <SectionHeader
            title="Política de cancelación"
            description="Términos y condiciones de reembolso aplicables a cancelaciones de lugares o baja del evento."
            className="mb-0"
          />
          <Badge variant={isConfigured ? 'success' : 'neutral'} size="sm">
            {isConfigured ? 'Configurada' : 'Sin configurar'}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="alert" size={16} className="text-gold-400" />
              <h3 className="text-sm font-bold text-silver-100">Esquema de penalización por plazos</h3>
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              La política de cancelación se define mediante rangos configurables por evento, determinando los porcentajes de retención y plazos límite aplicables según la fecha de solicitud.
            </p>

            <div className="p-4 rounded-card bg-obsidian-800/80 border border-silver-700/60 text-xs text-silver-300 space-y-1">
              <span className="font-semibold text-silver-100 block">Estructura de la política</span>
              <p className="text-silver-400">
                Los rangos de penalización escalonada (días previos al evento y porcentaje de retención) se gestionan en el módulo específico de políticas de cancelación (VS-A-CANPOL-001).
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
