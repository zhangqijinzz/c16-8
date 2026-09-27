import { describe, expect, it } from 'vitest';
import { cropForRatio, cropViewport, moveCrop, resizeCrop } from '../domain';
import { DEFAULT_CROP, type CropVariant, type ImageAsset } from '../model';

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

describe('cropViewport preview mapping', () => {
  const image: ImageAsset = { src: 'x', width: 1200, height: 800, name: 'x' };

  it('maps a full-frame crop onto the whole viewport', () => {
    const viewport = cropViewport(DEFAULT_CROP, image);
    expect(viewport.aspect).toBeCloseTo(1.5);
    expect(viewport.imageWidth).toBe(100);
    expect(viewport.imageHeight).toBe(100);
    expect(viewport.imageLeft).toBe(0);
    expect(viewport.imageTop).toBe(0);
  });

  it('uses the crop aspect ratio in image pixels, not the container ratio', () => {
    const crop: CropVariant = { ...DEFAULT_CROP, x: 0.5, y: 0, width: 0.5, height: 1 };
    const viewport = cropViewport(crop, image);
    expect(viewport.aspect).toBeCloseTo(0.75);
    expect(viewport.imageWidth).toBe(200);
    expect(viewport.imageLeft).toBe(-100);
  });

  it('frames exactly the saved region even for small off-center crops', () => {
    const crop: CropVariant = { ...DEFAULT_CROP, x: 0.8, y: 0.6, width: 0.2, height: 0.4 };
    const viewport = cropViewport(crop, image);
    // The crop's left/top edge lands on the viewport origin…
    expect(viewport.imageLeft + viewport.imageWidth * crop.x).toBeCloseTo(0);
    expect(viewport.imageTop + viewport.imageHeight * crop.y).toBeCloseTo(0);
    // …and its right/bottom edge lands exactly on the viewport's far edge.
    expect(viewport.imageLeft + viewport.imageWidth * (crop.x + crop.width)).toBeCloseTo(100);
    expect(viewport.imageTop + viewport.imageHeight * (crop.y + crop.height)).toBeCloseTo(100);
  });
});
