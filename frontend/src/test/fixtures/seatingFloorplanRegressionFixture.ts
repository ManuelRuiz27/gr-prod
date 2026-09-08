export interface RegressionFloorplanFixture {
  imageData: ImageData;
  tableBoxes: Array<{ x: number; y: number; width: number; height: number }>;
}

const WIDTH = 1000;
const HEIGHT = 700;

function createRaster() {
  const data = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  data.fill(255);
  return data;
}

function setBlack(data: Uint8ClampedArray, x: number, y: number) {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const index = (Math.round(y) * WIDTH + Math.round(x)) * 4;
  data[index] = 0;
  data[index + 1] = 0;
  data[index + 2] = 0;
  data[index + 3] = 255;
}

function fillRect(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
) {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      setBlack(data, column, row);
    }
  }
}

function drawRect(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness = 3
) {
  fillRect(data, x, y, width, thickness);
  fillRect(data, x, y + height - thickness, width, thickness);
  fillRect(data, x, y, thickness, height);
  fillRect(data, x + width - thickness, y, thickness, height);
}

function drawLine(
  data: Uint8ClampedArray,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  thickness = 2
) {
  const steps = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
  for (let step = 0; step <= steps; step += 1) {
    const progress = steps === 0 ? 0 : step / steps;
    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress;
    fillRect(data, Math.round(x), Math.round(y), thickness, thickness);
  }
}

function drawDiamond(
  data: Uint8ClampedArray,
  centerX: number,
  centerY: number,
  radius: number
) {
  drawLine(data, centerX, centerY - radius, centerX + radius, centerY);
  drawLine(data, centerX + radius, centerY, centerX, centerY + radius);
  drawLine(data, centerX, centerY + radius, centerX - radius, centerY);
  drawLine(data, centerX - radius, centerY, centerX, centerY - radius);
}

/**
 * Raster regression layout transcribed from the described failure modes of the
 * salon plan: repeated table boxes plus stage, architectural lines, diamonds,
 * printed strokes and handwritten X marks. It intentionally has no expected
 * count embedded in the detector.
 */
export function createSeatingFloorplanRegressionFixture(): RegressionFloorplanFixture {
  const data = createRaster();
  const tableBoxes: RegressionFloorplanFixture['tableBoxes'] = [];

  // Architectural perimeter and a stage: valid rectangles, but not table-sized families.
  drawRect(data, 25, 25, 950, 650, 4);
  drawRect(data, 335, 45, 330, 82, 4);
  fillRect(data, 445, 82, 110, 5);
  drawLine(data, 80, 155, 920, 155, 2);
  drawLine(data, 90, 625, 910, 625, 2);

  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const width = 62 + ((row + column) % 3) - 1;
      const height = 42 + ((row * 2 + column) % 3) - 1;
      const x = 115 + column * 172;
      const y = 205 + row * 96;
      tableBoxes.push({ x, y, width, height });
      drawRect(data, x, y, width, height, 3);

      // Number-like strokes and occasional handwritten X marks inside a table.
      fillRect(data, x + Math.round(width / 2) - 2, y + 12, 4, 16);
      if ((row + column) % 4 === 0) {
        drawLine(data, x + 12, y + 9, x + width - 12, y + height - 9, 2);
        drawLine(data, x + width - 12, y + 9, x + 12, y + height - 9, 2);
      }
    }
  }

  // Diamonds/numbers and salon text strokes must not become independent tables.
  for (let index = 0; index < 8; index += 1) {
    drawDiamond(data, 95 + index * 112, 595, 12);
  }
  for (let index = 0; index < 14; index += 1) {
    fillRect(data, 260 + index * 18, 175 + (index % 2) * 6, 11, 3);
    fillRect(data, 260 + index * 18, 175 + (index % 2) * 6, 3, 11);
  }

  const imageData = {
    data,
    width: WIDTH,
    height: HEIGHT,
    colorSpace: 'srgb',
  } as ImageData;

  return { imageData, tableBoxes };
}
