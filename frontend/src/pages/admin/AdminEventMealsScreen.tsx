import React from 'react';
import { Card, Badge, Button, Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../../design-system';
import { mockMealOptions } from '../../fixtures';


export const AdminEventMealsScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Panel de Platillos y Menús</h2>
          <p className="text-xs text-content-secondary">
            Conteo para el servicio de banquetes y requerimientos especiales.
          </p>
        </div>
        <Button variant="gold" size="sm" iconStart="download">
          Exportar Comanda a Cocina
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Filete Mignon</span>
          <p className="text-2xl font-bold text-navy-900 mt-1">112 platillos</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Salmón Glaseado</span>
          <p className="text-2xl font-bold text-navy-900 mt-1">54 platillos</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Menú Infantil</span>
          <p className="text-2xl font-bold text-navy-900 mt-1">18 platillos</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-content-muted font-semibold">Menú Vegano</span>
          <p className="text-2xl font-bold text-navy-900 mt-1">6 platillos</p>
        </Card>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Platillo</TableHeader>
            <TableHeader>Tipo</TableHeader>
            <TableHeader>Descripción</TableHeader>
            <TableHeader className="text-right">Total Solicitados</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockMealOptions.map((dish) => (
            <TableRow key={dish.id}>
              <TableCell className="font-semibold text-navy-900">{dish.name}</TableCell>
              <TableCell>
                <Badge variant={dish.type === 'ADULT' ? 'primary' : 'gold'} size="sm">
                  {dish.type}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-content-secondary max-w-md truncate">
                {dish.description}
              </TableCell>
              <TableCell className="text-right font-bold text-navy-900">
                {dish.type === 'ADULT' ? 112 : 18}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
