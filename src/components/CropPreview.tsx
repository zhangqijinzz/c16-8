import type { CSSProperties, ReactNode } from 'react';
import { cropViewport } from '../domain';
import type { CropVariant, ImageAsset } from '../model';

interface CropPreviewProps {
  image: ImageAsset;
  crop: CropVariant;
  className?: string;
  children?: ReactNode;
}

/**
 * Renders exactly the image area framed by a crop rect — the same mapping the
 * canvas crop frame uses. When the container's aspect ratio differs from the
 * crop's, the viewport is letterboxed (centered, full crop visible) instead of
 * being stretched or re-framed to fill the container.
 */
export function CropPreview({ image, crop, className, children }: CropPreviewProps) {
  const viewport = cropViewport(crop, image);
  const style = {
    '--crop-aspect': String(viewport.aspect),
    '--crop-image-width': `${viewport.imageWidth}%`,
    '--crop-image-height': `${viewport.imageHeight}%`,
    '--crop-image-left': `${viewport.imageLeft}%`,
    '--crop-image-top': `${viewport.imageTop}%`,
  } as CSSProperties;
  return (
    <div className={`crop-preview ${className ?? ''}`} style={style}>
      <div className="crop-preview-viewport">
        <img src={image.src} alt="" draggable={false} />
      </div>
      {children}
    </div>
  );
}
