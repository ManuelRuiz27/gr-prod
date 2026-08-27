import React from 'react';
import { Input, Switch, Card } from '../../../design-system';
import {
  resizeInstallments,
  type CreateEventDraft,
  type UpdateCreateEventDraft,
} from './createEventDraft';

interface FinancialStepProps {
  draft: CreateEventDraft;
  updateDraft: UpdateCreateEventDraft;
}

export const FinancialStep: React.FC<FinancialStepProps> = ({
  draft,
  updateDraft,
}) => {
  function handleInstallmentCountChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const rawVal = e.target.value.trim();
    if (!rawVal) {
      updateDraft('installments', []);
      return;
    }
    const count = parseInt(rawVal, 10);
    if (isNaN(count) || count <= 0) {
      updateDraft('installments', []);
    } else {
      updateDraft(
        'installments',
        resizeInstallments(draft.installments, count)
      );
    }
  }

  function handleInstallmentFieldChange(
    index: number,
    field: 'amount' | 'dueDate',
    value: string
  ): void {
    const updated = draft.installments.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    );
    updateDraft('installments', updated);
  }

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

        <div className="md:col-span-2">
          <Input
            id="installmentCount"
            label="Número de mensualidades"
            type="number"
            min={1}
            placeholder="Ej. 3"
            value={
              draft.installments.length === 0
                ? ''
                : String(draft.installments.length)
            }
            onChange={handleInstallmentCountChange}
            iconStart="calendar"
            required
          />
        </div>

        {draft.installments.length > 0 && (
          <div className="md:col-span-2 space-y-4 pt-2">
            <h3 className="text-sm font-bold text-navy-900 border-b border-surface-high pb-2">
              Calendario de pagos
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {draft.installments.map((installment, index) => (
                <div
                  key={installment.sequence}
                  className="p-4 bg-surface-low rounded-xl border border-surface-high space-y-3"
                >
                  <span className="text-xs font-bold text-navy-900">
                    Mensualidad {installment.sequence}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id={`installment-${installment.sequence}-amount`}
                      label="Monto"
                      type="number"
                      min={1}
                      placeholder="Ej. 2500"
                      value={installment.amount}
                      onChange={(e) =>
                        handleInstallmentFieldChange(
                          index,
                          'amount',
                          e.target.value
                        )
                      }
                      iconStart="payment"
                      required
                    />

                    <Input
                      id={`installment-${installment.sequence}-dueDate`}
                      label="Fecha de vencimiento"
                      type="date"
                      value={installment.dueDate}
                      onChange={(e) =>
                        handleInstallmentFieldChange(
                          index,
                          'dueDate',
                          e.target.value
                        )
                      }
                      iconStart="calendar"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
