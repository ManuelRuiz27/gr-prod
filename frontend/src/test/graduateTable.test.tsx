import { act, fireEvent, render, screen, waitFor, within, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GraduateTableScreen } from '../pages/graduate/GraduateTableScreen';
import { previewSeatingGateway } from '../services/seating/presetSeatingGateway';
import { liveSeatingFixture, testSeatingGateway } from './fixtures/presetSeatingFixture';
import type { SeatingGateway } from '../services/seating/presetSeatingTypes';

function renderScreen(gateway: SeatingGateway = previewSeatingGateway) {
  return render(<MemoryRouter><GraduateTableScreen eventId="test-event" gateway={gateway} /></MemoryRouter>);
}
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('Graduate preset seating', () => {
  it('previews 100 tables without fabricated availability or mutations', async () => {
    const gateway = { ...previewSeatingGateway, save: vi.fn(previewSeatingGateway.save) };
    renderScreen(gateway);
    expect(await screen.findByText(/Vista previa: capacidades pendientes/)).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Mesas del evento' })).getAllByRole('button')).toHaveLength(100);
    fireEvent.click(screen.getByTestId('preset-table-24'));
    expect(screen.getByRole('button', { name: 'Confirmar lugares' })).toBeDisabled();
    expect(screen.queryByText(/lugares disponibles de/)).not.toBeInTheDocument();
    expect(gateway.save).not.toHaveBeenCalled();
  });
  it('searches the accessible list and handles no results', async () => {
    renderScreen();
    fireEvent.change(await screen.findByLabelText('Buscar mesa'), { target: { value: '100' } });
    const list = screen.getByLabelText('Listado de mesas');
    expect(within(list).getAllByRole('button')).toHaveLength(1);
    fireEvent.click(within(list).getByRole('button'));
    expect(screen.getByRole('heading', { name: 'Mesa 100' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Buscar mesa'), { target: { value: '999' } });
    expect(screen.getByText('No encontramos esa mesa.')).toBeInTheDocument();
  });
  it.each(['PAYMENT_REQUIRED', 'DEADLINE_CLOSED', 'EVENT_CLOSED', 'MEMBERSHIP_INACTIVE'] as const)('blocks editing when %s', async eligibility => {
    const snapshot = liveSeatingFixture(); snapshot.map.eligibility = eligibility;
    renderScreen(testSeatingGateway(snapshot));
    fireEvent.click(await screen.findByTestId('preset-table-1'));
    expect(screen.getByLabelText('Lugares en esta mesa')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Revisar distribución' })).toBeDisabled();
    if (eligibility === 'PAYMENT_REQUIRED') expect(screen.getByRole('link', { name: 'Ver pagos' })).toHaveAttribute('href', '/graduate/payments');
  });
  it('exposes partial, full, blocked and circular tables without hiding their state on selection', async () => {
    renderScreen(testSeatingGateway());
    fireEvent.click(await screen.findByTestId('preset-table-1'));
    expect(screen.getByTestId('preset-table-1')).toHaveAttribute('aria-label', 'Mesa 1 · 6 lugares disponibles de 15');
    expect(screen.getByTestId('preset-table-1')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByTestId('preset-table-2'));
    expect(screen.getByRole('button', { name: 'Agregar un lugar' })).toBeDisabled();
    fireEvent.click(screen.getByTestId('preset-table-3'));
    expect(screen.getByRole('button', { name: 'Agregar un lugar' })).toBeDisabled();
    fireEvent.click(screen.getByTestId('preset-table-4'));
    expect(screen.getByText('Mesa circular')).toBeInTheDocument();
  });
  it('rejects excessive quantities and protects identified members', async () => {
    renderScreen(testSeatingGateway());
    fireEvent.click(await screen.findByTestId('preset-table-1'));
    fireEvent.change(screen.getByLabelText('Lugares en esta mesa'), { target: { value: '99' } });
    expect(screen.getByRole('button', { name: 'Revisar distribución' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Lugares en esta mesa'), { target: { value: '0' } });
    expect(screen.getByRole('button', { name: 'Revisar distribución' })).toBeDisabled();
  });
  it('sends the complete quantity distribution only after explicit confirmation', async () => {
    let snapshot = liveSeatingFixture();
    const save = vi.fn(async () => {
      const next = structuredClone(snapshot);
      next.map.tables[3].occupied = 3; next.map.tables[3].available = 12;
      next.own!.allocations.push({ table_id: 'table-4', quantity: 3, named_quantity: 0 });
      next.own!.assigned_places = 5; next.own!.unassigned_places = 3; next.own!.version = 2;
      snapshot = next; return snapshot;
    });
    renderScreen({ mode: 'http', load: async () => snapshot, save });
    fireEvent.click(await screen.findByTestId('preset-table-4'));
    fireEvent.change(screen.getByLabelText('Lugares en esta mesa'), { target: { value: '3' } });
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByTestId('preset-table-4')).toHaveAttribute('aria-label', 'Mesa 4 · 15 lugares disponibles de 15');
    fireEvent.click(screen.getByRole('button', { name: 'Revisar distribución' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar lugares' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save.mock.calls[0]).toEqual(['test-event', { expected_version: 1, allocations: [{ table_id: 'table-1', quantity: 2 }, { table_id: 'table-4', quantity: 3 }] }, expect.any(String), expect.any(AbortSignal)]);
    expect(await screen.findByText('Tu distribución de lugares quedó confirmada.')).toBeInTheDocument();
    expect(screen.getByTestId('preset-table-4')).toHaveAttribute('aria-label', 'Mesa 4 · 12 lugares disponibles de 15');
  });
  it('refetches a capacity conflict, preserves confirmed places and requires a new review', async () => {
    let snapshot = liveSeatingFixture();
    const save = vi.fn(async () => {
      snapshot = structuredClone(snapshot); snapshot.map.tables[3].occupied = 15; snapshot.map.tables[3].available = 0;
      throw { response: { status: 409, data: { error: { code: 'TABLE_CAPACITY_CHANGED' } } } };
    });
    renderScreen({ mode: 'http', load: async () => snapshot, save });
    fireEvent.click(await screen.findByTestId('preset-table-4'));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar un lugar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Revisar distribución' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmar lugares' }));
    expect(await screen.findByText(/La disponibilidad cambió. Revisa/)).toBeInTheDocument();
    expect(screen.getByText('2 ubicados · 6 pendientes de ubicar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revisar distribución' })).toBeDisabled();
  });
  it('fails closed on load errors and retries', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValue(liveSeatingFixture());
    renderScreen({ ...testSeatingGateway(), load });
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByTestId('preset-table-1')).toBeInTheDocument();
  });
  it('polls every five seconds, pauses while hidden, refreshes on focus and cleans up', async () => {
    vi.useFakeTimers();
    const load = vi.fn(async () => liveSeatingFixture());
    const result = renderScreen({ ...testSeatingGateway(), load });
    await act(async () => {});
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(load).toHaveBeenCalledTimes(2);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(load).toHaveBeenCalledTimes(2);
    visibility.mockReturnValue('visible');
    await act(async () => { window.dispatchEvent(new Event('focus')); });
    expect(load).toHaveBeenCalledTimes(3);
    result.unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(load).toHaveBeenCalledTimes(3);
    visibility.mockRestore();
  });
});
