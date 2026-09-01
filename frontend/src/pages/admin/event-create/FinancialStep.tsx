import React from 'react';
import { Input, Switch, Card, SectionHeader } from '../../../design-system';
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
    <div className="space-y-6 font-sans">
      {/* 1. Plan de Pagos */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Plan de pagos"
          description="Configura el precio base del evento y el calendario de cuotas."
        />

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
              <h3 className="text-sm font-bold text-silver-100 border-b border-silver-800/80 pb-2">
                Calendario de cuotas
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {draft.installments.map((installment, index) => (
                  <div
                    key={installment.sequence}
                    className="p-4 bg-obsidian-900 rounded-card border border-silver-800/70 space-y-3"
                  >
                    <span className="text-xs font-bold text-silver-200">
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
        </div>
      </Card>

      {/* 2. Pago Inicial e Hitos */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Pago inicial e hitos"
          description="Define anticipos obligatorios para apartar lugar y las condiciones de los hitos del evento."
        />

        <div className="space-y-4">
          <div className="p-4 bg-obsidian-900 rounded-card border border-silver-800/80">
            <Switch
              id="initialPaymentRequired"
              label="Requiere pago inicial"
              helperText="Define si el alumno debe realizar un anticipo inicial para confirmar su registro y apartado de lugar."
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
          )}

          <div className="p-4 bg-obsidian-900/60 rounded-card border border-silver-800/60 text-xs text-silver-400 space-y-1">
            <span className="font-semibold text-silver-200 block">Hitos financieros</span>
            <p>
              Puedes definir hitos financieros según las reglas y calendario del evento.
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Mora y Penalización Tardía */}
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <SectionHeader
          title="Mora / penalización tardía"
          description="Periodo de tolerancia y recargos aplicables por pago posterior al vencimiento."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            id="gracePeriodDays"
            label="Periodo de gracia"
            type="number"
            min={0}
            placeholder="Ej. 5"
            helperText="Días de tolerancia sin recargo posteriores a la fecha de vencimiento."
            value={draft.gracePeriodDays}
            onChange={(e) => updateDraft('gracePeriodDays', e.target.value)}
          />

          <Input
            id="lateFeeAmount"
            label="Recargo por mora (opcional)"
            type="number"
            min={0}
            placeholder="Ej. 200"
            helperText="Monto administrativo adicional por liquidación extemporánea."
            value={draft.lateFeeAmount}
            onChange={(e) => updateDraft('lateFeeAmount', e.target.value)}
            iconStart="payment"
          />
        </div>
      </Card>
    </div>
  );
};
