/**
 * Draws an album art image onto a small canvas and averages the pixel
 * values to extract a dominant colour. Returns normalised { r, g, b }
 * in the 0-1 range suitable for use as Three.js colour components.
 */
export function extractDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const SIZE = 50;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
      let r = 0, g = 0, b = 0, count = 0;

      // Sample every 4th pixel (stride 16 bytes = 4 pixels × 4 channels)
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      resolve({
        r: r / count / 255,
        g: g / count / 255,
        b: b / count / 255,
      });
    };

    img.onerror = () => {
      // Fall back to a neutral purple-ish colour on failure
      resolve({ r: 0.4, g: 0.2, b: 0.8 });
    };

    img.src = imageUrl;
  });
}
