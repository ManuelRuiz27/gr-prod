import React from 'react';
import { Card, Button, Badge, Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../../../design-system';
import type { CreateEventDraft, CreateEventStep } from './createEventDraft';

interface ReviewStepProps {
  draft: CreateEventDraft;
  onEditStep: (step: CreateEventStep) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  draft,
  onEditStep,
}) => {
  return (
    <div className="space-y-6 font-sans">
      <Card className="p-6 md:p-8 space-y-6 bg-obsidian-850 border border-silver-800/80">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-silver-50">Resumen y confirmación</h2>
          <p className="text-xs text-silver-400">
            Revisa los detalles configurados antes de crear el evento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Información e Institución */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Información e institución</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(1)}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-silver-400">Nombre:</span>
                <span className="font-semibold text-silver-100 text-right max-w-[200px] truncate">{draft.name || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Fecha:</span>
                <span className="font-semibold text-silver-100">{draft.eventDate || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Lugar:</span>
                <span className="font-semibold text-silver-100 text-right max-w-[200px] truncate">{draft.venue || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Capacidad:</span>
                <span className="font-semibold text-silver-100">{draft.capacity ? `${draft.capacity} personas` : 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Escuela / institución:</span>
                <span className="font-semibold text-silver-100 text-right max-w-[200px] truncate">{draft.institution || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Carrera / generación:</span>
                <span className="font-semibold text-silver-100">{draft.career || 'Sin definir'} {draft.generation ? `(${draft.generation})` : ''}</span>
              </div>
            </div>
          </div>

          {/* 2. Productos y precios */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Productos y precios</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(2)}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              {draft.products.length === 0 ? (
                <span className="text-silver-400 italic">Sin productos configurados</span>
              ) : (
                draft.products.map((p) => (
                  <div key={p.id} className="flex justify-between items-center">
                    <span className="text-silver-400">{p.name || 'Sin nombre'}:</span>
                    <span className="font-semibold text-silver-100 font-sans">
                      {p.price ? `$${p.price}` : 'Sin precio'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Plan financiero, hitos y mora */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Plan financiero y mora</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(3)}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-silver-400">Precio total base:</span>
                <span className="font-semibold text-silver-100 font-sans">
                  {draft.baseAmount ? `$${draft.baseAmount}` : 'Sin definir'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Pago inicial requerido:</span>
                <Badge variant={draft.initialPaymentRequired ? 'success' : 'neutral'} size="sm">
                  {draft.initialPaymentRequired ? 'Sí' : 'No'}
                </Badge>
              </div>
              {draft.initialPaymentRequired && (
                <div className="flex justify-between">
                  <span className="text-silver-400">Monto inicial:</span>
                  <span className="font-semibold text-silver-100 font-sans">
                    {draft.initialPaymentAmount ? `$${draft.initialPaymentAmount}` : 'Sin definir'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-silver-400">Periodo de gracia:</span>
                <span className="font-semibold text-silver-100">
                  {draft.gracePeriodDays ? `${draft.gracePeriodDays} días` : 'Sin configurar'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Recargo por mora:</span>
                <span className="font-semibold text-silver-100 font-sans">
                  {draft.lateFeeAmount ? `$${draft.lateFeeAmount}` : 'Sin recargo configurado'}
                </span>
              </div>
            </div>

            {/* Calendario de pagos */}
            <div className="space-y-2 pt-2 border-t border-silver-800/80">
              <h4 className="text-xs font-bold text-silver-100">Calendario de pagos</h4>
              {draft.installments.length === 0 ? (
                <p className="text-xs text-silver-400">Sin mensualidades configuradas</p>
              ) : (
                <Table className="text-xs">
                  <TableHead>
                    <TableRow>
                      <TableHeader className="py-2 px-3 text-[11px]">Mensualidad</TableHeader>
                      <TableHeader className="py-2 px-3 text-[11px]">Monto</TableHeader>
                      <TableHeader className="py-2 px-3 text-[11px]">Vencimiento</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {draft.installments.map((inst) => (
                      <TableRow key={inst.sequence}>
                        <TableCell className="py-2 px-3 text-xs">{inst.label}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-medium font-sans">${inst.amount}</TableCell>
                        <TableCell className="py-2 px-3 text-xs">{inst.dueDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* 4. Fechas límite, platillos y termo */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Operación y servicios</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(4)}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300"
              >
                Editar
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-silver-400">Fecha límite lugares:</span>
                <span className="font-semibold text-silver-100">{draft.placesDeadline || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Fecha límite cambio de mesa:</span>
                <span className="font-semibold text-silver-100">{draft.tableChangeDeadline || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Fecha límite platillos:</span>
                <span className="font-semibold text-silver-100">{draft.mealsDeadline || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Platillos configurados:</span>
                <span className="font-semibold text-silver-100">
                  {draft.mealOptions.length === 0 ? 'Sin opciones configuradas' : `${draft.mealOptions.length} opciones`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Desbloqueo de termo:</span>
                <span className="font-semibold text-silver-100 font-sans">
                  {draft.thermoThresholdPercent ? `${draft.thermoThresholdPercent}%` : 'Umbral sin configurar'}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Política de cancelación */}
          <div className="md:col-span-2 p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Política de cancelación</h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEditStep(5)}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300"
              >
                Editar
              </Button>
            </div>
            <p className="text-xs text-silver-300 leading-relaxed">
              {draft.cancellationPolicySummary || 'Sin configurar'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
