import React from 'react';
import { Card, Badge, Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../../design-system';

import { mockMealOptions } from '../../fixtures';

export const AdminEventMealsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Control y Comandas de Platillos</h2>
          <p className="text-xs text-content-secondary">
            Consolidado general de selección de menús para el banquete del evento.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Tradicional</span>
          <p className="text-xl font-bold text-navy-900 mt-1">68 Platillos</p>
          <span className="text-xs text-content-muted">Menú principal estándar</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Vegetariano</span>
          <p className="text-xl font-bold text-navy-900 mt-1">12 Platillos</p>
          <span className="text-xs text-content-muted">Basado en plantas y lácteos</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Vegano</span>
          <p className="text-xl font-bold text-navy-900 mt-1">8 Platillos</p>
          <span className="text-xs text-content-muted">100% de origen vegetal</span>
        </Card>
      </div>

      {/* Meals Table */}
      <Card>
        <div className="p-4 border-b border-surface-low flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Opciones de Platillo Aprobadas</h3>
          <Badge variant="primary" size="sm">3 Opciones Oficiales</Badge>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Opción de Menú</TableHeader>
              <TableHeader>Descripción</TableHeader>
              <TableHeader>Total Requerido</TableHeader>
              <TableHeader className="text-right">Estatus</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockMealOptions.map((opt) => (
              <TableRow key={opt.id}>
                <TableCell className="font-bold text-navy-900">{opt.name}</TableCell>
                <TableCell className="text-xs text-content-secondary">{opt.description}</TableCell>
                <TableCell className="font-semibold text-navy-900">
                  {opt.name === 'Tradicional' ? '68' : opt.name === 'Vegetariano' ? '12' : '8'} raciones
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="success" size="sm">
                    Activo
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
