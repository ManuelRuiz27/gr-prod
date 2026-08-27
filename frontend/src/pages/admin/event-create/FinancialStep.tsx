import React from 'react';
import { Input, Switch, Card } from '../../../design-system';
import type { CreateEventDraft, UpdateCreateEventDraft } from './createEventDraft';

interface FinancialStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const FinancialStep: React.FC<FinancialStepProps> = ({
  draft,
  updateDraft,
}) => {
  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-navy-900">Plan financiero</h2>
        <p className="text-xs text-content-secondary">
          Configura los montos base, mensualidades y fechas de vencimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input
            id="baseAmount"
            label="Precio total base"
            type="number"
            min={1}
            placeholder="Ej. 12500"
            value={draft.baseAmount}
            onChange={(e) => updateDraft('baseAmount', e.target.value)}
            iconStart="payment"
            required
          />
        </div>

        <div className="md:col-span-2 p-4 bg-surface-low rounded-xl border border-surface-high">
          <Switch
            id="initialPaymentRequired"
            label="Requiere pago inicial"
            helperText="Define si el graduado debe realizar un anticipo para confirmar su lugar."
            checked={draft.initialPaymentRequired}
            onChange={(e) => {
              const checked = e.target.checked;
              updateDraft('initialPaymentRequired', checked);
              if (!checked) {
                updateDraft('initialPaymentAmount', '');
              }
            }}
          />
        </div>

        {draft.initialPaymentRequired && (
          <div className="md:col-span-2">
            <Input
              id="initialPaymentAmount"
              label="Monto del pago inicial"
              type="number"
              min={1}
              placeholder="Ej. 2500"
              value={draft.initialPaymentAmount}
              onChange={(e) => updateDraft('initialPaymentAmount', e.target.value)}
              iconStart="payment"
              required
            />
          </div>
        )}

        <Input
          id="installmentCount"
          label="Número de mensualidades"
          type="number"
          min={1}
          placeholder="Ej. 6"
          value={draft.installmentCount}
          onChange={(e) => updateDraft('installmentCount', e.target.value)}
          iconStart="calendar"
          required
        />

        <Input
          id="firstDueDate"
          label="Fecha del primer vencimiento"
          type="date"
          value={draft.firstDueDate}
          onChange={(e) => updateDraft('firstDueDate', e.target.value)}
          iconStart="calendar"
          required
        />

        <div className="md:col-span-2">
          <Input
            id="gracePeriodDays"
            label="Periodo de gracia"
            type="number"
            min={0}
            placeholder="Ej. 5"
            helperText="Días de tolerancia posteriores al vencimiento."
            value={draft.gracePeriodDays}
            onChange={(e) => updateDraft('gracePeriodDays', e.target.value)}
            required
          />
        </div>
      </div>
    </Card>
  );
};
