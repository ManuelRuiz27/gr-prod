import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, Button, Alert } from '../../../design-system';
import {
  INITIAL_CREATE_EVENT_DRAFT,
  type CreateEventDraft,
  type CreateEventStep,
  type UpdateCreateEventDraft,
} from './createEventDraft';
import { BasicInfoStep } from './BasicInfoStep';
import { ProductsStep } from './ProductsStep';
import { FinancialStep } from './FinancialStep';
import { OperationsStep } from './OperationsStep';
import { CancellationPolicyStep } from './CancellationPolicyStep';
import { ReviewStep } from './ReviewStep';

const STEP_TITLES: Record<CreateEventStep, string> = {
  1: 'Evento',
  2: 'Productos',
  3: 'Finanzas',
  4: 'Operación',
  5: 'Políticas',
  6: 'Revisar',
};

export const CreateEventWizardScreen: React.FC = () => {
  const [step, setStep] = useState<CreateEventStep>(1);
  const [draft, setDraft] = useState<CreateEventDraft>(INITIAL_CREATE_EVENT_DRAFT);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const updateDraft: UpdateCreateEventDraft = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  function validateStep(currentStep: CreateEventStep): string | null {
    switch (currentStep) {
      case 1: {
        const capacityNum = Number(draft.capacity);
        const isCapacityValid =
          draft.capacity.trim() !== '' &&
          Number.isInteger(capacityNum) &&
          capacityNum > 0;

        if (
          !draft.name.trim() ||
          !draft.eventDate ||
          !draft.venue.trim() ||
          !isCapacityValid
        ) {
          return 'Completa nombre, fecha, lugar y una capacidad válida.';
        }
        return null;
      }
      case 2: {
        // Products are configurable and optional at draft time; if prices provided they must be valid numbers
        const pricesValid = draft.products.every(
          (p) => p.price === '' || (!isNaN(Number(p.price)) && Number(p.price) >= 0)
        );
        if (!pricesValid) {
          return 'Configura precios numéricos válidos para los productos.';
        }
        return null;
      }
      case 3: {
        const baseNum = Number(draft.baseAmount);
        const isBaseValid = !isNaN(baseNum) && baseNum > 0;

        const isGraceValid =
          draft.gracePeriodDays.trim() === '' ||
          (!isNaN(Number(draft.gracePeriodDays)) &&
            Number.isInteger(Number(draft.gracePeriodDays)) &&
            Number(draft.gracePeriodDays) >= 0);

        const installmentsValid =
          draft.installments.length > 0 &&
          draft.installments.every((installment) => {
            const amount = Number(installment.amount);
            return (
              Number.isFinite(amount) &&
              amount > 0 &&
              installment.dueDate !== ''
            );
          });

        if (!isBaseValid || !isGraceValid || !installmentsValid) {
          return 'Completa correctamente la configuración financiera.';
        }

        if (draft.initialPaymentRequired) {
          const initNum = Number(draft.initialPaymentAmount);
          if (isNaN(initNum) || initNum <= 0) {
            return 'Completa correctamente la configuración financiera.';
          }
        }
        return null;
      }

      case 4: {
        if (draft.thermoThresholdPercent.trim() !== '') {
          const thermoNum = Number(draft.thermoThresholdPercent);
          if (isNaN(thermoNum) || thermoNum < 0 || thermoNum > 100) {
            return 'El porcentaje del termo debe estar entre 0 y 100.';
          }
        }
        return null;
      }
      case 5: {
        return null;
      }
      case 6: {
        return null;
      }
    }
  }

  function handleNext(): void {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((current) => (current + 1) as CreateEventStep);
  }

  function handleBack(): void {
    setError('');
    if (step === 1) {
      navigate('/admin/events');
    } else {
      setStep((current) => (current - 1) as CreateEventStep);
    }
  }

  function handleFinish(): void {
    // Technical Note: Persistence is handled through backend integration in subsequent milestones.
    navigate('/admin/events');
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-16 font-sans animate-fadeIn">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: 'Plataforma GR', href: '/admin' },
            { label: 'Eventos', href: '/admin/events' },
            { label: 'Crear evento', current: true },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-silver-50 tracking-tight font-display">
              Crear evento
            </h1>
            <p className="text-xs text-silver-400">
              Paso {step} de 6: {STEP_TITLES[step]}
            </p>
          </div>
          <div className="text-xs font-semibold text-gold-400 bg-obsidian-850 px-3 py-1.5 rounded-card border border-gold-500/30 self-start sm:self-auto">
            Paso {step} de 6
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="grid grid-cols-6 gap-2">
        {([1, 2, 3, 4, 5, 6] as CreateEventStep[]).map((stepIndex) => {
          const isPassed = stepIndex < step;
          const isCurrent = stepIndex === step;
          return (
            <div key={stepIndex} className="flex flex-col gap-1.5">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isPassed
                    ? 'bg-silver-400'
                    : isCurrent
                    ? 'bg-gold-500'
                    : 'bg-obsidian-800 border border-silver-800/80'
                }`}
              />
              <span
                className={`text-[11px] truncate hidden sm:block ${
                  isCurrent
                    ? 'font-bold text-silver-50'
                    : isPassed
                    ? 'font-medium text-silver-300'
                    : 'text-silver-500'
                }`}
              >
                {stepIndex}. {STEP_TITLES[stepIndex]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alert */}
      {error && (
        <Alert variant="error" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <main>
        {step === 1 && (
          <BasicInfoStep draft={draft} updateDraft={updateDraft} />
        )}
        {step === 2 && (
          <ProductsStep draft={draft} updateDraft={updateDraft} />
        )}
        {step === 3 && (
          <FinancialStep draft={draft} updateDraft={updateDraft} />
        )}
        {step === 4 && (
          <OperationsStep draft={draft} updateDraft={updateDraft} />
        )}
        {step === 5 && (
          <CancellationPolicyStep draft={draft} updateDraft={updateDraft} />
        )}
        {step === 6 && (
          <ReviewStep
            draft={draft}
            onEditStep={(targetStep) => {
              setError('');
              setStep(targetStep);
            }}
          />
        )}
      </main>

      {/* Actions Footer */}
      <footer className="flex items-center justify-between pt-4 border-t border-silver-800/80">
        <Button
          variant="secondary"
          size="md"
          type="button"
          onClick={handleBack}
          iconStart="chevron-left"
        >
          Atrás
        </Button>

        {step < 6 ? (
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleNext}
            iconEnd="chevron-right"
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleFinish}
            iconEnd="check"
          >
            Crear evento
          </Button>
        )}
      </footer>
    </div>
  );
};
