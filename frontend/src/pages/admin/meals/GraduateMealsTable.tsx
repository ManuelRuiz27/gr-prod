import React, { useState, useMemo } from 'react';
import { Badge, Button, Search } from '../../../design-system';
import type { MealOptionMock } from '../../../fixtures/layoutFixtures';
import type {
  GraduateMealViewModel,
  PersonMealRowViewModel,
} from './mealViewModel';

export interface GraduateMealsTableProps {
  graduates?: GraduateMealViewModel[];
  personRows: PersonMealRowViewModel[];
  mealOptions?: (MealOptionMock | { id: string; name: string })[];
  onViewDetail?: (graduateId: string) => void;
  onModifyPerson?: (person: PersonMealRowViewModel) => void;
}

export const GraduateMealsTable: React.FC<GraduateMealsTableProps> = ({
  personRows = [],
  mealOptions = [],
  onModifyPerson,
  onViewDetail,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Derive counts dynamically from real personRows
  const totalCount = personRows.length;
  const pendingCount = useMemo(
    () => personRows.filter((p) => !p.mealName || p.status === 'Pendiente').length,
    [personRows]
  );

  // Dynamic filter chips derived strictly from configured event options
  const filterChips = useMemo(() => {
    const chips: { key: string; label: string; count: number }[] = [
      { key: 'all', label: 'Todos', count: totalCount },
      { key: 'pending', label: 'Pendientes', count: pendingCount },
    ];

    mealOptions.forEach((opt) => {
      const count = personRows.filter((p) => p.mealName === opt.name).length;
      chips.push({
        key: opt.name,
        label: opt.name,
        count,
      });
    });

    return chips;
  }, [totalCount, pendingCount, mealOptions, personRows]);

  // Filtered person rows
  const filteredPersonRows = useMemo(() => {
    return personRows.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        p.memberName.toLowerCase().includes(q) ||
        p.graduateName.toLowerCase().includes(q) ||
        p.contractFolio.toLowerCase().includes(q) ||
        (p.mealName && p.mealName.toLowerCase().includes(q));

      let matchFilter = true;
      if (selectedFilter === 'pending') {
        matchFilter = !p.mealName || p.status === 'Pendiente';
      } else if (selectedFilter !== 'all') {
        matchFilter = p.mealName === selectedFilter;
      }

      return matchSearch && matchFilter;
    });
  }, [personRows, search, selectedFilter]);

  const handleModify = (person: PersonMealRowViewModel) => {
    if (onModifyPerson) {
      onModifyPerson(person);
    } else if (onViewDetail) {
      onViewDetail(person.graduateId);
    }
  };

  return (
    <div className="font-sans space-y-4">
      {/* First Layer Controls: Search + Filter Chips */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="w-full sm:max-w-md">
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nombre o folio"
            aria-label="Buscar nombre o folio"
          />
        </div>

        {/* Dynamic Filter Chips */}
        <div
          role="group"
          aria-label="Filtros de platillos"
          className="flex items-center gap-2 flex-wrap"
        >
          {filterChips.map((chip) => {
            const isActive = selectedFilter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                aria-label={`${chip.label} (${chip.count})`}
                onClick={() => setSelectedFilter(chip.key)}
                className={`h-9 px-3.5 rounded-full text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gold-500 text-obsidian-950 border-gold-500 shadow-sm'
                    : 'bg-obsidian-900 text-silver-400 border-silver-800 hover:border-silver-700 hover:text-silver-200'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-obsidian-950/20 text-obsidian-950'
                      : 'bg-obsidian-800 text-silver-400'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredPersonRows.length === 0 && (
        <div className="p-8 text-center rounded-xl border border-silver-800/80 bg-obsidian-900/40 text-silver-400 text-sm">
          No se encontraron personas con los filtros aplicados.
        </div>
      )}

      {/* Desktop Dense Table (hidden on mobile) */}
      {filteredPersonRows.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-xl border border-silver-800/80 bg-obsidian-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-obsidian-900 text-[11px] font-semibold text-silver-400 uppercase tracking-wider border-b border-silver-800">
                <th className="px-4 py-3">Persona</th>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Platillo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silver-800/60 text-silver-200">
              {filteredPersonRows.map((person) => (
                <tr
                  key={person.id}
                  className="hover:bg-obsidian-800/50 transition-colors"
                  data-testid={`person-meal-row-${person.groupMemberId}`}
                >
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
                  <td className="px-4 py-3 font-mono font-medium text-silver-300">
                    {person.contractFolio}
                  </td>
                  <td className="px-4 py-3">
                    {person.mealName ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-obsidian-800 border border-silver-700/80 text-silver-100">
                        {person.mealName}
                      </span>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Pendiente
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleModify(person)}
                      iconStart="edit"
                    >
                      Modificar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Clean Vertical List (no cards, no horizontal scroll) */}
      {filteredPersonRows.length > 0 && (
        <div className="md:hidden divide-y divide-silver-800/60 border border-silver-800/80 rounded-xl bg-obsidian-900/60 overflow-hidden">
          {filteredPersonRows.map((person) => (
            <div
              key={person.id}
              className="p-4 flex items-center justify-between gap-3 hover:bg-obsidian-800/30 transition-colors"
              data-testid={`person-meal-mobile-${person.groupMemberId}`}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-bold text-silver-100 text-sm truncate">
                  {person.memberName}
                </span>
                <span className="text-xs text-silver-400 font-mono">
                  Folio {person.contractFolio}
                </span>
                {person.memberName !== person.graduateName && (
                  <span className="text-[11px] text-silver-400 truncate">
                    Membresía: {person.graduateName}
                  </span>
                )}
                <div className="mt-1">
                  {person.mealName ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-obsidian-800 border border-silver-700/80 text-silver-100">
                      {person.mealName}
                    </span>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Pendiente
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleModify(person)}
                iconStart="edit"
                className="shrink-0"
              >
                Modificar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

