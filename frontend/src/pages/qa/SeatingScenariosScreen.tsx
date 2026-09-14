import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PresetSeatingWorkspace } from '../../components/seating/PresetSeatingWorkspace';
import { createSeatingScenarioGateway, seatingScenarios, type SeatingScenario } from '../../mocks/seatingQuantityScenarios';

export default function SeatingScenariosScreen() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('scenario') ?? 'preview';
  const scenario: SeatingScenario = Object.hasOwn(seatingScenarios, requested) ? requested as SeatingScenario : 'preview';
  const role = params.get('role') === 'admin' ? 'admin' : 'graduate';
  const gateway = useMemo(() => createSeatingScenarioGateway(scenario, 'qa-seating-event'), [scenario]);
  return <main className="min-h-screen bg-obsidian-950 px-4 py-6 text-silver-100 sm:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="space-y-3 border-b border-amber-300/30 pb-5" aria-label="Escenarios de prueba">
        <p className="text-sm font-semibold text-amber-200">Pruebas locales · capacidades y ocupaciones simuladas</p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="min-w-0 text-sm">Caso de uso<select aria-label="Caso de uso" className="mt-1 block max-w-full rounded-lg bg-obsidian-800 p-3" value={scenario}
            onChange={event => setParams({ scenario: event.target.value, role })}>
            {Object.entries(seatingScenarios).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></label>
          <label className="text-sm">Vista<select aria-label="Vista" className="mt-1 block rounded-lg bg-obsidian-800 p-3" value={role}
            onChange={event => setParams({ scenario, role: event.target.value })}><option value="graduate">Graduado</option><option value="admin">Administrador</option></select></label>
          <Link to="/graduate/table" className="py-3 text-sm text-gold-300 underline">Abrir croquis en vista previa</Link>
        </div>
        <p className="text-xs text-silver-400">Cada cambio de escenario reinicia sus datos. No se realizan pagos ni se guardan asignaciones reales.</p>
      </section>
      <PresetSeatingWorkspace key={`${scenario}:${role}`} eventId="qa-seating-event" role={role} gateway={gateway} />
    </div>
  </main>;
}
