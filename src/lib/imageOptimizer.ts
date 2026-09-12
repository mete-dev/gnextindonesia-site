/**
 * Optimizes image URLs (e.g. Unsplash images) by enforcing lower bandwidth parameters (WebP auto format, q=75, max width).
 */
export function optimizeImageUrl(url: string | undefined | null, width = 1000, quality = 75): string {
  if (!url) return '';
  let str = url.trim();
  
  // Unsplash image optimization
  if (str.includes('images.unsplash.com')) {
    if (str.includes('?')) {
      str = str.replace(/w=\d+/, `w=${width}`).replace(/q=\d+/, `q=${quality}`);
      if (!str.includes('w=')) str += `&w=${width}`;
      if (!str.includes('q=')) str += `&q=${quality}`;
      if (!str.includes('auto=')) str += `&auto=format`;
      if (!str.includes('fit=')) str += `&fit=crop`;
    } else {
      str += `?auto=format&fit=crop&w=${width}&q=${quality}`;
    }
  }
  
  return str;
}
