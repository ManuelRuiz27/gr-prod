/// <reference types="node" />
// @vitest-environment node

import { createRequire } from 'node:module';
import type { CV } from '@techstark/opencv-js/dist/src/types/opencv';
import { describe, expect, it, vi } from 'vitest';
import {
  contoursToTableCandidates,
  deduplicateTableContours,
  extractRectangleContoursWithOpenCv,
  mergeDetectionParameters,
} from '../services/seating/seatingDetectionGeometry';
import { recognizeTableLabels, type OcrWorkerFactory } from '../services/seating/seatingLabelRecognition';
import type { RawContourGeometry, TableCandidate } from '../services/seating/seatingDetectionTypes';
import { createSeatingFloorplanRegressionFixture } from './fixtures/seatingFloorplanRegressionFixture';

const require = createRequire(import.meta.url);
const cvModule = require('@techstark/opencv-js') as Promise<CV>;

const rectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<RawContourGeometry> = {}
): RawContourGeometry => ({
  x,
  y,
  width,
  height,
  contourArea: width * height * 0.94,
  vertices: 4,
  convex: true,
  maxAxisDeviationDegrees: 1,
  rectangularity: 0.94,
  ...overrides,
});

const candidate = (id: string, x: number): TableCandidate => ({
  id,
  label: '',
  label_candidate: null,
  ocr_confidence: null,
  needs_review: true,
  label_source: 'none',
  capacity: 10,
  shape: 'SQUARE',
  position_x: x,
  position_y: 0.5,
  width: 0.08,
  height: 0.06,
  geometry_confidence: 0.94,
  confidence: 0.94,
});

describe('geometry-first seating detection', () => {
  it(
    'detects the repeated table rectangles and ignores annotations, diamonds, stage and architecture',
    async () => {
      const fixture = createSeatingFloorplanRegressionFixture();
      const cv = await cvModule;
      const parameters = mergeDetectionParameters();
      const contours = extractRectangleContoursWithOpenCv(cv, fixture.imageData, parameters);
      const candidates = contoursToTableCandidates(
        contours,
        fixture.imageData.width,
        fixture.imageData.height
      );

      expect(candidates).toHaveLength(fixture.tableBoxes.length);
      expect(candidates.length).toBeLessThan(50);
      expect(candidates.every((item) => item.shape === 'SQUARE')).toBe(true);
      expect(candidates.every((item) => item.label === '' && item.needs_review)).toBe(true);

      for (const box of fixture.tableBoxes) {
        const expectedX = (box.x + box.width / 2) / fixture.imageData.width;
        const expectedY = (box.y + box.height / 2) / fixture.imageData.height;
        expect(
          candidates.some(
            (item) =>
              Math.abs(item.position_x - expectedX) < 0.01 &&
              Math.abs(item.position_y - expectedY) < 0.01
          )
        ).toBe(true);
      }
    },
    30_000
  );

  it('deduplicates inner and outer contours from one outlined table', () => {
    const contours = [
      rectangle(100, 100, 62, 42),
      rectangle(103, 103, 56, 36, { rectangularity: 0.91 }),
      rectangle(250, 100, 62, 42),
    ];

    expect(deduplicateTableContours(contours)).toHaveLength(2);
  });

  it('uses reference calibration to remove similar but wrong rectangular families', () => {
    const realTables = Array.from({ length: 12 }, (_, index) =>
      rectangle(40 + (index % 6) * 100, 60 + Math.floor(index / 6) * 100, 60, 40)
    );
    const falsePositives = Array.from({ length: 4 }, (_, index) =>
      rectangle(60 + index * 150, 340, 78, 52)
    );
    const contours = [...realTables, ...falsePositives];

    const withoutCalibration = contoursToTableCandidates(contours, 900, 600);
    const calibrated = contoursToTableCandidates(contours, 900, 600, {
      reference: {
        width: 60 / 900,
        height: 40 / 600,
        aspectRatio: 1.5,
        area: (60 * 40) / (900 * 600),
      },
    });

    expect(withoutCalibration).toHaveLength(16);
    expect(calibrated).toHaveLength(12);
  });

  it('rejects text-like strokes and diamonds before family selection', () => {
    const tables = Array.from({ length: 6 }, (_, index) => rectangle(80 + index * 100, 100, 60, 40));
    const distractions = [
      rectangle(20, 20, 12, 28, { vertices: 7, convex: false, rectangularity: 0.31 }),
      rectangle(300, 300, 28, 28, { maxAxisDeviationDegrees: 45, rectangularity: 0.5 }),
      rectangle(10, 420, 700, 90),
    ];

    expect(contoursToTableCandidates([...tables, ...distractions], 800, 600)).toHaveLength(6);
  });
});

describe('OCR-assisted labels', () => {
  const image = {
    data: new Uint8ClampedArray(1000 * 600 * 4),
    width: 1000,
    height: 600,
    colorSpace: 'srgb',
  } as ImageData;

  it('never changes geometric candidate count and keeps failed OCR candidates for review', async () => {
    const recognize = vi
      .fn()
      .mockResolvedValueOnce({ data: { text: '12', confidence: 93 } })
      .mockResolvedValueOnce({ data: { text: '7', confidence: 41 } })
      .mockRejectedValueOnce(new Error('unreadable'));
    const terminate = vi.fn().mockResolvedValue(undefined);
    const workerFactory = vi.fn().mockResolvedValue({
      recognize,
      terminate,
      setParameters: vi.fn().mockResolvedValue(undefined),
    }) as unknown as OcrWorkerFactory;
    const geometries = [candidate('a', 0.2), candidate('b', 0.5), candidate('c', 0.8)];

    const recognized = await recognizeTableLabels(
      image,
      geometries,
      undefined,
      {},
      workerFactory
    );

    expect(recognized).toHaveLength(geometries.length);
    expect(recognized.map((item) => item.id)).toEqual(geometries.map((item) => item.id));
    expect(recognized[0]).toMatchObject({
      label: '12',
      label_candidate: '12',
      needs_review: false,
      label_source: 'ocr',
    });
    expect(recognized[1]).toMatchObject({ label: '', label_candidate: null, needs_review: true });
    expect(recognized[2]).toMatchObject({ label: '', label_candidate: null, needs_review: true });
    expect(terminate).toHaveBeenCalledOnce();

    const firstRoi = recognize.mock.calls[0][1].rectangle;
    expect(firstRoi.width).toBeLessThan(geometries[0].width * image.width);
    expect(firstRoi.height).toBeLessThan(geometries[0].height * image.height);
  });

  it('preserves every table as needs_review when the OCR worker cannot start', async () => {
    const geometries = [candidate('a', 0.25), candidate('b', 0.75)];
    const failedFactory = vi.fn().mockRejectedValue(new Error('offline')) as OcrWorkerFactory;

    const recognized = await recognizeTableLabels(
      image,
      geometries,
      undefined,
      {},
      failedFactory
    );

    expect(recognized).toHaveLength(2);
    expect(recognized.every((item) => item.needs_review && item.label === '')).toBe(true);
  });
});
