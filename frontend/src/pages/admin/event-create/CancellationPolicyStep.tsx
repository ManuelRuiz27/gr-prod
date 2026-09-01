import React from 'react';
import { Card, SectionHeader, Badge, Icon } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface CancellationPolicyStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const CancellationPolicyStep: React.FC<CancellationPolicyStepProps> = () => {
  return (
    <div className="space-y-6 font-sans">
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-silver-800/80 pb-4">
          <SectionHeader
            title="Política de cancelación"
            description="Términos y condiciones de reembolso aplicables a cancelaciones de lugares o baja del evento."
            className="mb-0"
          />
          <Badge variant="gold" size="sm">
            Política estándar
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="alert" size={16} className="text-gold-400" />
              <h3 className="text-sm font-bold text-silver-100">Esquema de penalización escalonada</h3>
            </div>
            <p className="text-xs text-silver-400 leading-relaxed">
              El evento aplicará las retenciones porcentuales estándar acordadas en el contrato del comité institucional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-obsidian-800 border border-silver-700/60 flex flex-col gap-1">
                <span className="text-silver-400 font-medium">&gt; 90 días del evento</span>
                <span className="text-silver-100 font-bold">10% retención administrativa</span>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-800 border border-silver-700/60 flex flex-col gap-1">
                <span className="text-silver-400 font-medium">30 a 90 días</span>
                <span className="text-silver-100 font-bold">30% retención</span>
              </div>
              <div className="p-3 rounded-lg bg-obsidian-800 border border-silver-700/60 flex flex-col gap-1">
                <span className="text-silver-400 font-medium">&lt; 30 días</span>
                <span className="text-status-error font-bold">No reembolsable</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-card bg-obsidian-900/60 border border-silver-800/60 text-xs text-silver-400 flex items-center justify-between gap-3">
            <span>Para configurar una matriz de penalizaciones a la medida, utiliza el editor de políticas en Configuración.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
