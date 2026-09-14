import { useEffect, useRef, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Rect, Stage, Text } from 'react-konva';
import { Button } from '../../design-system';
import { tableAppearance, type DisplayTable, type SeatingTemplate } from '../../services/seating/presetSeatingTypes';

interface Props {
  template: SeatingTemplate;
  tables: DisplayTable[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}
export function PresetSeatingCanvas({ template, tables, selectedId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 700, height: 620 });
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width && rect.height) setSize({ width: rect.width, height: rect.height });
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  useEffect(() => {
    const asset = new window.Image();
    asset.onload = () => { setImage(asset); setImageFailed(false); };
    asset.onerror = () => setImageFailed(true);
    asset.src = template.background;
    return () => { asset.onload = null; asset.onerror = null; };
  }, [template.background]);
  const fit = Math.min((size.width - 24) / template.width, (size.height - 24) / template.height);
  const scale = fit * view.zoom;
  const x = (size.width - template.width * scale) / 2 + view.x;
  const y = (size.height - template.height * scale) / 2 + view.y;
  const zoom = (delta: number) => setView(current => ({ ...current, zoom: Math.max(1, Math.min(5, current.zoom + delta)) }));
  const focusTable = (table: DisplayTable) => {
    // Keyboard selection also brings the physical table into view at a legible scale.
    const nextZoom = Math.max(2.5, view.zoom);
    const nextScale = fit * nextZoom;
    setView({ zoom: nextZoom, x: (0.5 - table.x) * template.width * nextScale, y: (0.5 - table.y) * template.height * nextScale });
  };
  return <section aria-label="Croquis del salón" className="min-w-0 space-y-2">
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-silver-300">{template.name}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="min-h-11 min-w-11" aria-label="Alejar croquis" disabled={view.zoom <= 1} onClick={() => zoom(-0.5)}>−</Button>
        <Button variant="ghost" size="sm" className="min-h-11 min-w-11" aria-label="Acercar croquis" disabled={view.zoom >= 5} onClick={() => zoom(0.5)}>+</Button>
        <Button variant="secondary" size="sm" onClick={() => setView({ zoom: 1, x: 0, y: 0 })}>Ver todo</Button>
      </div>
    </div>
    <div ref={container} style={{ aspectRatio: `${template.width} / ${template.height}` }} className="relative w-full min-w-0 min-h-[300px] max-h-[680px] overflow-hidden rounded-xl bg-[#0c121b]" data-testid="preset-canvas">
      <div aria-hidden="true">
        <Stage width={size.width} height={size.height} scaleX={scale} scaleY={scale} x={x} y={y} draggable
          onDragEnd={event => { if (event.target === event.target.getStage()) setView(current => ({ ...current,
            x: event.target.x() - (size.width - template.width * scale) / 2,
            y: event.target.y() - (size.height - template.height * scale) / 2 })); }}>
          <Layer listening={false}>
            <Rect width={template.width} height={template.height} fill="#111923" />
            {image && <KonvaImage image={image} width={template.width} height={template.height} />}
            {tables.map(table => {
              const style = tableAppearance(table);
              const w = table.width * template.width, h = table.height * template.height;
              const selected = table.id === selectedId;
              return <Group key={table.id} x={table.x * template.width} y={table.y * template.height}>
                {selected && (table.shape === 'ROUND' ?
                  <Circle radius={Math.min(w, h) / 2 + 7} stroke="#e8c677" strokeWidth={3} /> :
                  <Rect x={-w / 2 - 7} y={-h / 2 - 7} width={w + 14} height={h + 14} cornerRadius={6} stroke="#e8c677" strokeWidth={3} />)}
                {table.shape === 'ROUND' ? <Circle radius={Math.min(w, h) / 2} fill={style.fill} stroke={style.color} strokeWidth={2} /> :
                  <Rect x={-w / 2} y={-h / 2} width={w} height={h} cornerRadius={4} fill={style.fill} stroke={style.color} strokeWidth={2} />}
                <Text x={-w / 2} y={-10} width={w} text={table.label} fontSize={23} fontFamily="Inter, Arial, sans-serif" align="center" fill="#f1f5f9" />
                {table.capacity !== null && <Text x={-w / 2 - 18} y={h / 2 + 9} width={w + 36} text={style.short} fontSize={17} align="center" fill={style.color} />}
              </Group>;
            })}
          </Layer>
        </Stage>
      </div>
      <div className="pointer-events-none absolute inset-0" role="group" aria-label="Mesas del evento">
        {tables.map(table => <button key={table.id} type="button"
          id={`seating-table-${table.id}`}
          aria-label={`Mesa ${table.label} · ${tableAppearance(table).label}`}
          aria-pressed={table.id === selectedId}
          data-testid={`preset-table-${table.label}`}
          className="pointer-events-auto absolute rounded-sm border-0 bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
          style={{ left: x + table.x * template.width * scale, top: y + table.y * template.height * scale,
            width: Math.max(24, table.width * template.width * scale), height: Math.max(24, table.height * template.height * scale), transform: 'translate(-50%, -50%)' }}
          onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') focusTable(table); }}
          onFocus={event => { if (event.currentTarget.matches(':focus-visible')) focusTable(table); }}
          onClick={() => onSelect(table.id)} />)}
      </div>
    </div>
    {imageFailed && <p role="alert" className="text-xs text-amber-200">No se pudo cargar el fondo del salón. Las mesas siguen disponibles en la lista.</p>}
    <p className="text-xs text-silver-400">Amplía para ver las mesas con detalle. Arrastra el plano para recorrerlo.</p>
  </section>;
}
