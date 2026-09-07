import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import {
  type SeatingTableViewModel,
  toCanvasCoords,
  toNormalizedCoords,
  toCanvasDimensions,
  toNormalizedDimensions,
  calculateTableOccupancy,
} from './seatingCoordinates';
import { getTableStatusDescriptor, type SeatingTable } from '../../../services/seating';
import { Icon } from '../../../design-system';

export interface SeatingMapCanvasProps {
  tables: (SeatingTableViewModel | SeatingTable)[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string | null) => void;
  onTableMove?: (tableId: string, x: number, y: number) => void;
  onTableResize?: (tableId: string, x: number, y: number, width: number, height: number) => void;
  backgroundImageUrl?: string | null;
  mode?: 'admin' | 'graduate';
  currentGraduateId?: string;
  className?: string;
}

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 700;

export const SeatingMapCanvas: React.FC<SeatingMapCanvasProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onTableMove,
  onTableResize,
  backgroundImageUrl,
  mode = 'admin',
  currentGraduateId,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [loadedImage, setLoadedImage] = useState<{ url: string; img: HTMLImageElement } | null>(null);

  const bgImage = backgroundImageUrl && loadedImage?.url === backgroundImageUrl ? loadedImage.img : null;

  const trRef = useRef<Konva.Transformer | null>(null);
  const selectedNodeRef = useRef<Konva.Group | null>(null);

  // Cargar imagen de fondo si cambia
  useEffect(() => {
    if (!backgroundImageUrl) return;
    let isMounted = true;
    const img = new window.Image();
    img.src = backgroundImageUrl;
    img.onload = () => {
      if (isMounted) setLoadedImage({ url: backgroundImageUrl, img });
    };
    img.onerror = () => {
      if (isMounted) setLoadedImage(null);
    };
    return () => {
      isMounted = false;
    };
  }, [backgroundImageUrl]);

  // Conectar Transformer al nodo seleccionado en modo ADMIN
  useEffect(() => {
    if (mode === 'admin' && selectedTableId && trRef.current && selectedNodeRef.current) {
      trRef.current.nodes([selectedNodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedTableId, mode, tables]);

  // Controles de zoom
  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetView = () => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Si se hace clic sobre el fondo o el stage, deseleccionar
    if (e.target === e.target.getStage() || e.target.name() === 'canvas-bg') {
      onSelectTable(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[620px] bg-obsidian-950 rounded-2xl border border-silver-800/80 overflow-hidden select-none flex items-center justify-center shadow-inner ${className}`}
    >
      {/* Cuadrícula visual de fondo */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Controles flotantes de zoom y vista */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-obsidian-900/90 backdrop-blur-md p-1.5 rounded-xl border border-silver-800 shadow-md text-silver-100">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-silver-300 hover:bg-obsidian-800 hover:text-silver-100 transition-colors"
          title="Acercar (+)"
          aria-label="Acercar zoom"
        >
          <Icon name="plus" size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-silver-300 hover:bg-obsidian-800 hover:text-silver-100 transition-colors font-bold text-base"
          title="Alejar (-)"
          aria-label="Alejar zoom"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <div className="h-4 w-px bg-silver-800 mx-1" />
        <button
          type="button"
          onClick={handleResetView}
          className="px-2.5 h-8 flex items-center gap-1 rounded-lg text-xs font-semibold text-silver-300 hover:bg-obsidian-800 hover:text-silver-100 transition-colors"
          title="Centrar vista"
          aria-label="Restablecer vista"
        >
          <span>{Math.round(scale * 100)}%</span>
        </button>
      </div>

      {/* Leyenda multimodal con etiquetas en español normativo */}
      <div className="absolute bottom-4 left-4 z-20 bg-obsidian-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-silver-800 shadow-md flex items-center gap-4 text-xs font-medium text-silver-300 flex-wrap">
        <span className="text-silver-400 font-bold text-[11px] uppercase tracking-wider">
          Leyenda:
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-obsidian-800 border-2 border-emerald-500" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 border-2 border-amber-500" />
          <span className="text-amber-400">Parcial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-obsidian-900 border-2 border-silver-400" />
          <span className="text-silver-100 font-semibold">Completa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-status-error/20 border-2 border-status-error" />
          <span className="text-status-error">Bloqueada</span>
        </div>
        {mode === 'graduate' && (
          <div className="flex items-center gap-1.5 border-l border-silver-800 pl-3">
            <div className="w-3.5 h-3.5 rounded-full bg-gold-500/20 border-2 border-gold-400" />
            <span className="text-gold-400 font-semibold">Tu mesa</span>
          </div>
        )}
      </div>

      {/* Konva Stage */}
      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ cursor: 'grab' }}
      >
        {/* Layer 1: Fondo del salón */}
        <Layer>
          <Rect
            name="canvas-bg"
            x={20}
            y={20}
            width={CANVAS_WIDTH - 40}
            height={CANVAS_HEIGHT - 40}
            fill="#121824"
            cornerRadius={16}
            shadowColor="#000000"
            shadowBlur={16}
            shadowOpacity={0.3}
            stroke="#2E394B"
            strokeWidth={1}
          />

          {bgImage && (
            <KonvaImage
              image={bgImage}
              x={30}
              y={30}
              width={CANVAS_WIDTH - 60}
              height={CANVAS_HEIGHT - 60}
              opacity={0.35}
              listening={false}
            />
          )}
        </Layer>

        {/* Layer 2: Mesas interactivas */}
        <Layer>
          {tables.map((table) => {
            const isSelected = table.id === selectedTableId;
            const stats = calculateTableOccupancy(table);
            const isBlocked = table.status === 'BLOCKED';
            const isFull = stats.isFull;
            const isPartial = !isBlocked && !isFull && stats.occupied > 0;

            const isOwnTable =
              mode === 'graduate' &&
              currentGraduateId &&
              table.assignments?.some((a) => a.graduateId === currentGraduateId);

            // Posición y dimensiones normalizadas escaladas al canvas
            const pos = toCanvasCoords({ x: table.x, y: table.y }, CANVAS_WIDTH, CANVAS_HEIGHT);
            const dims = toCanvasDimensions(
              { width: table.width, height: table.height },
              CANVAS_WIDTH,
              CANVAS_HEIGHT,
              76
            );
            const halfW = dims.width / 2;
            const halfH = dims.height / 2;
            const radius = Math.round((dims.width + dims.height) / 4);

            // Estilos visuales derivados según reglas
            let fillColor = '#1A2333';
            let strokeColor = '#38A169'; // verde disponible
            let labelColor = '#F3F4F6';
            let statsColor = '#A0AEC0';

            if (isBlocked) {
              fillColor = '#3B151E';
              strokeColor = '#EF4444';
              labelColor = '#FCA5A5';
              statsColor = '#EF4444';
            } else if (isFull) {
              fillColor = '#0F172A';
              strokeColor = '#64748B';
              labelColor = '#CBD5E1';
              statsColor = '#64748B';
            } else if (isPartial) {
              fillColor = '#332612';
              strokeColor = '#F59E0B';
              labelColor = '#FCD34D';
              statsColor = '#F59E0B';
            }

            if (isOwnTable) {
              fillColor = '#2A2410';
              strokeColor = '#ECC94B';
              labelColor = '#FEFCBF';
              statsColor = '#ECC94B';
            }

            const isDraggable = mode === 'admin';
            const isSelectableForGraduate = mode === 'graduate' && !isBlocked && !isFull;
            const cursorStyle = mode === 'admin' ? 'pointer' : isSelectableForGraduate ? 'pointer' : 'not-allowed';

            return (
              <Group
                key={table.id}
                ref={isSelected ? selectedNodeRef : undefined}
                x={pos.x}
                y={pos.y}
                draggable={isDraggable}
                onDragEnd={(e) => {
                  e.cancelBubble = true;
                  if (onTableMove && isDraggable) {
                    const newCanvasPoint = { x: e.target.x(), y: e.target.y() };
                    const norm = toNormalizedCoords(newCanvasPoint, CANVAS_WIDTH, CANVAS_HEIGHT);
                    onTableMove(table.id, norm.x, norm.y);
                  }
                }}
                onTransformEnd={(e) => {
                  e.cancelBubble = true;
                  if (onTableResize && isDraggable) {
                    const node = e.target;
                    const scaleX = typeof node.scaleX === 'function' ? node.scaleX() : 1;
                    const scaleY = typeof node.scaleY === 'function' ? node.scaleY() : 1;
                    if (typeof node.scaleX === 'function') node.scaleX(1);
                    if (typeof node.scaleY === 'function') node.scaleY(1);

                    const newPixelW = dims.width * scaleX;
                    const newPixelH = dims.height * scaleY;
                    const normDim = toNormalizedDimensions(
                      { width: newPixelW, height: newPixelH },
                      CANVAS_WIDTH,
                      CANVAS_HEIGHT
                    );
                    const normPos = toNormalizedCoords(
                      { x: node.x(), y: node.y() },
                      CANVAS_WIDTH,
                      CANVAS_HEIGHT
                    );
                    onTableResize(table.id, normPos.x, normPos.y, normDim.width, normDim.height);
                  }
                }}
                onClick={(e) => {
                  e.cancelBubble = true;
                  onSelectTable(table.id);
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  onSelectTable(table.id);
                }}
                style={{ cursor: cursorStyle }}
              >
                {/* Halo de Selección */}
                {isSelected && (
                  <>
                    {table.shape === 'SQUARE' ? (
                      <Rect
                        x={-halfW - 6}
                        y={-halfH - 6}
                        width={dims.width + 12}
                        height={dims.height + 12}
                        cornerRadius={16}
                        stroke="#E5C158"
                        strokeWidth={2.5}
                        dash={[5, 4]}
                        opacity={0.95}
                      />
                    ) : (
                      <Circle
                        radius={radius + 6}
                        stroke="#E5C158"
                        strokeWidth={2.5}
                        dash={[5, 4]}
                        opacity={0.95}
                      />
                    )}
                  </>
                )}

                {/* Forma geométrica: Círculo (ROUND) vs Rectángulo (SQUARE) */}
                {table.shape === 'SQUARE' ? (
                  <Rect
                    x={-halfW}
                    y={-halfH}
                    width={dims.width}
                    height={dims.height}
                    cornerRadius={12}
                    fill={fillColor}
                    stroke={isSelected ? '#E5C158' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="#000000"
                    shadowBlur={isSelected ? 12 : 4}
                    shadowOpacity={isSelected ? 0.5 : 0.25}
                  />
                ) : (
                  <Circle
                    radius={radius}
                    fill={fillColor}
                    stroke={isSelected ? '#E5C158' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="#000000"
                    shadowBlur={isSelected ? 12 : 4}
                    shadowOpacity={isSelected ? 0.5 : 0.25}
                  />
                )}

                {/* Número / Etiqueta de la mesa */}
                <Text
                  x={-halfW}
                  y={-14}
                  width={dims.width}
                  text={String(table.number)}
                  fontSize={Math.max(12, Math.min(18, Math.round(dims.width / 5)))}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill={labelColor}
                  align="center"
                />

                {/* Subtítulo de capacidad y estado */}
                <Text
                  x={-halfW}
                  y={6}
                  width={dims.width}
                  text={
                    isBlocked
                      ? 'Bloqueada'
                      : isFull
                      ? 'Completa'
                      : `${stats.occupied}/${table.capacity}`
                  }
                  fontSize={Math.max(9, Math.min(12, Math.round(dims.width / 8)))}
                  fontFamily="Inter, sans-serif"
                  fontStyle={isBlocked || isFull ? 'italic' : 'bold'}
                  fill={statsColor}
                  align="center"
                />
              </Group>
            );
          })}

          {/* Transformer de redimensionamiento (Modo ADMIN) */}
          {mode === 'admin' && (
            <Transformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 40 || newBox.height < 40) {
                  return oldBox;
                }
                return newBox;
              }}
              rotateEnabled={false}
              borderStroke="#E5C158"
              borderDash={[3, 3]}
              anchorStroke="#E5C158"
              anchorFill="#1A2333"
              anchorSize={8}
              anchorCornerRadius={2}
            />
          )}
        </Layer>
      </Stage>

      {/* Nodos DOM accesibles para lectores de pantalla y tests unitarios */}
      <div className="sr-only" aria-label="Mesas del evento">
        {tables.map((t) => {
          const stats = calculateTableOccupancy(t);
          const descriptor = getTableStatusDescriptor(t as SeatingTable, t.id === selectedTableId);
          return (
            <div
              key={t.id}
              data-testid={`table-node-${t.id}`}
              role="button"
              tabIndex={0}
              aria-label={descriptor.accessibleText}
              aria-pressed={t.id === selectedTableId}
              onClick={() => onSelectTable(t.id)}
            >
              <span>Mesa {t.number}</span>
              <span>{t.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'}</span>
              <span>Capacidad: {t.capacity}</span>
              <span>Ocupados: {stats.occupied}</span>
              <span>Disponibles: {stats.available}</span>
              <span>Estado: {t.status === 'BLOCKED' ? 'Bloqueada' : stats.isFull ? 'Completa' : 'Disponible'}</span>
              <span>{descriptor.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
