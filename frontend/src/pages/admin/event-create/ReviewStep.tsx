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
    <div className="space-y-6">
      <Card className="p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-silver-50">Resumen y confirmación</h2>
          <p className="text-xs text-silver-400">
            Revisa los detalles configurados antes de crear el evento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Información */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Información</h3>
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
                <span className="font-semibold text-silver-100">{draft.capacity || '0'} personas</span>
              </div>
            </div>
          </div>

          {/* 2. Plan financiero */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Plan financiero</h3>
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
              <div className="flex justify-between">
                <span className="text-silver-400">Precio total base:</span>
                <span className="font-semibold text-silver-100 font-sans">${draft.baseAmount || '0'}</span>
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
                  <span className="font-semibold text-silver-100 font-sans">${draft.initialPaymentAmount || '0'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-silver-400">Periodo de gracia:</span>
                <span className="font-semibold text-silver-100">{draft.gracePeriodDays || '0'} días</span>
              </div>
            </div>

            {/* Calendario de pagos */}
            <div className="space-y-2 pt-2 border-t border-silver-800/80">
              <h4 className="text-xs font-bold text-silver-100">Calendario de pagos</h4>
              {draft.installments.length === 0 ? (
                <p className="text-xs text-silver-400">Sin mensualidades</p>
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

          {/* 3. Fechas límite */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Fechas límite</h3>
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
                <span className="text-silver-400">Lugares:</span>
                <span className="font-semibold text-silver-100">{draft.placesDeadline || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Cambio de mesa:</span>
                <span className="font-semibold text-silver-100">{draft.tableChangeDeadline || 'Sin definir'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Platillos:</span>
                <span className="font-semibold text-silver-100">{draft.mealsDeadline || 'Sin definir'}</span>
              </div>
            </div>
          </div>

          {/* 4. Termo */}
          <div className="p-5 bg-obsidian-900 rounded-card border border-silver-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-silver-100">Termo</h3>
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
                <span className="text-silver-400">Porcentaje de desbloqueo:</span>
                <span className="font-semibold text-silver-100 font-sans">{draft.thermoThresholdPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
