const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = 'C:\\AI-Workspace\\Qobban\\MARKETING';
const PRODUCT = path.join(ROOT, 'product-posts', 'gas-cylinder-cabinet');
const ORIGINAL = path.join(PRODUCT, 'references', 'original-gas-post-layout.png');
const NEW_BASE = path.join(PRODUCT, 'base-images', 'gas-cylinder-tailored-narrow-base-v7.png');
const LOGO = path.join(ROOT, 'week-1-qobban-v2', 'assets', 'qobban-logo-lockup.png');
const OUT = path.join(PRODUCT, 'finals-same-layout');

function rulerSvg() {
  const verticalTicks = [];
  for (let y = 862; y <= 1144; y += 14) {
    const major = (y - 862) % 70 === 0;
    verticalTicks.push(`<line x1="44" y1="${y}" x2="${major ? 63 : 56}" y2="${y}"/>`);
  }
  const diagonalTicks = [];
  for (let x = 0; x <= 190; x += 14) {
    const major = x % 70 === 0;
    diagonalTicks.push(`<line x1="${x}" y1="0" x2="${x}" y2="${major ? 17 : 11}"/>`);
  }
  return Buffer.from(`
    <svg width="569" height="1495" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#FFC220" stroke-width="1.5" opacity="0.95">
        <line x1="44" y1="862" x2="44" y2="1144" stroke-width="2"/>
        ${verticalTicks.join('')}
        <g transform="translate(260 1240) rotate(24)">
          <line x1="0" y1="0" x2="190" y2="0" stroke-width="2"/>
          ${diagonalTicks.join('')}
        </g>
      </g>
      <g fill="#F2F2F2" font-family="Arial, sans-serif" font-weight="600" font-size="17">
        <text x="28" y="1000" text-anchor="middle">750</text>
        <text x="28" y="1022" text-anchor="middle">mm</text>
        <text x="320" y="1295" transform="rotate(24 320 1295)">400 mm</text>
      </g>
      <text x="227" y="252" text-anchor="middle" fill="#C99000" font-family="Arial, sans-serif" font-weight="700" font-size="10" letter-spacing="0.8">PRECISION IS OUR STANDARD</text>
    </svg>`);
}

async function makeLogo() {
  return sharp(LOGO)
    .resize(108, 111, { fit:'contain', withoutEnlargement:true })
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(OUT, { recursive:true });
  const logo = await makeLogo();

  const baseMeta = await sharp(NEW_BASE).metadata();
  const photoHeight = 1496;
  const resizedWidth = Math.round(baseMeta.width * (photoHeight / baseMeta.height));
  const cropLeft = Math.max(0, Math.min(resizedWidth - 569, Math.round(70 * (photoHeight / baseMeta.height))));
  const photo = await sharp(NEW_BASE)
    .resize({ height:photoHeight })
    .extract({ left:cropLeft, top:0, width:569, height:photoHeight })
    .modulate({ brightness:1.01, saturation:0.98 })
    .sharpen({ sigma:0.35 })
    .png()
    .toBuffer();

  await sharp(ORIGINAL)
    .composite([
      { input:photo, left:0, top:0 },
      { input:logo, left:173, top:106 },
      { input:rulerSvg(), left:0, top:0 },
    ])
    .png()
    .toFile(path.join(OUT, 'gas-cylinder-cabinet-post-same-layout-v9.png'));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
