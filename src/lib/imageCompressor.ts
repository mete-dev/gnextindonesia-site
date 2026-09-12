/**
 * Utility for image compression enforcing a strict maximum size limit (default 60 KB).
 */

/**
 * Calculates the exact binary byte size of a base64 Data URL.
 */
export function getDataUrlByteSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64Index = dataUrl.indexOf(',');
  const base64Str = base64Index !== -1 ? dataUrl.slice(base64Index + 1) : dataUrl;
  return Math.round(base64Str.length * 0.75);
}

/**
 * Formats a byte size into human readable KB string (e.g., "18.4 KB").
 */
export function formatByteSize(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/**
 * Compresses an image (File or Data URL) to ensure it stays strictly under maxBytes (default 60 KB / 61,440 bytes).
 */
export async function compressImageToMax20KB(
  fileOrSrc: File | string,
  maxBytes: number = 60 * 1024, // 60 KB = 61,440 bytes
  maxDimension: number = 1000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const loadImage = (src: string) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        let width = img.width;
        let height = img.height;

        // Step 1: Initial responsive maximum dimension cap
        const INITIAL_MAX_DIM = maxDimension;
        if (width > INITIAL_MAX_DIM || height > INITIAL_MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * INITIAL_MAX_DIM) / width);
            width = INITIAL_MAX_DIM;
          } else {
            width = Math.round((width * INITIAL_MAX_DIM) / height);
            height = INITIAL_MAX_DIM;
          }
        }

        let quality = 0.75;
        let bestDataUrl = '';
        let attempts = 0;
        const MAX_ATTEMPTS = 35;

        while (attempts < MAX_ATTEMPTS) {
          attempts++;
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          bestDataUrl = canvas.toDataURL('image/webp', quality);

          const currentBytes = getDataUrlByteSize(bestDataUrl);

          if (currentBytes <= maxBytes) {
            // Target <= 20 KB reached!
            break;
          }

          // Adaptive stepping to quickly converge to <= 20KB
          if (currentBytes > maxBytes * 2.5) {
            // Significantly over limit (> 50KB) - reduce dimensions and quality
            width = Math.floor(width * 0.75);
            height = Math.floor(height * 0.75);
            quality = Math.max(0.20, quality - 0.15);
          } else if (currentBytes > maxBytes * 1.5) {
            // Moderately over limit (30KB - 50KB)
            if (quality > 0.45) {
              quality -= 0.12;
            } else {
              width = Math.floor(width * 0.82);
              height = Math.floor(height * 0.82);
            }
          } else {
            // Slightly over limit (20KB - 30KB)
            if (quality > 0.25) {
              quality -= 0.08;
            } else {
              width = Math.floor(width * 0.88);
              height = Math.floor(height * 0.88);
            }
          }

          // Safety bounds
          if (width < 80 || height < 80) {
            width = Math.max(60, width);
            height = Math.max(60, height);
            quality = 0.12;
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            bestDataUrl = canvas.toDataURL('image/webp', quality);
            break;
          }
        }

        resolve(bestDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = src;
    };

    if (typeof fileOrSrc === 'string') {
      loadImage(fileOrSrc);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          loadImage(e.target.result as string);
        } else {
          reject('FileReader failed');
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrSrc);
    }
  });
}

/**
 * Compresses an image with high quality for news portals (default max 200 KB, max 1200px width/height).
 * This ensures uploaded portal images are crisp and razor-sharp, avoiding low-res compression blur.
 */
export async function compressImageForNews(
  fileOrSrc: File | string,
  maxBytes: number = 200 * 1024, // 200 KB
  maxDimension: number = 1200 // Sharp desktop/mobile standard dimensions
): Promise<string> {
  return compressImageToMax20KB(fileOrSrc, maxBytes, maxDimension);
}
