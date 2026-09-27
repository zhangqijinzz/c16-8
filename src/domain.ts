import type { CropVariant, FrameDocument, ImageAsset, Ratio } from './model';

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

export function normalizeCrop(crop: CropVariant): CropVariant {
  const width = clamp(crop.width, 0.12, 1);
  const height = clamp(crop.height, 0.12, 1);
  return {
    ...crop,
    x: clamp(crop.x, 0, 1 - width),
    y: clamp(crop.y, 0, 1 - height),
    width,
    height,
  };
}

export function cropForRatio(ratio: Ratio, imageRatio: number, current: CropVariant): CropVariant {
  if (ratio === 'free') return { ...current, ratio };
  const [w, h] = ratio.split(':').map(Number);
  const target = w / h;
  let width = 1;
  let height = 1;
  if (target > imageRatio) height = Math.min(1, imageRatio / target);
  else width = Math.min(1, target / imageRatio);
  return normalizeCrop({
    ...current,
    ratio,
    width,
    height,
    x: (1 - width) / 2,
    y: (1 - height) / 2,
  });
}

export function moveCrop(crop: CropVariant, dx: number, dy: number): CropVariant {
  return normalizeCrop({ ...crop, x: crop.x + dx, y: crop.y + dy });
}

export function resizeCrop(crop: CropVariant, width: number, height: number): CropVariant {
  const nextWidth = width;
  let nextHeight = height;
  if (crop.ratio !== 'free') {
    const [w, h] = crop.ratio.split(':').map(Number);
    nextHeight = nextWidth / (w / h);
  }
  return normalizeCrop({ ...crop, width: nextWidth, height: nextHeight });
}

export function makeVariant(crop: CropVariant, id: string): CropVariant {
  return { ...normalizeCrop(crop), id };
}

export interface CropViewport {
  /** Aspect ratio of the cropped region in image pixels (width / height). */
  aspect: number;
  /** Full-image size as a percentage of the viewport (the crop region = 100%). */
  imageWidth: number;
  imageHeight: number;
  /** Full-image offset as a percentage of the viewport, placing the crop at the origin. */
  imageLeft: number;
  imageTop: number;
}

/**
 * Maps a saved crop rect onto a viewport that shows exactly the cropped region.
 * Every preview (card thumbnail, comparison view) must use this same mapping so
 * a variant frames the identical image area everywhere it is rendered.
 */
export function cropViewport(crop: CropVariant, image: ImageAsset): CropViewport {
  return {
    aspect: (crop.width * image.width) / (crop.height * image.height),
    imageWidth: 100 / crop.width,
    imageHeight: 100 / crop.height,
    // `+ 0` normalizes -0 so offsets never serialize as "-0%" in CSS.
    imageLeft: (-100 * crop.x) / crop.width + 0,
    imageTop: (-100 * crop.y) / crop.height + 0,
  };
}

export function isFrameDocument(value: unknown): value is FrameDocument {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FrameDocument>;
  return candidate.version === 1 && typeof candidate.guides === 'object' && candidate.crop !== undefined && Array.isArray(candidate.variants);
}
