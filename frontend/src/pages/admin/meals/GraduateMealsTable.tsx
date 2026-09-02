import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Search } from '../../../design-system';
import type {
  GraduateMealViewModel,
  PersonMealRowViewModel,
} from './mealViewModel';

interface GraduateMealsTableProps {
  graduates: GraduateMealViewModel[];
  personRows?: PersonMealRowViewModel[];
  onViewDetail: (graduateId: string) => void;
  onModifyPerson?: (person: PersonMealRowViewModel) => void;
}

type FilterValue = 'all' | 'Seleccionado' | 'Pendiente' | 'Con información' | 'Sin información';

export const GraduateMealsTable: React.FC<GraduateMealsTableProps> = ({
  graduates,
  personRows = [],
  onViewDetail,
  onModifyPerson,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');

  const filteredPersonRows = useMemo(() => {
    return personRows.filter((p) => {
      const matchSearch =
        search.trim() === '' ||
        p.memberName.toLowerCase().includes(search.trim().toLowerCase()) ||
        p.graduateName.toLowerCase().includes(search.trim().toLowerCase()) ||
        p.contractFolio.toLowerCase().includes(search.trim().toLowerCase()) ||
        (p.mealName && p.mealName.toLowerCase().includes(search.trim().toLowerCase()));

      let matchFilter = true;
      if (filter === 'Seleccionado') {
        matchFilter = p.status === 'Seleccionado' || p.status === 'Override local';
      } else if (filter === 'Pendiente') {
        matchFilter = p.status === 'Pendiente';
      } else if (filter === 'Con información') {
        matchFilter = !!p.mealName;
      } else if (filter === 'Sin información') {
        matchFilter = !p.mealName;
      }

      return matchSearch && matchFilter;
    });
  }, [personRows, search, filter]);

  const filterOptions: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'Seleccionado', label: 'Con selección' },
    { value: 'Pendiente', label: 'Pendientes' },
  ];

  return (
    <Card className="bg-obsidian-850 border border-silver-800/80 font-sans p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-silver-800/80 bg-obsidian-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-silver-100">Selecciones por persona</h3>
          <Badge variant="neutral" size="sm">
            {personRows.length > 0 ? `${personRows.length} integrantes conocidos` : `${graduates.length} registros`}
          </Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Search */}
          <div className="min-w-[220px]">
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar persona, graduado o folio…"
            />
          </div>

          {/* Filters */}
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`h-9 px-3 rounded-full text-xs font-semibold border transition-colors ${
                filter === opt.value
                  ? 'bg-gold-500 text-obsidian-950 border-gold-500'
                  : 'bg-obsidian-900 text-silver-400 border-silver-800 hover:border-silver-700 hover:text-silver-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table: Person-Level */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-obsidian-900 text-[11px] font-semibold text-silver-400 uppercase tracking-wider border-b border-silver-800">
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Persona / Graduado</th>
              <th className="px-4 py-3">Tipo de persona</th>
              <th className="px-4 py-3">Platillo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-800/60 text-silver-200">
            {filteredPersonRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-silver-400">
                  No hay registros que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredPersonRows.map((person) => (
                <tr
                  key={person.id}
                  className="hover:bg-obsidian-800/50 transition-colors"
                  data-testid={`person-meal-row-${person.groupMemberId}`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-gold-400">
                    {person.contractFolio}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-silver-100 text-sm">
                        {person.memberName}
                      </span>
                      {person.memberName !== person.graduateName && (
                        <span className="text-[11px] text-silver-400">
                          Membresía: {person.graduateName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={person.isPrimary ? 'gold' : 'neutral'} size="sm">
                      {person.personType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {person.mealName ? (
                      <span className="font-medium text-silver-100 bg-obsidian-800 px-2.5 py-1 rounded-md border border-silver-700/80">
                        {person.mealName}
                      </span>
                    ) : (
                      <span className="text-silver-500 italic">Pendiente de selección</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {person.status === 'Override local' ? (
                        <Badge variant="warning" size="sm">Override local</Badge>
                      ) : person.status === 'Opción inactiva' ? (
                        <Badge variant="error" size="sm">Opción inactiva</Badge>
                      ) : person.status === 'Seleccionado' ? (
                        <Badge variant="success" size="sm">Seleccionado</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Pendiente</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewDetail(person.graduateId)}
                        iconEnd="chevron-right"
                      >
                        Ver detalle
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (onModifyPerson) {
                            onModifyPerson(person);
                          } else {
                            onViewDetail(person.graduateId);
                          }
                        }}
                        iconStart="edit"
                      >
                        Modificar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
