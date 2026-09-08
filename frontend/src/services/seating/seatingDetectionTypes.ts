export type TableCandidateLabelSource = 'none' | 'ocr' | 'manual';

export interface TableCandidate {
  id: string;
  label: string;
  label_candidate: string | null;
  ocr_confidence: number | null;
  needs_review: boolean;
  label_source: TableCandidateLabelSource;
  capacity: number;
  shape: 'ROUND' | 'SQUARE';
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  geometry_confidence: number;
  /** @deprecated Kept for the existing import contract; it mirrors geometry_confidence. */
  confidence: number;
}

export interface TableReferenceGeometry {
  /** Normalized against image width. */
  width: number;
  /** Normalized against image height. */
  height: number;
  /** Pixel width / pixel height (accounts for non-square rasters). */
  aspectRatio: number;
  /** Bounding-box area / total raster area. */
  area: number;
}

export interface TableDetectionParameters {
  minSideRatio: number;
  maxSideRatio: number;
  minAreaRatio: number;
  maxAreaRatio: number;
  minAspectRatio: number;
  maxAspectRatio: number;
  minRectangularity: number;
  maxAxisDeviationDegrees: number;
  polygonApproximationRatio: number;
  dimensionTolerance: number;
  aspectTolerance: number;
  areaTolerance: number;
  minimumFamilySize: number;
  deduplicationIou: number;
  deduplicationCenterTolerance: number;
  calibrationDimensionTolerance: number;
  calibrationAspectTolerance: number;
  calibrationAreaTolerance: number;
}

/**
 * Ratios are relative to the raster, so the same configuration works for scans,
 * screenshots and PDFs. The broad contour gate admits ordinary printed tables;
 * the repeated-size family gate removes architectural boxes and annotations.
 */
export const DEFAULT_TABLE_DETECTION_PARAMETERS: TableDetectionParameters = {
  minSideRatio: 0.01,
  maxSideRatio: 0.22,
  minAreaRatio: 0.00008,
  maxAreaRatio: 0.04,
  minAspectRatio: 0.45,
  maxAspectRatio: 2.2,
  minRectangularity: 0.72,
  maxAxisDeviationDegrees: 15,
  polygonApproximationRatio: 0.025,
  dimensionTolerance: 0.28,
  aspectTolerance: 0.24,
  areaTolerance: 0.42,
  minimumFamilySize: 3,
  deduplicationIou: 0.68,
  deduplicationCenterTolerance: 0.18,
  calibrationDimensionTolerance: 0.2,
  calibrationAspectTolerance: 0.16,
  calibrationAreaTolerance: 0.32,
};

export interface RawContourGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  contourArea: number;
  vertices: number;
  convex: boolean;
  maxAxisDeviationDegrees: number;
  rectangularity: number;
}

export interface GeometryDetectionOptions {
  parameters?: Partial<TableDetectionParameters>;
  reference?: TableReferenceGeometry;
}

export interface DetectionProgress {
  stage: 'rasterizing' | 'analyzing' | 'ocr' | 'finalizing';
  percent: number;
  message: string;
}

export interface DetectionProgressCallback {
  (progress: DetectionProgress): void;
}
