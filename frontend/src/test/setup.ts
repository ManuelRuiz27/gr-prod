import '@testing-library/jest-dom';

// Comprehensive JSDOM Canvas mock for Konva / React-Konva
if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  window.HTMLCanvasElement.prototype.toDataURL = function () {
    return '';
  };

  window.HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextType: string) {
    if (contextType === '2d') {
      const ctx = {
        canvas: this,
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
        putImageData: () => {},
        createImageData: () => ({ data: [] }),
        setTransform: () => {},
        resetTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        strokeText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        arcTo: () => {},
        bezierCurveTo: () => {},
        quadraticCurveTo: () => {},
        fill: () => {},
        measureText: () => ({ width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
        isPointInPath: () => false,
        isPointInStroke: () => false,
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createPattern: () => null,
        font: '10px sans-serif',
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'miter',
        miterLimit: 10,
        shadowBlur: 0,
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        globalAlpha: 1.0,
        globalCompositeOperation: 'source-over',
        imageSmoothingEnabled: true,
      };
      return ctx as unknown as CanvasRenderingContext2D;
    }
    return null;
  } as unknown as typeof window.HTMLCanvasElement.prototype.getContext;
}
