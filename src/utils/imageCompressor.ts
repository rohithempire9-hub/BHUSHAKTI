/**
 * Client-Side Image Processor for Field Disaster Evidence
 * Resizes, optimizes, and converts user photos into compressed Data URLs
 * that fit safely within Firestore documents (<1MB) with rapid loading.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  fileName: string;
}

export async function processUserEvidencePhoto(
  file: File,
  maxDimension = 960,
  quality = 0.78
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw on canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context could not be initialized.'));
        }

        // Smooth resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Also generate small thumbnail (160px max)
        const thumbCanvas = document.createElement('canvas');
        const thumbScale = Math.min(160 / width, 160 / height, 1);
        const thumbWidth = Math.round(width * thumbScale);
        const thumbHeight = Math.round(height * thumbScale);
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (thumbCtx) {
          thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
        }
        const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.65);

        // Estimate size in bytes
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          thumbnailUrl,
          width,
          height,
          originalSizeBytes: file.size,
          compressedSizeBytes,
          fileName: file.name,
        });
      };

      img.onerror = () => {
        reject(new Error('Could not decode image file.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read uploaded photo.'));
    };

    reader.readAsDataURL(file);
  });
}
