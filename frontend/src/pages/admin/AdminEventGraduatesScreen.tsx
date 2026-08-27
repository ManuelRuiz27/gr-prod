import React, { useState } from 'react';
import {
  Badge,
  Button,
  Input,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Modal,
} from '../../design-system';
import { mockGraduatesList, type GraduateMock } from '../../fixtures';

export const AdminEventGraduatesScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedGrad, setSelectedGrad] = useState<GraduateMock | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const filteredGrads = mockGraduatesList.filter((g) =>
    g.fullName.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-navy-900">Cartera de Graduados</h2>
          <p className="text-xs text-content-secondary">
            Gestión de participantes, asignación de lugares y estatus de termo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconStart="search"
            className="w-64"
          />
          <Button variant="primary" size="sm" iconStart="plus" onClick={() => setIsRegisterModalOpen(true)}>
            Registrar Graduado
          </Button>
        </div>
      </div>

      {/* Table of Graduates */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Graduado</TableHeader>
            <TableHeader>Correo</TableHeader>
            <TableHeader>Lugares</TableHeader>
            <TableHeader>Mesa</TableHeader>
            <TableHeader>Estado de Termo</TableHeader>
            <TableHeader className="text-right">Acción</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGrads.map((grad) => (
            <TableRow key={grad.id}>
              <TableCell className="font-semibold text-navy-900">
                <div className="flex flex-col">
                  <span>{grad.fullName}</span>
                  <span className="text-[11px] text-content-muted">{grad.career}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs">{grad.email}</span>
              </TableCell>
              <TableCell>
                <span className="font-bold text-navy-900">{grad.ticketCount} lugares</span>
              </TableCell>
              <TableCell>
                {grad.tableNumber ? (
                  <Badge variant="primary" size="sm">
                    Mesa {grad.tableNumber}
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Sin Asignar
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    grad.thermoStatus === 'DELIVERED'
                      ? 'success'
                      : grad.thermoStatus === 'IN_PRODUCTION'
                      ? 'warning'
                      : grad.thermoStatus === 'REQUESTED'
                      ? 'primary'
                      : grad.thermoStatus === 'AVAILABLE'
                      ? 'gold'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {grad.thermoStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => setSelectedGrad(grad)}>
                  Ver Detalle
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Graduate Detail Modal */}
      {selectedGrad && (
        <Modal
          isOpen={Boolean(selectedGrad)}
          onClose={() => setSelectedGrad(null)}
          title={`Expediente: ${selectedGrad.fullName}`}
          description={`Detalles del graduado y lista de integrantes asignados`}
          size="lg"
        >
          <div className="flex flex-col gap-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-surface-low rounded-2xl text-xs">
              <div className="flex flex-col">
                <span className="text-content-muted font-semibold">Carrera</span>
                <span className="text-sm font-bold text-navy-900">{selectedGrad.career}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-content-muted font-semibold">Lugares Contratados</span>
                <span className="text-sm font-bold text-navy-900">{selectedGrad.ticketCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-content-muted font-semibold">Mesa Asignada</span>
                <span className="text-sm font-bold text-navy-900">Mesa {selectedGrad.tableNumber}</span>
              </div>
            </div>

            {/* Guests List */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Integrantes del Grupo ({selectedGrad.guests.length} de {selectedGrad.ticketCount})
              </h4>
              {selectedGrad.guests.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedGrad.guests.map((gst, idx) => (
                    <div
                      key={gst.id}
                      className="p-3 bg-surface-lowest border border-surface-high rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900">#{idx + 1}</span>
                        <span>{gst.name}</span>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {gst.meal}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-content-muted italic">No hay integrantes registrados todavía.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-surface-low">
              <Button variant="primary" size="sm" onClick={() => setSelectedGrad(null)}>
                Cerrar Expediente
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Demo Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Registrar Graduado"
        description="Alta manual en la cartera de la generación"
      >
        <div className="flex flex-col gap-4">
          <Input label="Nombre Completo" placeholder="Ej. Roberto Sánchez" />
          <Input label="Correo Electrónico" placeholder="Ej. roberto@ejemplo.com" />
          <Input label="Lugares" placeholder="8" type="number" />
          <div className="flex justify-end gap-3 pt-3 border-t border-surface-low">
            <Button variant="secondary" onClick={() => setIsRegisterModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => setIsRegisterModalOpen(false)}>
              Guardar (Demo)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
