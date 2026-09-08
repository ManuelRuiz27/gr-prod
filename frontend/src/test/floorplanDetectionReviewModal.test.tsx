import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FloorplanDetectionReviewModal } from '../pages/admin/tables/FloorplanDetectionReviewModal';
import type { DetectedTableItem } from '../services/seating/seatingDetectionService';

const geometryCandidate = (): DetectedTableItem => ({
  id: 'geometry-1',
  label: '',
  label_candidate: null,
  ocr_confidence: null,
  needs_review: true,
  label_source: 'none',
  capacity: 10,
  shape: 'SQUARE',
  position_x: 0.4,
  position_y: 0.45,
  width: 0.08,
  height: 0.06,
  geometry_confidence: 0.96,
  confidence: 0.96,
});
describe('FloorplanDetectionReviewModal', () => {
  it('separates geometric detection review from optional number recognition', async () => {
    const initial = geometryCandidate();
    const onRecognizeLabels = vi.fn().mockResolvedValue([
      {
        ...initial,
        label: '24',
        label_candidate: '24',
        ocr_confidence: 0.92,
        needs_review: false,
        label_source: 'ocr',
      },
    ]);

    render(
      <FloorplanDetectionReviewModal
        isOpen
        onClose={vi.fn()}
        backgroundDataUrl=""
        initialTables={[initial]}
        onRecognizeLabels={onRecognizeLabels}
        onCalibrate={vi.fn().mockResolvedValue([initial])}
        onConfirmImport={vi.fn().mockResolvedValue(undefined)}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/La geometría determina las mesas/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Reconocer números/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Usar como referencia/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Confirmar e Importar/i })).toBeDisabled();

    fireEvent.click(within(dialog).getByRole('button', { name: /Reconocer números/i }));

    await waitFor(() => expect(onRecognizeLabels).toHaveBeenCalledWith([initial]));
    expect(await within(dialog).findByDisplayValue('24')).toBeInTheDocument();
    expect(within(dialog).getByText(/1 reconocidas/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /Confirmar e Importar/i })).toBeEnabled();
  });

  it('passes the selected geometric candidate to optional calibration', async () => {
    const initial = geometryCandidate();
    const calibrated = { ...initial, id: 'geometry-calibrated' };
    const onCalibrate = vi.fn().mockResolvedValue([calibrated]);

    render(
      <FloorplanDetectionReviewModal
        isOpen
        onClose={vi.fn()}
        backgroundDataUrl=""
        initialTables={[initial]}
        onRecognizeLabels={vi.fn().mockResolvedValue([initial])}
        onCalibrate={onCalibrate}
        onConfirmImport={vi.fn().mockResolvedValue(undefined)}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Usar como referencia/i }));
    await waitFor(() => expect(onCalibrate).toHaveBeenCalledWith(initial));
    expect(screen.getByText(/Mesas:/i).parentElement).toHaveTextContent('1');
  });
});
