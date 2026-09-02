import React, { useState, useMemo } from 'react';
import {
  Card,
  Badge,
  Button,
  Icon,
  Alert,
  Modal,
  Input,
} from '../../../design-system';
import type {
  VisualCancellationPolicy,
  VisualCancellationPolicyRange,
} from '../../../fixtures/cancellationReportsAuditVisualFixtures';
import {
  validateCancellationRanges,
  generatePolicyTextualPreview,
} from './policyValidation';

interface CancellationPolicyEditorProps {
  policy: VisualCancellationPolicy;
  onPublishPreview: () => void;
  onCreateNewVersion: () => void;
}

export const CancellationPolicyEditor: React.FC<CancellationPolicyEditorProps> = ({
  policy,
  onPublishPreview,
  onCreateNewVersion,
}) => {
  const isDraft = policy.status === 'DRAFT';
  const isActive = policy.status === 'ACTIVE';

  // Draft local state for ranges
  const [ranges, setRanges] = useState<VisualCancellationPolicyRange[]>(policy.ranges);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [validationSuccessNotice, setValidationSuccessNotice] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Real-time validation
  const validationResult = useMemo(() => {
    return validateCancellationRanges(ranges);
  }, [ranges]);

  // Natural language preview
  const textualPreview = useMemo(() => {
    return generatePolicyTextualPreview(ranges);
  }, [ranges]);

  // ── Range Manipulation Handlers ─────────────────────────────────────────────

  const handleRangeChange = (
    id: string,
    field: 'daysBeforeMin' | 'daysBeforeMax' | 'penaltyPercent',
    value: number | null
  ) => {
    if (!isDraft) return;
    setValidationSuccessNotice(false);
    setRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleToggleNoLimit = (id: string, currentMax: number | null) => {
    if (!isDraft) return;
    setValidationSuccessNotice(false);
    setRanges((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, daysBeforeMax: currentMax === null ? 30 : null } : r
      )
    );
  };

  const handleAddRange = () => {
    if (!isDraft) return;
    setValidationSuccessNotice(false);
    const maxSort = ranges.reduce((acc, r) => Math.max(acc, r.sortOrder), 0);
    const lastRange = ranges[ranges.length - 1];
    const newMin = lastRange && lastRange.daysBeforeMax !== null ? lastRange.daysBeforeMax + 1 : 60;

    const newRange: VisualCancellationPolicyRange = {
      id: `rng-draft-${Date.now()}`,
      daysBeforeMin: newMin,
      daysBeforeMax: null,
      penaltyPercent: 0,
      sortOrder: maxSort + 1,
    };
    setRanges((prev) => [...prev, newRange]);
  };

  const handleRemoveRange = (id: string) => {
    if (!isDraft) return;
    setValidationSuccessNotice(false);
    setRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const handleValidateClick = () => {
    if (validationResult.isValid) {
      setValidationSuccessNotice(true);
    } else {
      setValidationSuccessNotice(false);
    }
  };

  const handleConfirmPublish = () => {
    setIsPublishModalOpen(false);
    onPublishPreview();
    setFeedbackNotice(
      'Publicación preparada en modo visual. El backend deberá validar y publicar la versión definitiva.'
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Feedback Banner */}
      {feedbackNotice && (
        <Alert variant="info" onDismiss={() => setFeedbackNotice(null)}>
          {feedbackNotice}
        </Alert>
      )}

      {/* Validation Success Banner */}
      {validationSuccessNotice && isDraft && (
        <Alert
          variant="success"
          title="Validación local aprobada"
          onDismiss={() => setValidationSuccessNotice(false)}
        >
          La estructura visual cumple las validaciones locales. El backend deberá revalidarla antes de publicar.
        </Alert>
      )}

      {/* General Validation Errors */}
      {isDraft && validationResult.generalErrors.length > 0 && (
        <Alert
          variant="error"
          title="Errores en la definición de rangos de penalización"
        >
          <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
            {validationResult.generalErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Main Policy Card */}
      <Card className="bg-obsidian-850 border border-silver-800/80 p-0 overflow-hidden">
        {/* Card Header Toolbar */}
        <div className="p-5 border-b border-silver-800/80 bg-obsidian-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-obsidian-800 border border-silver-700/80 flex items-center justify-center text-gold-400">
              <Icon name="alert" size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-silver-50">
                  Rangos de penalización por cancelación
                </h3>
                <Badge
                  variant={
                    isActive ? 'success' : isDraft ? 'warning' : 'neutral'
                  }
                  size="sm"
                >
                  {isActive ? 'Activa' : isDraft ? 'Borrador editable' : 'Archivada'}
                </Badge>
              </div>
              <p className="text-xs text-silver-400 mt-0.5">
                {isDraft
                  ? 'Configura los días previos al evento y el porcentaje retenido correspondiente.'
                  : isActive
                  ? 'Esta versión está en vigor y es inmutable. Para modificarla, genera un nuevo borrador.'
                  : 'Versión histórica archivada exclusivamente para consulta y trazabilidad.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDraft && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleValidateClick}
                  iconStart="check"
                >
                  Validar política
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!validationResult.isValid}
                  onClick={() => setIsPublishModalOpen(true)}
                  iconEnd="chevron-right"
                >
                  Publicar política
                </Button>
              </>
            )}

            {isActive && (
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateNewVersion}
                iconStart="edit"
              >
                Crear nueva versión
              </Button>
            )}
          </div>
        </div>

        {/* Ranges Table (Desktop & Scroll on Mobile) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-obsidian-900 text-[11px] font-semibold text-silver-400 uppercase tracking-wider border-b border-silver-800">
                <th className="px-5 py-3 w-16">#</th>
                <th className="px-5 py-3">Desde (días antes)</th>
                <th className="px-5 py-3">Hasta (días antes)</th>
                <th className="px-5 py-3">Penalización (%)</th>
                {isDraft && <th className="px-5 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-silver-800/60 text-silver-200">
              {ranges.length === 0 ? (
                <tr>
                  <td
                    colSpan={isDraft ? 5 : 4}
                    className="px-5 py-10 text-center text-silver-400"
                  >
                    No hay rangos configurados en este borrador.
                  </td>
                </tr>
              ) : (
                ranges.map((range, idx) => {
                  const rangeErrors = validationResult.errors.filter(
                    (e) => e.rangeId === range.id
                  );
                  const hasError = rangeErrors.length > 0;

                  return (
                    <tr
                      key={range.id}
                      className={`transition-colors ${
                        hasError ? 'bg-status-error/10' : 'hover:bg-obsidian-800/40'
                      }`}
                      data-testid={`range-row-${idx}`}
                    >
                      <td className="px-5 py-3.5 font-mono text-silver-400 font-bold">
                        {idx + 1}
                      </td>

                      {/* Desde */}
                      <td className="px-5 py-3.5">
                        {isDraft ? (
                          <div className="flex flex-col gap-1 max-w-[140px]">
                            <Input
                              type="number"
                              min={0}
                              value={range.daysBeforeMin}
                              onChange={(e) =>
                                handleRangeChange(
                                  range.id,
                                  'daysBeforeMin',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              aria-label={`Desde días antes rango ${idx + 1}`}
                            />
                          </div>
                        ) : (
                          <span className="font-semibold text-silver-100 font-mono">
                            {range.daysBeforeMin} días
                          </span>
                        )}
                      </td>

                      {/* Hasta */}
                      <td className="px-5 py-3.5">
                        {isDraft ? (
                          <div className="flex items-center gap-3">
                            {range.daysBeforeMax === null ? (
                              <Badge variant="gold" size="sm">
                                Sin límite (en adelante)
                              </Badge>
                            ) : (
                              <div className="max-w-[140px]">
                                <Input
                                  type="number"
                                  min={range.daysBeforeMin}
                                  value={range.daysBeforeMax}
                                  onChange={(e) =>
                                    handleRangeChange(
                                      range.id,
                                      'daysBeforeMax',
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  aria-label={`Hasta días antes rango ${idx + 1}`}
                                />
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleNoLimit(range.id, range.daysBeforeMax)
                              }
                              className="text-[11px] text-silver-400 hover:text-gold-400 underline transition-colors"
                            >
                              {range.daysBeforeMax === null
                                ? 'Fijar límite superior'
                                : 'Sin límite'}
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-silver-100 font-mono">
                            {range.daysBeforeMax === null
                              ? 'Sin límite'
                              : `${range.daysBeforeMax} días`}
                          </span>
                        )}
                      </td>

                      {/* Penalización % */}
                      <td className="px-5 py-3.5">
                        {isDraft ? (
                          <div className="flex items-center gap-2 max-w-[140px]">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={range.penaltyPercent}
                              onChange={(e) =>
                                handleRangeChange(
                                  range.id,
                                  'penaltyPercent',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              aria-label={`Porcentaje penalización rango ${idx + 1}`}
                            />
                            <span className="font-bold text-silver-400">%</span>
                          </div>
                        ) : (
                          <Badge
                            variant={
                              range.penaltyPercent >= 50
                                ? 'error'
                                : range.penaltyPercent > 0
                                ? 'warning'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {range.penaltyPercent}% penalización
                          </Badge>
                        )}
                      </td>

                      {/* Acciones */}
                      {isDraft && (
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveRange(range.id)}
                            iconStart="trash"
                          >
                            Eliminar
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Add Range Footer in DRAFT */}
        {isDraft && (
          <div className="p-4 bg-obsidian-900/60 border-t border-silver-800/80 flex justify-between items-center">
            <span className="text-xs text-silver-400">
              Asegúrate de no dejar días descubiertos ni traslapes entre rangos.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddRange}
              iconStart="plus"
            >
              Agregar rango
            </Button>
          </div>
        )}
      </Card>

      {/* Textual Natural Preview Card */}
      <Card className="bg-obsidian-850 border border-silver-800/80 p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-obsidian-800 text-gold-400 flex items-center justify-center">
            <Icon name="info" size={16} />
          </div>
          <h4 className="text-sm font-bold text-silver-50">
            Interpretación normativa de esta política
          </h4>
        </div>

        <div className="p-4 bg-obsidian-900 rounded-xl border border-silver-800 text-xs text-silver-300 space-y-2 leading-relaxed">
          {textualPreview.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-gold-400 font-bold">•</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation Modal for Publish */}
      {isPublishModalOpen && (
        <Modal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          title="Confirmar publicación de política de cancelación"
          size="md"
        >
          <div className="flex flex-col gap-4 font-sans text-xs">
            <Alert
              variant="warning"
              title="Acción administrativa inmutable"
            >
              Una política publicada será inmutable. Cualquier cambio posterior requerirá generar una nueva versión de borrador.
            </Alert>

            <p className="text-silver-200 leading-relaxed">
              ¿Deseas publicar la <strong>Versión {policy.version}</strong> de la política de cancelación para este evento? Al publicarse, entrará en vigor para nuevas cancelaciones.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-silver-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPublishModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmPublish}
              >
                Publicar versión definitivamente
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
