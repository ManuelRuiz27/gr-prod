import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Image as KonvaImage } from 'react-konva';
import { Button, Modal, Badge, Icon } from '../../../design-system';
import type { DetectedTableItem } from '../../../services/seating/seatingDetectionService';

export interface FloorplanDetectionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundDataUrl: string;
  initialTables: DetectedTableItem[];
  onConfirmImport: (tables: DetectedTableItem[], replaceExisting: boolean) => Promise<void>;
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 650;

export const FloorplanDetectionReviewModal: React.FC<FloorplanDetectionReviewModalProps> = ({
  isOpen,
  onClose,
  backgroundDataUrl,
  initialTables,
  onConfirmImport,
}) => {
  const [tables, setTables] = useState<DetectedTableItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchCapacity, setBatchCapacity] = useState<number>(10);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTables([...initialTables]);
      setSelectedId(initialTables[0]?.id || null);
    }
  }, [isOpen, initialTables]);

  useEffect(() => {
    if (!backgroundDataUrl) return;
    const img = new window.Image();
    img.src = backgroundDataUrl;
    img.onload = () => setBgImage(img);
  }, [backgroundDataUrl]);

  const selectedTable = tables.find((t) => t.id === selectedId) || null;

  const handleUpdateSelected = (patch: Partial<DetectedTableItem>) => {
    if (!selectedId) return;
    setTables((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, ...patch } : t))
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setTables((prev) => prev.filter((t) => t.id !== selectedId));
    setSelectedId(null);
  };

  const handleAddTable = () => {
    const nextNum = tables.length + 1;
    const newTable: DetectedTableItem = {
      id: `manual-${Date.now()}`,
      label: `M-${nextNum}`,
      capacity: batchCapacity,
      shape: 'ROUND',
      position_x: 0.5,
      position_y: 0.5,
      width: 0.08,
      height: 0.08,
      confidence: 1.0,
    };
    setTables((prev) => [...prev, newTable]);
    setSelectedId(newTable.id);
  };

  const handleApplyBatchCapacity = () => {
    setTables((prev) => prev.map((t) => ({ ...t, capacity: batchCapacity })));
  };

  const handleDragEnd = (id: string, e: any) => {
    const node = e.target;
    const normX = Math.max(0.01, Math.min(0.95, Number((node.x() / CANVAS_WIDTH).toFixed(4))));
    const normY = Math.max(0.01, Math.min(0.95, Number((node.y() / CANVAS_HEIGHT).toFixed(4))));
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, position_x: normX, position_y: normY } : t))
    );
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmImport(tables, replaceExisting);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <span>Revisión de Detección Automática de Mesas</span>
          <Badge variant="info" size="sm">
            OCR & Computer Vision
          </Badge>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Banner Instrucciones */}
        <div className="flex items-center justify-between bg-obsidian-950/80 p-3 rounded-xl border border-silver-800/80 text-xs">
          <div className="flex items-center gap-2 text-silver-300">
            <Icon name="info" className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Revisa las cajas detectadas. Puedes <strong>arrastrar</strong> para ajustar posición,
              hacer clic para editar etiqueta/capacidad, o eliminar falsos positivos.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleAddTable}>
              + Agregar mesa
            </Button>
            <div className="flex items-center gap-1 bg-obsidian-900 px-2 py-1 rounded-lg border border-silver-800">
              <span className="text-silver-400 text-[11px]">Asignar</span>
              <input
                type="number"
                min="1"
                max="50"
                value={batchCapacity}
                onChange={(e) => setBatchCapacity(Number(e.target.value))}
                className="w-10 bg-transparent text-center font-bold text-silver-200 border-none outline-none p-0 text-xs"
              />
              <span className="text-silver-400 text-[11px]">a todas</span>
              <button
                onClick={handleApplyBatchCapacity}
                className="text-[11px] text-gold-400 hover:text-gold-300 ml-1 font-semibold underline"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        {/* Workspace: Konva Stage + Inspector Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas Viewport */}
          <div className="lg:col-span-3 bg-obsidian-950 rounded-xl border border-silver-800 overflow-hidden relative flex items-center justify-center min-h-[460px]">
            <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} scaleX={0.7} scaleY={0.7}>
              <Layer>
                {/* Background Floorplan */}
                {bgImage && (
                  <KonvaImage
                    image={bgImage}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    opacity={0.85}
                  />
                )}

                {/* Detected Tables Overlay */}
                {tables.map((table) => {
                  const x = table.position_x * CANVAS_WIDTH;
                  const y = table.position_y * CANVAS_HEIGHT;
                  const w = Math.max(48, table.width * CANVAS_WIDTH);
                  const h = Math.max(48, table.height * CANVAS_HEIGHT);
                  const isSelected = table.id === selectedId;

                  const strokeColor = isSelected ? '#f59e0b' : '#06b6d4';
                  const fillColor = isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(6, 182, 212, 0.20)';

                  return (
                    <Group
                      key={table.id}
                      x={x}
                      y={y}
                      draggable
                      onClick={() => setSelectedId(table.id)}
                      onTap={() => setSelectedId(table.id)}
                      onDragEnd={(e) => handleDragEnd(table.id, e)}
                    >
                      {table.shape === 'ROUND' ? (
                        <Circle
                          radius={w / 2}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 3 : 2}
                        />
                      ) : (
                        <Rect
                          x={-w / 2}
                          y={-h / 2}
                          width={w}
                          height={h}
                          cornerRadius={6}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 3 : 2}
                        />
                      )}
                      {/* Label Text */}
                      <Text
                        text={table.label}
                        fontSize={14}
                        fontStyle="bold"
                        fill="#ffffff"
                        align="center"
                        verticalAlign="middle"
                        offsetX={20}
                        offsetY={12}
                        width={40}
                        height={16}
                      />
                      {/* Capacity Badge */}
                      <Text
                        text={`${table.capacity}p`}
                        fontSize={10}
                        fill="#94a3b8"
                        align="center"
                        verticalAlign="middle"
                        offsetX={20}
                        offsetY={-4}
                        width={40}
                        height={12}
                      />
                    </Group>
                  );
                })}
              </Layer>
            </Stage>
          </div>

          {/* Inspector Panel */}
          <div className="bg-obsidian-900 p-4 rounded-xl border border-silver-800 flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-silver-400 uppercase tracking-wider">
              Propiedades de la Mesa
            </h4>

            {selectedTable ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[11px] text-silver-400 block mb-1">
                    Número / Etiqueta
                  </label>
                  <input
                    type="text"
                    value={selectedTable.label}
                    onChange={(e) => handleUpdateSelected({ label: e.target.value })}
                    className="w-full bg-obsidian-950 border border-silver-700 rounded-lg px-2.5 py-1.5 text-xs text-silver-100 focus:border-gold-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-silver-400 block mb-1">
                    Capacidad (lugares)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={selectedTable.capacity}
                    onChange={(e) =>
                      handleUpdateSelected({ capacity: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full bg-obsidian-950 border border-silver-700 rounded-lg px-2.5 py-1.5 text-xs text-silver-100 focus:border-gold-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-silver-400 block mb-1">Forma</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateSelected({ shape: 'ROUND' })}
                      className={`px-2 py-1.5 text-xs rounded-lg border flex items-center justify-center gap-1.5 ${
                        selectedTable.shape === 'ROUND'
                          ? 'bg-gold-500/10 border-gold-500 text-gold-400 font-semibold'
                          : 'bg-obsidian-950 border-silver-700 text-silver-400'
                      }`}
                    >
                      Redonda
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSelected({ shape: 'SQUARE' })}
                      className={`px-2 py-1.5 text-xs rounded-lg border flex items-center justify-center gap-1.5 ${
                        selectedTable.shape === 'SQUARE'
                          ? 'bg-gold-500/10 border-gold-500 text-gold-400 font-semibold'
                          : 'bg-obsidian-950 border-silver-700 text-silver-400'
                      }`}
                    >
                      Cuadrada
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-silver-500 pt-2 border-t border-silver-800">
                  <span>Confianza OCR: </span>
                  <span className="text-silver-300 font-medium">
                    {Math.round((selectedTable.confidence || 0.8) * 100)}%
                  </span>
                </div>

                <div className="pt-3 border-t border-silver-800">
                  <Button
                    size="sm"
                    variant="danger"
                    className="w-full"
                    onClick={handleDeleteSelected}
                  >
                    Eliminar mesa detectada
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-silver-500 text-center py-8">
                Haz clic en una mesa del croquis para ver o editar sus propiedades.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between w-full border-t border-silver-800/80 pt-4 mt-2">
          <div className="flex items-center gap-4 text-xs text-silver-400">
            <span>
              Mesas: <strong className="text-silver-100">{tables.length}</strong>
            </span>
            <span>•</span>
            <span>
              Capacidad total: <strong className="text-gold-400">{totalSeats} lugares</strong>
            </span>
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="rounded border-silver-700 bg-obsidian-800 text-gold-500 focus:ring-gold-500"
              />
              <span className="text-xs text-silver-300">Reemplazar mesas existentes</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isSubmitting}
              disabled={tables.length === 0}
            >
              Confirmar e Importar ({tables.length})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
