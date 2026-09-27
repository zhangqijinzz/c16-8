import { cropViewport } from '../domain';
import type { CropVariant, ImageAsset } from '../model';

interface CropPreviewProps {
  image: ImageAsset;
  crop: CropVariant;
  label?: string;
}

/**
 * Renders exactly the region a crop frames.
 *
 * The crop window becomes the SVG viewBox, so the visible area is always the
 * saved crop itself — it is never re-derived from the container the way
 * `object-fit: cover` + `object-position` did. When the container has a
 * different aspect ratio than the crop, `xMidYMid meet` letterboxes the window
 * (the container's background shows as a matte) instead of shifting the
 * framing to fill the box.
 */
export function CropPreview({ image, crop, label }: CropPreviewProps) {
  const viewport = cropViewport(image, crop);
  const viewBox = `${viewport.x} ${viewport.y} ${viewport.width} ${viewport.height}`;
  return (
    <svg
      className="crop-preview"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <image href={image.src} width={image.width} height={image.height} preserveAspectRatio="none" />
    </svg>
  );
}
