import * as pdfjsLib from 'pdfjs-dist';
import type {
  DetectionProgress,
  DetectionProgressCallback,
  GeometryDetectionOptions,
  TableCandidate,
} from './seatingDetectionTypes';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const MAX_RASTER_EDGE = 3200;

export type DetectedTableItem = TableCandidate;
export type { DetectionProgressCallback, GeometryDetectionOptions, TableCandidate };
export { recognizeTableLabels } from './seatingLabelRecognition';

export interface RasterizedFloorplan {
  backgroundDataUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  imageData: ImageData;
}

export interface DetectionResult extends RasterizedFloorplan {
  tables: TableCandidate[];
}

interface GeometryWorkerProgressMessage {
  type: 'progress';
  progress: DetectionProgress;
}

interface GeometryWorkerResultMessage {
  type: 'result';
  candidates: TableCandidate[];
}

interface GeometryWorkerErrorMessage {
  type: 'error';
  message: string;
}

type GeometryWorkerMessage =
  | GeometryWorkerProgressMessage
  | GeometryWorkerResultMessage
  | GeometryWorkerErrorMessage;

const limitRasterSize = (width: number, height: number) => {
  const scale = Math.min(1, MAX_RASTER_EDGE / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
};

/** Rasterization stays independent from both geometry detection and OCR. */
export async function rasterizeFloorplan(
  file: File,
  onProgress?: DetectionProgressCallback
): Promise<RasterizedFloorplan> {
  onProgress?.({
    stage: 'rasterizing',
    percent: 5,
    message: 'Preparando imagen del croquis...',
  });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('No se pudo inicializar el contexto 2D de canvas.');

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const loadingTask = pdfjsLib.getDocument({ data: await file.arrayBuffer() });
    const pdfDocument = await loadingTask.promise;

    if (pdfDocument.numPages < 1) throw new Error('El PDF no contiene páginas.');

    const page = await pdfDocument.getPage(1);
    const highResolutionViewport = page.getViewport({ scale: 2 });
    const limited = limitRasterSize(
      highResolutionViewport.width,
      highResolutionViewport.height
    );
    const viewport = page.getViewport({ scale: 2 * limited.scale });

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    onProgress?.({
      stage: 'rasterizing',
      percent: 22,
      message: 'Rasterizando la primera página del PDF...',
    });
    await page.render({ canvasContext: context, viewport, canvas }).promise;
    await loadingTask.destroy();
  } else {
    onProgress?.({
      stage: 'rasterizing',
      percent: 18,
      message: 'Cargando imagen del croquis...',
    });
    const bitmap = await createImageBitmap(file);
    const limited = limitRasterSize(bitmap.width, bitmap.height);
    canvas.width = limited.width;
    canvas.height = limited.height;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  return {
    backgroundDataUrl: canvas.toDataURL('image/jpeg', 0.92),
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    imageData,
  };
}

/**
 * Geometry is the only source of table existence. OpenCV.js runs in a module
 * worker and returns unlabeled TableCandidate objects.
 */
export function detectTables(
  image: ImageData,
  options: GeometryDetectionOptions = {},
  onProgress?: DetectionProgressCallback
): Promise<TableCandidate[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./seatingDetection.worker.ts', import.meta.url), {
      type: 'module',
      name: 'seating-geometry-detection',
    });

    const finish = () => worker.terminate();

    worker.onmessage = (event: MessageEvent<GeometryWorkerMessage>) => {
      if (event.data.type === 'progress') {
        onProgress?.(event.data.progress);
        return;
      }

      finish();
      if (event.data.type === 'result') {
        resolve(event.data.candidates);
      } else {
        reject(new Error(`OpenCV.js no pudo analizar el croquis: ${event.data.message}`));
      }
    };

    worker.onerror = (event) => {
      finish();
      reject(new Error(event.message || 'Falló el worker de detección geométrica.'));
    };

    worker.postMessage({ type: 'detect', imageData: image, options });
  });
}

/** Convenience flow used by the upload action; it intentionally does not run OCR. */
export async function detectTablesFromFloorplan(
  file: File,
  onProgress?: DetectionProgressCallback,
  options: GeometryDetectionOptions = {}
): Promise<DetectionResult> {
  const rasterized = await rasterizeFloorplan(file, onProgress);
  const tables = await detectTables(rasterized.imageData, options, onProgress);

  onProgress?.({
    stage: 'finalizing',
    percent: 100,
    message: `Detección geométrica completada: ${tables.length} candidatos.`,
  });

  return { ...rasterized, tables };
}
