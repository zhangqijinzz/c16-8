import { describe, expect, it } from 'vitest';
import { cropForRatio, cropViewport, moveCrop, normalizeCrop, resizeCrop } from '../domain';
import { DEFAULT_CROP, type ImageAsset } from '../model';

describe('crop domain rules', () => {
  it('fits a 1:1 crop inside a wide image and centers it', () => {
    const crop = cropForRatio('1:1', 1.5, DEFAULT_CROP);
    expect(crop.width).toBeCloseTo(2 / 3);
    expect(crop.height).toBe(1);
    expect(crop.x).toBeCloseTo(1 / 6);
  });

  it('clamps movement to the image boundary', () => {
    const crop = moveCrop({ ...DEFAULT_CROP, width: 0.5, height: 0.5 }, 0.9, -0.9);
    expect(crop.x).toBe(0.5);
    expect(crop.y).toBe(0);
  });

  it('keeps a selected ratio while resizing', () => {
    const crop = resizeCrop({ ...DEFAULT_CROP, ratio: '16:9', width: 0.5, height: 0.28125 }, 0.8, 0.8);
    expect(crop.width).toBe(0.8);
    expect(crop.height).toBeCloseTo(0.45);
  });
});

describe('cropViewport', () => {
  const image: ImageAsset = { src: 'data:image/svg+xml,test', width: 1200, height: 800, name: 'test.svg' };

  it('maps the normalized crop to the exact image-pixel window', () => {
    const viewport = cropViewport(image, { id: 'v', x: 0.25, y: 0.5, width: 0.5, height: 0.25, ratio: 'free' });
    expect(viewport).toEqual({ x: 300, y: 400, width: 600, height: 200 });
  });

  it('frames the same window no matter where the crop sits, including edges', () => {
    const corner = cropViewport(image, { id: 'v', x: 0.8, y: 0.9, width: 0.2, height: 0.1, ratio: 'free' });
    expect(corner).toEqual({ x: 960, y: 720, width: 240, height: 80 });
    expect(corner.x + corner.width).toBe(image.width);
    expect(corner.y + corner.height).toBe(image.height);
  });

  it('keeps every normalized crop window fully inside the image', () => {
    const crop = normalizeCrop({ id: 'v', x: 0.95, y: 0.95, width: 0.4, height: 0.4, ratio: 'free' });
    const viewport = cropViewport(image, crop);
    expect(viewport.x).toBeGreaterThanOrEqual(0);
    expect(viewport.y).toBeGreaterThanOrEqual(0);
    expect(viewport.x + viewport.width).toBeLessThanOrEqual(image.width);
    expect(viewport.y + viewport.height).toBeLessThanOrEqual(image.height);
  });

  it('depends only on the crop and image, so every preview of a variant agrees', () => {
    const variant = { id: 'v', x: 0.1, y: 0.2, width: 0.3, height: 0.4, ratio: 'free' };
    expect(cropViewport(image, variant)).toEqual(cropViewport(image, variant));
  });
});
