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
  onTableMove: (tableId: string, x: number, y: number) => void;
  backgroundImageUrl?: string | null;
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
      className="relative w-full h-[620px] bg-[#EEF1F6] rounded-2xl border border-surface-high overflow-hidden select-none flex items-center justify-center shadow-inner"
    >
      {/* Visual Canvas Grid Background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Zoom & View Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl border border-surface-high shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-900 hover:bg-surface-low transition-colors"
          title="Acercar (+)"
          aria-label="Acercar zoom"
        >
          <Icon name="plus" size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-navy-900 hover:bg-surface-low transition-colors font-bold text-base"
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
        <div className="h-4 w-px bg-surface-high mx-1" />
        <button
          type="button"
          onClick={handleResetView}
          className="px-2.5 h-8 flex items-center gap-1 rounded-lg text-xs font-semibold text-navy-900 hover:bg-surface-low transition-colors"
          title="Centrar vista"
          aria-label="Restablecer vista"
        >
          <span>{Math.round(scale * 100)}%</span>
        </button>
      </div>

      {/* Floating Legend with Natural Spanish labels */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-surface-high shadow-md flex items-center gap-4 text-xs font-medium">
        <span className="text-content-secondary font-bold text-[11px] uppercase tracking-wider">
          Leyenda:
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#D0D5DD]" />
          <span className="text-content-secondary">Disponible (0%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#FFF8E1] border-2 border-[#D97706]" />
          <span className="text-amber-800">Parcial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#031636] border-2 border-[#031636]" />
          <span className="text-navy-900 font-semibold">Completa (100%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#FFEBEE] border-2 border-[#9A2A2A]" />
          <span className="text-rose-700">Bloqueada</span>
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
            fill="#FFFFFF"
            cornerRadius={16}
            shadowColor="#64748B"
            shadowBlur={16}
            shadowOpacity={0.08}
            stroke="#CBD5E1"
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

          {/* Stage Area Guide */}
          <Group x={CANVAS_WIDTH / 2 - 140} y={35}>
            <Rect
              width={280}
              height={44}
              fill="#F1F5F9"
              cornerRadius={8}
              stroke="#CBD5E1"
              strokeWidth={1}
              dash={[5, 5]}
            />
            <Text
              x={0}
              y={14}
              width={280}
              text="Pista de Baile / Escenario Principal"
              fontSize={11}
              fontFamily="Inter, sans-serif"
              fontStyle="bold"
              fill="#64748B"
              align="center"
            />
          </Group>
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
            let fillColor = '#FFFFFF';
            let strokeColor = '#D0D5DD';
            let labelColor = '#141C28';
            let statsColor = '#667085';

            if (isBlocked) {
              fillColor = '#FFEBEE';
              strokeColor = '#9A2A2A';
              labelColor = '#9A2A2A';
              statsColor = '#9A2A2A';
            } else if (isFull) {
              fillColor = '#031636';
              strokeColor = '#031636';
              labelColor = '#FFFFFF';
              statsColor = '#94A3B8';
            } else if (isPartial) {
              fillColor = '#FFF8E1';
              strokeColor = '#D97706';
              labelColor = '#745C00';
              statsColor = '#745C00';
            }

            return (
              <Group
                key={table.id}
                x={pos.x}
                y={pos.y}
                draggable
                onDragEnd={(e) => {
                  e.cancelBubble = true;
                  const newCanvasPoint = { x: e.target.x(), y: e.target.y() };
                  const norm = toNormalizedCoords(newCanvasPoint, CANVAS_WIDTH, CANVAS_HEIGHT);
                  onTableMove(table.id, norm.x, norm.y);
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
                        stroke="#031636"
                        strokeWidth={2}
                        dash={[4, 4]}
                        opacity={0.7}
                      />
                    ) : (
                      <Circle
                        radius={TABLE_RADIUS + 6}
                        stroke="#031636"
                        strokeWidth={2}
                        dash={[4, 4]}
                        opacity={0.7}
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
                    stroke={isSelected ? '#031636' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="#031636"
                    shadowBlur={isSelected ? 10 : 4}
                    shadowOpacity={isSelected ? 0.3 : 0.08}
                  />
                ) : (
                  <Circle
                    radius={TABLE_RADIUS}
                    fill={fillColor}
                    stroke={isSelected ? '#031636' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="#031636"
                    shadowBlur={isSelected ? 10 : 4}
                    shadowOpacity={isSelected ? 0.3 : 0.08}
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
