import data from '../../assets/seating/taller-2560.v1.json';
import background from '../../assets/seating/taller-2560.svg';
import type { SeatingTemplate } from './presetSeatingTypes';

// Bundled assets only. Never resolve server-supplied SVG/HTML as executable content.
export const defaultSeatingTemplate: SeatingTemplate = { ...data, background, tables: data.tables.map(table => {
  if (table.shape !== 'SQUARE' && table.shape !== 'ROUND') throw new Error('Forma de mesa no compatible.');
  return { ...table, shape: table.shape };
}) };
export function resolveSeatingTemplate(id: string, version: number): SeatingTemplate {
  if (id !== defaultSeatingTemplate.id || version !== defaultSeatingTemplate.version) {
    throw new Error('La versión de este croquis no está disponible. Actualiza la página.');
  }
  return defaultSeatingTemplate;
}
