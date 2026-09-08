/// <reference lib="webworker" />

import cvModule from '@techstark/opencv-js';
import {
  contoursToTableCandidates,
  extractRectangleContoursWithOpenCv,
  mergeDetectionParameters,
} from './seatingDetectionGeometry';
import type { GeometryDetectionOptions } from './seatingDetectionTypes';

interface DetectRequest {
  type: 'detect';
  imageData: ImageData;
  options?: GeometryDetectionOptions;
}

const workerScope: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = async (event: MessageEvent<DetectRequest>) => {
  if (event.data.type !== 'detect') return;

  try {
    workerScope.postMessage({
      type: 'progress',
      progress: {
        stage: 'analyzing',
        percent: 38,
        message: 'Cargando OpenCV.js en el worker...',
      },
    });

    const cv = await cvModule;
    const parameters = mergeDetectionParameters(event.data.options?.parameters);

    workerScope.postMessage({
      type: 'progress',
      progress: {
        stage: 'analyzing',
        percent: 55,
        message: 'Detectando contornos rectangulares cerrados...',
      },
    });

    const contours = extractRectangleContoursWithOpenCv(cv, event.data.imageData, parameters);
    const candidates = contoursToTableCandidates(
      contours,
      event.data.imageData.width,
      event.data.imageData.height,
      event.data.options
    );

    workerScope.postMessage({ type: 'result', candidates });
  } catch (error) {
    workerScope.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export {};
