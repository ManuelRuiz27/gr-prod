import type { CV } from '@techstark/opencv-js/dist/src/types/opencv';
import {
  DEFAULT_TABLE_DETECTION_PARAMETERS,
  type GeometryDetectionOptions,
  type RawContourGeometry,
  type TableCandidate,
  type TableDetectionParameters,
  type TableReferenceGeometry,
} from './seatingDetectionTypes';

interface ScoredGeometry extends RawContourGeometry {
  aspectRatio: number;
  normalizedArea: number;
}

interface GeometryCluster {
  items: ScoredGeometry[];
  medianWidth: number;
  medianHeight: number;
  medianAspectRatio: number;
  medianArea: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const round = (value: number) => Number(value.toFixed(5));

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const relativeDifference = (left: number, right: number) =>
  Math.abs(left - right) / Math.max(Math.abs(left), Math.abs(right), Number.EPSILON);

const intersectionOverUnion = (left: RawContourGeometry, right: RawContourGeometry) => {
  const intersectionWidth = Math.max(
    0,
    Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x)
  );
  const intersectionHeight = Math.max(
    0,
    Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y)
  );
  const intersection = intersectionWidth * intersectionHeight;
  const union = left.width * left.height + right.width * right.height - intersection;
  return union > 0 ? intersection / union : 0;
};

const centerDistanceRatio = (left: RawContourGeometry, right: RawContourGeometry) => {
  const leftX = left.x + left.width / 2;
  const leftY = left.y + left.height / 2;
  const rightX = right.x + right.width / 2;
  const rightY = right.y + right.height / 2;
  const scale = Math.max(left.width, left.height, right.width, right.height, 1);
  return Math.hypot(leftX - rightX, leftY - rightY) / scale;
};

const refreshCluster = (cluster: GeometryCluster) => {
  cluster.medianWidth = median(cluster.items.map((item) => item.width));
  cluster.medianHeight = median(cluster.items.map((item) => item.height));
  cluster.medianAspectRatio = median(cluster.items.map((item) => item.aspectRatio));
  cluster.medianArea = median(cluster.items.map((item) => item.normalizedArea));
};

const belongsToCluster = (
  item: ScoredGeometry,
  cluster: GeometryCluster,
  parameters: TableDetectionParameters
) =>
  relativeDifference(item.width, cluster.medianWidth) <= parameters.dimensionTolerance &&
  relativeDifference(item.height, cluster.medianHeight) <= parameters.dimensionTolerance &&
  relativeDifference(item.aspectRatio, cluster.medianAspectRatio) <= parameters.aspectTolerance &&
  relativeDifference(item.normalizedArea, cluster.medianArea) <= parameters.areaTolerance;

const clusterGeometry = (
  geometries: ScoredGeometry[],
  parameters: TableDetectionParameters
): GeometryCluster[] => {
  const clusters: GeometryCluster[] = [];

  for (const geometry of [...geometries].sort((a, b) => a.normalizedArea - b.normalizedArea)) {
    const matchingCluster = clusters.find((cluster) =>
      belongsToCluster(geometry, cluster, parameters)
    );

    if (matchingCluster) {
      matchingCluster.items.push(geometry);
      refreshCluster(matchingCluster);
      continue;
    }

    clusters.push({
      items: [geometry],
      medianWidth: geometry.width,
      medianHeight: geometry.height,
      medianAspectRatio: geometry.aspectRatio,
      medianArea: geometry.normalizedArea,
    });
  }

  return clusters;
};

const clusterScore = (cluster: GeometryCluster) => {
  const averageRectangularity =
    cluster.items.reduce((sum, item) => sum + item.rectangularity, 0) / cluster.items.length;
  const sizeDispersion =
    cluster.items.reduce(
      (sum, item) =>
        sum +
        relativeDifference(item.width, cluster.medianWidth) +
        relativeDifference(item.height, cluster.medianHeight),
      0
    ) /
    (cluster.items.length * 2);

  return cluster.items.length * averageRectangularity * (1 - Math.min(0.5, sizeDispersion));
};

const matchesReference = (
  geometry: ScoredGeometry,
  reference: TableReferenceGeometry,
  parameters: TableDetectionParameters,
  imageWidth: number,
  imageHeight: number
) =>
  relativeDifference(geometry.width / imageWidth, reference.width) <=
    parameters.calibrationDimensionTolerance &&
  relativeDifference(geometry.height / imageHeight, reference.height) <=
    parameters.calibrationDimensionTolerance &&
  relativeDifference(geometry.aspectRatio, reference.aspectRatio) <=
    parameters.calibrationAspectTolerance &&
  relativeDifference(geometry.normalizedArea, reference.area) <=
    parameters.calibrationAreaTolerance;

export function mergeDetectionParameters(
  parameters?: Partial<TableDetectionParameters>
): TableDetectionParameters {
  return { ...DEFAULT_TABLE_DETECTION_PARAMETERS, ...parameters };
}

export function deduplicateTableContours(
  contours: RawContourGeometry[],
  parameters: TableDetectionParameters = DEFAULT_TABLE_DETECTION_PARAMETERS
): RawContourGeometry[] {
  const ranked = [...contours].sort((a, b) => {
    const scoreA = a.rectangularity - a.maxAxisDeviationDegrees / 180;
    const scoreB = b.rectangularity - b.maxAxisDeviationDegrees / 180;
    return scoreB - scoreA;
  });
  const kept: RawContourGeometry[] = [];

  for (const contour of ranked) {
    const duplicate = kept.some((existing) => {
      if (intersectionOverUnion(contour, existing) >= parameters.deduplicationIou) return true;

      return (
        centerDistanceRatio(contour, existing) <= parameters.deduplicationCenterTolerance &&
        relativeDifference(contour.width, existing.width) <= parameters.dimensionTolerance &&
        relativeDifference(contour.height, existing.height) <= parameters.dimensionTolerance
      );
    });

    if (!duplicate) kept.push(contour);
  }

  return kept;
}

export function selectTableGeometryFamily(
  contours: RawContourGeometry[],
  imageWidth: number,
  imageHeight: number,
  options: GeometryDetectionOptions = {}
): RawContourGeometry[] {
  const parameters = mergeDetectionParameters(options.parameters);
  const shortestSide = Math.min(imageWidth, imageHeight);
  const imageArea = imageWidth * imageHeight;

  const geometricRectangles: ScoredGeometry[] = contours
    .filter((contour) => {
      const widthRatio = contour.width / shortestSide;
      const heightRatio = contour.height / shortestSide;
      const areaRatio = (contour.width * contour.height) / imageArea;
      const aspectRatio = contour.width / Math.max(contour.height, 1);

      return (
        contour.vertices === 4 &&
        contour.convex &&
        contour.rectangularity >= parameters.minRectangularity &&
        contour.maxAxisDeviationDegrees <= parameters.maxAxisDeviationDegrees &&
        widthRatio >= parameters.minSideRatio &&
        heightRatio >= parameters.minSideRatio &&
        widthRatio <= parameters.maxSideRatio &&
        heightRatio <= parameters.maxSideRatio &&
        areaRatio >= parameters.minAreaRatio &&
        areaRatio <= parameters.maxAreaRatio &&
        aspectRatio >= parameters.minAspectRatio &&
        aspectRatio <= parameters.maxAspectRatio
      );
    })
    .map((contour) => ({
      ...contour,
      aspectRatio: contour.width / Math.max(contour.height, 1),
      normalizedArea: (contour.width * contour.height) / imageArea,
    }));

  const deduplicated = deduplicateTableContours(geometricRectangles, parameters) as ScoredGeometry[];

  if (options.reference) {
    return deduplicated.filter((geometry) =>
      matchesReference(
        geometry,
        options.reference as TableReferenceGeometry,
        parameters,
        imageWidth,
        imageHeight
      )
    );
  }

  const dominantCluster = clusterGeometry(deduplicated, parameters)
    .filter((cluster) => cluster.items.length >= parameters.minimumFamilySize)
    .sort((left, right) => clusterScore(right) - clusterScore(left))[0];

  return dominantCluster?.items ?? [];
}

export function contoursToTableCandidates(
  contours: RawContourGeometry[],
  imageWidth: number,
  imageHeight: number,
  options: GeometryDetectionOptions = {}
): TableCandidate[] {
  const parameters = mergeDetectionParameters(options.parameters);
  const family = selectTableGeometryFamily(contours, imageWidth, imageHeight, options);
  const medianWidth = family.length > 0 ? median(family.map((item) => item.width)) : 1;
  const medianHeight = family.length > 0 ? median(family.map((item) => item.height)) : 1;

  return family
    .sort((left, right) => {
      const rowTolerance = Math.max(left.height, right.height) * 0.6;
      if (Math.abs(left.y - right.y) > rowTolerance) return left.y - right.y;
      return left.x - right.x;
    })
    .map((geometry) => {
      const normalizedWidth = geometry.width / imageWidth;
      const normalizedHeight = geometry.height / imageHeight;
      const sizeSimilarity =
        1 -
        Math.min(
          1,
          (relativeDifference(geometry.width, medianWidth) +
            relativeDifference(geometry.height, medianHeight)) /
            2
        );
      const axisScore =
        1 - geometry.maxAxisDeviationDegrees / parameters.maxAxisDeviationDegrees;
      const confidence = clamp01(
        geometry.rectangularity * 0.55 + sizeSimilarity * 0.3 + clamp01(axisScore) * 0.15
      );
      const centerX = (geometry.x + geometry.width / 2) / imageWidth;
      const centerY = (geometry.y + geometry.height / 2) / imageHeight;

      return {
        id: `detected-${geometry.x}-${geometry.y}-${geometry.width}-${geometry.height}`,
        label: '',
        label_candidate: null,
        ocr_confidence: null,
        needs_review: true,
        label_source: 'none' as const,
        capacity: 10,
        shape: 'SQUARE' as const,
        position_x: round(clamp01(centerX)),
        position_y: round(clamp01(centerY)),
        width: round(clamp01(normalizedWidth)),
        height: round(clamp01(normalizedHeight)),
        geometry_confidence: round(confidence),
        confidence: round(confidence),
      };
    });
}

function maximumAxisDeviationDegrees(points: Int32Array | number[]) {
  let maximumDeviation = 0;
  const pointCount = points.length / 2;

  for (let index = 0; index < pointCount; index += 1) {
    const nextIndex = (index + 1) % pointCount;
    const deltaX = points[nextIndex * 2] - points[index * 2];
    const deltaY = points[nextIndex * 2 + 1] - points[index * 2 + 1];
    const angle = Math.abs(Math.atan2(deltaY, deltaX));
    const modulo = angle % (Math.PI / 2);
    const deviation = Math.min(modulo, Math.PI / 2 - modulo) * (180 / Math.PI);
    maximumDeviation = Math.max(maximumDeviation, deviation);
  }

  return maximumDeviation;
}

/** Extracts closed quadrilateral contours with the real OpenCV.js runtime. */
export function extractRectangleContoursWithOpenCv(
  cv: CV,
  imageData: ImageData,
  parameters: TableDetectionParameters = DEFAULT_TABLE_DETECTION_PARAMETERS
): RawContourGeometry[] {
  const source = cv.matFromImageData(imageData);
  const grayscale = new cv.Mat();
  const blurred = new cv.Mat();
  const binary = new cv.Mat();
  const closed = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
  const results: RawContourGeometry[] = [];

  try {
    cv.cvtColor(source, grayscale, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(grayscale, blurred, new cv.Size(3, 3), 0, 0, cv.BORDER_DEFAULT);
    cv.threshold(blurred, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
    cv.morphologyEx(binary, closed, cv.MORPH_CLOSE, kernel);
    cv.findContours(closed, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const approximation = new cv.Mat();

      try {
        const perimeter = cv.arcLength(contour, true);
        if (perimeter <= 0) continue;

        cv.approxPolyDP(
          contour,
          approximation,
          parameters.polygonApproximationRatio * perimeter,
          true
        );

        const rect = cv.boundingRect(approximation);
        const contourArea = Math.abs(cv.contourArea(approximation, false));
        const boundingArea = rect.width * rect.height;

        if (boundingArea <= 0) continue;

        results.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          contourArea,
          vertices: approximation.rows,
          convex: cv.isContourConvex(approximation),
          maxAxisDeviationDegrees: maximumAxisDeviationDegrees(approximation.data32S),
          rectangularity: contourArea / boundingArea,
        });
      } finally {
        contour.delete();
        approximation.delete();
      }
    }
  } finally {
    source.delete();
    grayscale.delete();
    blurred.delete();
    binary.delete();
    closed.delete();
    contours.delete();
    hierarchy.delete();
    kernel.delete();
  }

  return results;
}
