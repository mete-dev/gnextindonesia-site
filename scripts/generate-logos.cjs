const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Exact official logo matching user image:
// White square background with stacked bold black text: GNEXT / INDONESIA
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <g transform="translate(48, 225)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="94" letter-spacing="-3" fill="#000000">GNEXT</text>
    <text x="0" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="80" letter-spacing="-3" fill="#000000">INDONESIA</text>
  </g>
</svg>`;

// Favicon SVG (optimized for small display sizes)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <g transform="translate(44, 220)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="96" letter-spacing="-3" fill="#000000">GNEXT</text>
    <text x="0" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="82" letter-spacing="-3" fill="#000000">INDONESIA</text>
  </g>
</svg>`;

// OpenGraph Social Share Card (1200x630) using the official branding
const ogBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <!-- Clean Light Canvas -->
  <rect width="1200" height="630" fill="#F8F9FA"/>
  <rect x="2" y="2" width="1196" height="626" fill="none" stroke="#E5E7EB" stroke-width="4"/>

  <!-- Official Logo Block (Left Side) -->
  <g transform="translate(100, 155)">
    <rect width="320" height="320" rx="32" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2"/>
    <g transform="translate(30, 140)">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="60" letter-spacing="-2" fill="#000000">GNEXT</text>
      <text x="0" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="50" letter-spacing="-2" fill="#000000">INDONESIA</text>
    </g>
  </g>

  <!-- Brand Title & Info (Right Side) -->
  <g transform="translate(480, 210)">
    <!-- Category Badge -->
    <rect width="190" height="36" rx="18" fill="#171717"/>
    <text x="95" y="23" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="12" letter-spacing="2" fill="#FFFFFF">CREATIVE STUDIO</text>

    <!-- Main Heading -->
    <text x="0" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="58" letter-spacing="-1" fill="#0A0A0A">Gnext Indonesia</text>

    <!-- Subtitle -->
    <text x="0" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="500" font-size="22" fill="#525252">
      <tspan x="0" dy="0">Ruang tumbuh bagi kreator muda untuk mengubah ide</tspan>
      <tspan x="0" dy="32">menjadi karya, dan karya menjadi kontribusi nyata.</tspan>
    </text>

    <!-- Domain -->
    <text x="0" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="18" fill="#000000">www.gnextindonesia.site</text>
  </g>
</svg>`;

async function generateAssets() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Save SVG sources
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

  // Generate PNGs with Sharp
  const logoPngBuffer = await sharp(Buffer.from(logoSvg))
    .resize(512, 512)
    .png()
    .toBuffer();

  const faviconPng32 = await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toBuffer();

  const faviconPng180 = await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .png()
    .toBuffer();

  const ogPng = await sharp(Buffer.from(ogBannerSvg))
    .resize(1200, 630)
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'logo.png'), logoPngBuffer);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), faviconPng180);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), faviconPng32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconPng32);
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);

  console.log('Successfully regenerated official GNEXT INDONESIA logo and favicon assets!');
}

generateAssets().catch(console.error);
