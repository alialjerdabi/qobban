const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = 'C:\\AI-Workspace\\Qobban\\MARKETING';
const PRODUCT = path.join(ROOT, 'product-posts', 'gas-cylinder-cabinet');
const ORIGINAL = path.join(PRODUCT, 'references', 'original-gas-post-layout.png');
const BASE = path.join(PRODUCT, 'base-images', 'gas-cylinder-full-metal-beige-base-v4-uploaded.png');
const LOGO = path.join(ROOT, 'week-1-qobban-v2', 'assets', 'qobban-logo-lockup.png');
const FONT_DIR = path.join(ROOT, 'week-1-qobban-v2', 'assets', 'fonts', 'almarai');
const OUT = path.join(PRODUCT, 'finals-same-layout', 'gas-cylinder-full-metal-beige-post-v3.png');

const regularFont = fs.readFileSync(path.join(FONT_DIR, 'Almarai-Regular.ttf')).toString('base64');
const boldFont = fs.readFileSync(path.join(FONT_DIR, 'Almarai-Bold.ttf')).toString('base64');
const extraBoldFont = fs.readFileSync(path.join(FONT_DIR, 'Almarai-ExtraBold.ttf')).toString('base64');

const fontCss = `
  @font-face { font-family:'Almarai'; src:url(data:font/ttf;base64,${regularFont}); font-weight:400; }
  @font-face { font-family:'Almarai'; src:url(data:font/ttf;base64,${boldFont}); font-weight:700; }
  @font-face { font-family:'Almarai'; src:url(data:font/ttf;base64,${extraBoldFont}); font-weight:800; }
  .ar { font-family:'Almarai'; }
`;

function metalIcon() {
  return `<rect x="17" y="17" width="50" height="50" rx="4"/><path d="M28 17v50M56 17v50M17 32h50M17 53h50"/>`;
}

function meshIcon() {
  return `<rect x="15" y="15" width="54" height="54" rx="4"/><path d="M18 32l17-17M18 50l35-35M18 68l51-51M36 69l33-33M54 69l15-15M18 18l50 50M37 15l32 32M56 15l13 13M15 37l32 32M15 56l13 13"/>`;
}

function doorHolderIcon() {
  return `<path d="M19 15h34v53H19zM26 23h20M53 21l13 8v39H53"/><path d="M14 65h39c8 0 14-4 14-9M23 58c9 4 21 4 30 0"/><path d="M61 47l7 7 7-7"/>`;
}

function exchangeIcon() {
  return `<path d="M31 27h22l5 8v28H26V35zM35 20h14M38 20v7M46 20v7"/><path d="M10 38h12M14 33l-5 5 5 5M62 49h12M70 44l5 5-5 5"/>`;
}

function finishIcon() {
  return `<path d="M17 56l26 12 26-12-26-12zM17 44l26 12 26-12-26-12zM17 32l26 12 26-12-26-12z"/><path d="M64 16v12M58 22h12M19 17l4 4M23 17l-4 4"/>`;
}

function iconBox(y, icon) {
  return `<g transform="translate(70 ${y}) scale(0.92)" fill="none" stroke="#FFC220" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <rect width="84" height="84" rx="20"/>
    ${icon}
  </g>`;
}

function feature(y, icon, line1, line2, accentSecond = false) {
  return `${iconBox(y, icon)}
    <text class="ar" x="320" y="${y + 31}" text-anchor="end" fill="#F2F2F2" font-size="26" font-weight="${accentSecond ? '700' : '400'}">${line1}</text>
    <text class="ar" x="320" y="${y + 70}" text-anchor="end" fill="${accentSecond ? '#FFC220' : '#F2F2F2'}" font-size="26" font-weight="${accentSecond ? '700' : '400'}">${line2}</text>`;
}

function rightPanelSvg() {
  const rulerTicks = [];
  for (let y = 730; y <= 1408; y += 12) {
    const major = (y - 730) % 60 === 0;
    rulerTicks.push(`<line x1="340" y1="${y}" x2="${major ? 361 : 353}" y2="${y}"/>`);
  }

  return Buffer.from(`<svg width="372" height="1495" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#151718"/>
        <stop offset="0.55" stop-color="#0E1011"/>
        <stop offset="1" stop-color="#141617"/>
      </linearGradient>
    </defs>
    <style>${fontCss}</style>
    <rect width="372" height="1495" fill="url(#bg)"/>

    <g stroke="#FFC220" fill="none" stroke-width="1.5">
      <line x1="28" y1="98" x2="130" y2="98"/>
      <line x1="48" y1="65" x2="48" y2="131"/>
      <circle cx="48" cy="98" r="9"/>
      <line x1="38" y1="98" x2="58" y2="98"/>
      <line x1="48" y1="88" x2="48" y2="108"/>
      <line x1="328" y1="98" x2="368" y2="98"/>
      <line x1="356" y1="84" x2="356" y2="112"/>
    </g>
    <text x="157" y="104" fill="#FFC220" font-family="Arial, sans-serif" font-size="14" font-weight="700">26.2239° N, 50.5876° E</text>

    <text class="ar" x="320" y="283" text-anchor="end" fill="#F2F2F2" font-size="62" font-weight="800">معدن</text>
    <text class="ar" x="320" y="380" text-anchor="end" fill="#FFC220" font-size="62" font-weight="800">بالكامل..</text>
    <text class="ar" x="320" y="477" text-anchor="end" fill="#F2F2F2" font-size="49" font-weight="800">استبدال أسهل</text>

    <text class="ar" x="320" y="592" text-anchor="end" fill="#F2F2F2" font-size="21" font-weight="400">بوكس حماية أسطوانة الغاز</text>
    <text class="ar" x="320" y="636" text-anchor="end" fill="#FFC220" font-size="19" font-weight="400">بهيكل معدني وتشطيب بيج أنيق</text>

    ${feature(746, metalIcon(), 'هيكل معدني', 'بالكامل', true)}
    ${feature(883, meshIcon(), 'تهوية شبكية', 'عملية')}
    ${feature(1020, doorHolderIcon(), 'حامل سحب', 'مع الباب', true)}
    ${feature(1157, exchangeIcon(), 'وصول أسرع', 'واستبدال أسهل')}
    ${feature(1294, finishIcon(), 'تشطيب بيج', 'أنيق', true)}

    <g stroke="#FFC220" stroke-width="1.5" opacity="0.92">
      <line x1="340" y1="730" x2="340" y2="1408"/>
      ${rulerTicks.join('')}
    </g>
  </svg>`);
}

function photoOverlaySvg() {
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
  return Buffer.from(`<svg width="569" height="1495" xmlns="http://www.w3.org/2000/svg">
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

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive:true });

  const baseMeta = await sharp(BASE).metadata();
  const photoHeight = 1495;
  const resizedWidth = Math.round(baseMeta.width * (photoHeight / baseMeta.height));
  const cropLeft = Math.max(0, Math.round((resizedWidth - 569) / 2));
  const photo = await sharp(BASE)
    .resize({ height:photoHeight })
    .extract({ left:cropLeft, top:0, width:569, height:photoHeight })
    .modulate({ brightness:1.0, saturation:0.97 })
    .sharpen({ sigma:0.25 })
    .png()
    .toBuffer();

  const logo = await sharp(LOGO).resize(108, 111, { fit:'contain', withoutEnlargement:true }).png().toBuffer();
  const footer = await sharp(ORIGINAL).extract({ left:0, top:1495, width:941, height:177 }).png().toBuffer();

  await sharp({ create:{ width:941, height:1672, channels:4, background:'#0E1011' } })
    .composite([
      { input:photo, left:0, top:0 },
      { input:rightPanelSvg(), left:569, top:0 },
      { input:logo, left:173, top:106 },
      { input:photoOverlaySvg(), left:0, top:0 },
      { input:footer, left:0, top:1495 },
    ])
    .png()
    .toFile(OUT);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
