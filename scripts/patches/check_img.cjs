const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
(async () => {
  const { data, info } = await sharp('screenshot_studio.png').raw().toBuffer({ resolveWithObject: true });
  let whitePixels = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
      whitePixels++;
    }
  }
  const totalPixels = info.width * info.height;
  console.log(`White pixels: ${whitePixels} / ${totalPixels} (${Math.round((whitePixels / totalPixels) * 100)}%)`);
})();
