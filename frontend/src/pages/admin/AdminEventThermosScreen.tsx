import React from 'react';
import { Badge, Button, Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../../design-system';
import { mockGraduatesList } from '../../fixtures';


export const AdminEventThermosScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Producción de Termos</h2>
          <p className="text-xs text-content-secondary">
            Lista de graduados, textos personalizados para grabado y control de entrega.
          </p>
        </div>
        <Button variant="gold" size="sm" iconStart="download">
          Exportar Lista para Taller de Grabado
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Graduado</TableHeader>
            <TableHeader>Texto de Grabado</TableHeader>
            <TableHeader>Tipografía</TableHeader>
            <TableHeader>Estado de Entrega</TableHeader>
            <TableHeader className="text-right">Acción</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockGraduatesList.map((grad) => {
            const thermo = grad.thermoCustomization;

            return (
              <TableRow key={grad.id}>
                <TableCell className="font-semibold text-navy-900">{grad.fullName}</TableCell>
                <TableCell className="font-mono text-xs">
                  {thermo?.text || <span className="text-content-muted italic">Pendiente de captura</span>}
                </TableCell>
                <TableCell className="text-xs">
                  {thermo?.fontFamily || 'Inter'}
                </TableCell>
                <TableCell>
                  <Badge variant={thermo?.delivered ? 'success' : 'neutral'} dot size="sm">
                    {thermo?.delivered ? 'Entregado' : 'En Espera'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    {thermo?.delivered ? 'Marcar Pendiente' : 'Registrar Entrega'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
