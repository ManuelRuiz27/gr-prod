import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Image as KonvaImage } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import {
  type SeatingTableViewModel,
  toCanvasCoords,
  toNormalizedCoords,
  calculateTableOccupancy,
} from './seatingCoordinates';
import { Icon } from '../../../design-system';

export interface SeatingMapCanvasProps {
  tables: SeatingTableViewModel[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string | null) => void;
  onTableMove?: (tableId: string, x: number, y: number) => void;
  backgroundImageUrl?: string | null;
  mode?: 'admin' | 'graduate';
}

const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 700;
const TABLE_SIZE = 76;
const TABLE_RADIUS = 38;

export const SeatingMapCanvas: React.FC<SeatingMapCanvasProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onTableMove,
  backgroundImageUrl,
  mode = 'admin',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Load background image when URL changes
  useEffect(() => {
    let isMounted = true;
    if (backgroundImageUrl) {
      const img = new window.Image();
      img.src = backgroundImageUrl;
      img.onload = () => {
        if (isMounted) {
          setBgImage(img);
        }
      };
    }
    return () => {
      isMounted = false;
    };
  }, [backgroundImageUrl]);

  const activeBgImage = backgroundImageUrl ? bgImage : null;

  // Zoom handlers
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
    // If clicked on stage background or background rect, deselect
    if (e.target === e.target.getStage() || e.target.name() === 'canvas-bg') {
      onSelectTable(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] bg-obsidian-950 rounded-2xl border border-silver-800/80 overflow-hidden select-none flex items-center justify-center shadow-inner"
    >
      {/* Visual Canvas Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Zoom & View Controls */}
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

      {/* Floating Legend with Natural Spanish labels */}
      <div className="absolute bottom-4 left-4 z-20 bg-obsidian-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-silver-800 shadow-md flex items-center gap-4 text-xs font-medium text-silver-300">
        <span className="text-silver-400 font-bold text-[11px] uppercase tracking-wider">
          Leyenda:
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-obsidian-800 border-2 border-silver-600" />
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
      </div>

      {/* Main Konva Stage */}
      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onDragEnd={(e) => {
          // If dragging stage itself
          if (e.target === e.target.getStage()) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ cursor: 'grab' }}
      >
        {/* Background Layer */}
        <Layer>
          {/* Main Floor Surface Area */}
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

          {/* Reference Image if loaded */}
          {activeBgImage && (
            <KonvaImage
              image={activeBgImage}
              x={30}
              y={30}
              width={CANVAS_WIDTH - 60}
              height={CANVAS_HEIGHT - 60}
              opacity={0.35}
              listening={false}
            />
          )}
        </Layer>

        {/* Tables Layer */}
        <Layer>
          {tables.map((table) => {
            const isSelected = table.id === selectedTableId;
            const stats = calculateTableOccupancy(table);
            const isBlocked = table.status === 'BLOCKED';
            const isFull = stats.isFull;
            const isPartial = !isBlocked && !isFull && stats.occupied > 0;

            const pos = toCanvasCoords({ x: table.x, y: table.y }, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Styling variables according to status
            let fillColor = '#1A2333';
            let strokeColor = '#4B5563';
            let labelColor = '#F3F4F6';
            let statsColor = '#9CA3AF';

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

            const isDraggable = mode === 'admin';

            return (
              <Group
                key={table.id}
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
                onClick={(e) => {
                  e.cancelBubble = true;
                  onSelectTable(table.id);
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  onSelectTable(table.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection Halo Ring if selected */}
                {isSelected && (
                  <>
                    {table.shape === 'SQUARE' ? (
                      <Rect
                        x={-TABLE_SIZE / 2 - 6}
                        y={-TABLE_SIZE / 2 - 6}
                        width={TABLE_SIZE + 12}
                        height={TABLE_SIZE + 12}
                        cornerRadius={18}
                        stroke="#E5C158"
                        strokeWidth={2.5}
                        dash={[4, 4]}
                        opacity={0.9}
                      />
                    ) : (
                      <Circle
                        radius={TABLE_RADIUS + 6}
                        stroke="#E5C158"
                        strokeWidth={2.5}
                        dash={[4, 4]}
                        opacity={0.9}
                      />
                    )}
                  </>
                )}

                {/* Table Shape: SQUARE vs ROUND */}
                {table.shape === 'SQUARE' ? (
                  <Rect
                    x={-TABLE_SIZE / 2}
                    y={-TABLE_SIZE / 2}
                    width={TABLE_SIZE}
                    height={TABLE_SIZE}
                    cornerRadius={14}
                    fill={fillColor}
                    stroke={isSelected ? '#E5C158' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="#000000"
                    shadowBlur={isSelected ? 10 : 4}
                    shadowOpacity={isSelected ? 0.4 : 0.2}
                  />
                ) : (
                  <Circle
                    radius={TABLE_RADIUS}
                    fill={fillColor}
                    stroke={isSelected ? '#E5C158' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="#000000"
                    shadowBlur={isSelected ? 10 : 4}
                    shadowOpacity={isSelected ? 0.4 : 0.2}
                  />
                )}

                {/* Table Number */}
                <Text
                  x={-35}
                  y={-14}
                  width={70}
                  text={String(table.number)}
                  fontSize={16}
                  fontFamily="Inter, sans-serif"
                  fontStyle="bold"
                  fill={labelColor}
                  align="center"
                />

                {/* Table Occupancy info */}
                <Text
                  x={-35}
                  y={6}
                  width={70}
                  text={isBlocked ? 'Bloqueada' : `${stats.occupied}/${table.capacity}`}
                  fontSize={10}
                  fontFamily="Inter, sans-serif"
                  fontStyle={isBlocked ? 'italic' : 'bold'}
                  fill={statsColor}
                  align="center"
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Accessible visual element for tests & screen-readers */}
      <div className="sr-only" aria-label="Mesas del evento">
        {tables.map((t) => (
          <div
            key={t.id}
            data-testid={`table-node-${t.id}`}
            onClick={() => onSelectTable(t.id)}
          >
            <span>Mesa {t.number}</span>
            <span>{t.shape === 'SQUARE' ? 'Cuadrada' : 'Circular'}</span>
            <span>Capacidad: {t.capacity}</span>
            <span>Ocupados: {t.occupied}</span>
            <span>Disponibles: {t.available}</span>
            <span>Estado: {t.status === 'BLOCKED' ? 'Bloqueada' : 'Disponible'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
