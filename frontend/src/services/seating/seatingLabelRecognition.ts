import { createWorker, PSM, type Worker as TesseractWorker } from 'tesseract.js';
import type {
  DetectionProgressCallback,
  TableCandidate,
} from './seatingDetectionTypes';

export interface TableLabelRecognitionOptions {
  minimumConfidence?: number;
  maximumDigits?: number;
  roiInsetRatio?: number;
}

export type OcrWorkerFactory = () => Promise<Pick<TesseractWorker, 'recognize' | 'setParameters' | 'terminate'>>;

const DEFAULT_RECOGNITION_OPTIONS: Required<TableLabelRecognitionOptions> = {
  minimumConfidence: 0.72,
  maximumDigits: 4,
  roiInsetRatio: 0.14,
};

const emptyOcrCandidate = (candidate: TableCandidate): TableCandidate => {
  if (candidate.label_source === 'manual') return candidate;

  return {
    ...candidate,
    label: '',
    label_candidate: null,
    ocr_confidence: null,
    needs_review: true,
    label_source: 'none',
  };
};

const buildRoi = (
  candidate: TableCandidate,
  image: ImageData,
  insetRatio: number
) => {
  const boxWidth = candidate.width * image.width;
  const boxHeight = candidate.height * image.height;
  const left = candidate.position_x * image.width - boxWidth / 2;
  const top = candidate.position_y * image.height - boxHeight / 2;
  const horizontalInset = boxWidth * insetRatio;
  const verticalInset = boxHeight * insetRatio;

  const roiLeft = Math.max(0, Math.round(left + horizontalInset));
  const roiTop = Math.max(0, Math.round(top + verticalInset));

  return {
    left: roiLeft,
    top: roiTop,
    width: Math.max(
      1,
      Math.min(image.width - roiLeft, Math.round(boxWidth - horizontalInset * 2))
    ),
    height: Math.max(
      1,
      Math.min(image.height - roiTop, Math.round(boxHeight - verticalInset * 2))
    ),
  };
};

const createOcrSource = (image: ImageData): HTMLCanvasElement => {
  if (typeof document === 'undefined') {
    return image as unknown as HTMLCanvasElement;
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo preparar el raster para OCR.');
  context.putImageData(image, 0, 0);
  return canvas;
};

const defaultWorkerFactory: OcrWorkerFactory = async () => {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: PSM.SINGLE_WORD,
  });
  return worker;
};

/**
 * OCR annotates candidates but never creates, removes, reorders or relocates one.
 * Tesseract.js performs recognition in its own Web Worker.
 */
export async function recognizeTableLabels(
  image: ImageData,
  candidates: TableCandidate[],
  onProgress?: DetectionProgressCallback,
  options: TableLabelRecognitionOptions = {},
  workerFactory: OcrWorkerFactory = defaultWorkerFactory
): Promise<TableCandidate[]> {
  if (candidates.length === 0) return [];

  const settings = { ...DEFAULT_RECOGNITION_OPTIONS, ...options };
  let ocrSource: HTMLCanvasElement;
  let worker: Awaited<ReturnType<OcrWorkerFactory>>;

  try {
    onProgress?.({
      stage: 'ocr',
      percent: 8,
      message: 'Inicializando reconocimiento numérico...',
    });
    ocrSource = createOcrSource(image);
    worker = await workerFactory();
  } catch {
    return candidates.map(emptyOcrCandidate);
  }

  const recognized: TableCandidate[] = [];

  try {
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];

      if (candidate.label_source === 'manual') {
        recognized.push(candidate);
        continue;
      }

      onProgress?.({
        stage: 'ocr',
        percent: Math.round(10 + ((index + 1) / candidates.length) * 85),
        message: `Reconociendo número ${index + 1} de ${candidates.length}...`,
      });

      try {
        const result = await worker.recognize(ocrSource, {
          rectangle: buildRoi(candidate, image, settings.roiInsetRatio),
        });
        const text = result.data.text.trim();
        const digits = text.replace(/\D/g, '');
        const confidence = Math.max(0, Math.min(1, (result.data.confidence ?? 0) / 100));
        const accepted =
          /^\d+$/.test(digits) &&
          digits.length <= settings.maximumDigits &&
          confidence >= settings.minimumConfidence;

        recognized.push({
          ...candidate,
          label: accepted ? digits : '',
          label_candidate: accepted ? digits : null,
          ocr_confidence: Number(confidence.toFixed(4)),
          needs_review: !accepted,
          label_source: accepted ? 'ocr' : 'none',
        });
      } catch {
        recognized.push(emptyOcrCandidate(candidate));
      }
    }
  } finally {
    await worker.terminate().catch(() => undefined);
  }

  const labelCounts = recognized.reduce<Map<string, number>>((counts, candidate) => {
    if (candidate.label) counts.set(candidate.label, (counts.get(candidate.label) ?? 0) + 1);
    return counts;
  }, new Map());

  return recognized.map((candidate) =>
    candidate.label && (labelCounts.get(candidate.label) ?? 0) > 1
      ? { ...candidate, needs_review: true }
      : candidate
  );
}
