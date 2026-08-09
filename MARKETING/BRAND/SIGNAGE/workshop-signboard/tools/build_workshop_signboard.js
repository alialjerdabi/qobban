const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = 'C:\\AI-Workspace\\Qobban\\MARKETING';
const DIR = path.join(ROOT, 'BRAND', 'SIGNAGE', 'workshop-signboard');
const LOGO = path.join(ROOT, 'week-1-qobban-v2', 'assets', 'qobban-logo-lockup.png');
const FONT_DIR = path.join(ROOT, 'week-1-qobban-v2', 'assets', 'fonts', 'almarai');

const COLORS = {
  charcoal: '#141617',
  graphite: '#282B2D',
  white: '#F2F2F2',
  yellow: '#FFC220',
};

function dataUri(file, mime) {
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

const logoData = dataUri(LOGO, 'image/png');
const arRegular = dataUri(path.join(FONT_DIR, 'Almarai-Regular.ttf'), 'font/ttf');
const arBold = dataUri(path.join(FONT_DIR, 'Almarai-Bold.ttf'), 'font/ttf');
const arExtraBold = dataUri(path.join(FONT_DIR, 'Almarai-ExtraBold.ttf'), 'font/ttf');

function serviceIcon(type, x, y, scale = 1) {
  const common = `transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${COLORS.white}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"`;
  const accent = `stroke="${COLORS.yellow}"`;
  const icons = {
    fabrication: `<g ${common}><rect x="15" y="15" width="150" height="118" rx="8"/><path d="M15 55h150M62 15v118M120 15v118"/><path ${accent} d="M22 151h136"/></g>`,
    welding: `<g ${common}><path d="M27 42l52 52M48 22l52 52"/><path d="M95 89l35 35M119 74l28 28"/><path ${accent} d="M35 137h130M64 117l-17 20M102 117l-15 20M139 117l-12 20"/></g>`,
    gates: `<g ${common}><rect x="17" y="25" width="148" height="112" rx="6"/><path d="M91 25v112M36 47h40M106 47h40M36 72h40M106 72h40M36 97h40M106 97h40"/><circle ${accent} cx="77" cy="83" r="5"/><circle ${accent} cx="105" cy="83" r="5"/></g>`,
    pergolas: `<g ${common}><path d="M24 137V56M158 137V56M17 56h148"/><path d="M28 35h30M64 35h30M100 35h30M136 35h24"/><path ${accent} d="M21 76h141"/></g>`,
    wpc: `<g ${common}><path d="M21 47h139v31H21zM21 86h139v31H21zM21 125h139v31H21z"/><path ${accent} d="M39 47v31M70 86v31M112 125v31"/></g>`,
    maintenance: `<g ${common}><path d="M47 31c21-13 48 3 47 27l-18 18 29 29 18-18c24-1 40 26 27 47-13 21-38 27-58 14L31 87C18 67 25 44 47 31z"/><path ${accent} d="M90 108l-47 47"/></g>`,
  };
  return icons[type];
}

function serviceCell(x, type, arabic, english, index) {
  const width = 520;
  const iconX = x + 26;
  const isFabrication = type === 'fabrication';
  const textX = x + (isFabrication ? 350 : 300);
  const arabicSize = isFabrication ? 52 : 58;
  const englishSize = isFabrication ? 27 : 30;
  return `<g>
    ${serviceIcon(type, iconX, 875, 0.78)}
    <text class="ar" x="${textX + 12}" y="947" text-anchor="middle" fill="${COLORS.white}" font-size="${arabicSize}" font-weight="700">${arabic}</text>
    <text class="en" x="${textX + 12}" y="1025" text-anchor="middle" fill="${COLORS.white}" opacity="0.86" font-size="${englishSize}" font-weight="600" letter-spacing="1.1">${english}</text>
    ${index < 6 ? `<line x1="${x + width - 4}" y1="835" x2="${x + width - 4}" y2="1095" stroke="${COLORS.white}" stroke-width="3" opacity="0.28"/>` : ''}
  </g>`;
}

function sourceSvg() {
  const gridVertical = Array.from({ length: 12 }, (_, i) => `<line x1="${i * 500}" y1="0" x2="${i * 500}" y2="1500"/>`).join('');
  const gridHorizontal = [250, 500, 750, 1000, 1250].map(y => `<line x1="0" y1="${y}" x2="6000" y2="${y}"/>`).join('');
  const starts = [1450, 1970, 2490, 3010, 3530, 4050];
  const services = [
    ['fabrication', 'حدادة وتصنيع', 'STEEL FABRICATION'],
    ['welding', 'لحام', 'WELDING'],
    ['gates', 'بوابات', 'GATES'],
    ['pergolas', 'برجولات', 'PERGOLAS'],
    ['wpc', 'WPC', 'WPC'],
    ['maintenance', 'صيانة عامة', 'MAINTENANCE'],
  ].map((s, i) => serviceCell(starts[i], s[0], s[1], s[2], i + 1)).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="6000" height="1500" viewBox="0 0 6000 1500">
    <defs>
      <style>
        @font-face { font-family:'Almarai'; src:url('${arRegular}'); font-weight:400; }
        @font-face { font-family:'Almarai'; src:url('${arBold}'); font-weight:700; }
        @font-face { font-family:'Almarai'; src:url('${arExtraBold}'); font-weight:800; }
        .ar { font-family:'Almarai', Arial, sans-serif; direction:rtl; }
        .en { font-family:'Bahnschrift', 'Arial Narrow', Arial, sans-serif; }
      </style>
      <linearGradient id="panel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#111314"/>
        <stop offset="0.5" stop-color="#17191A"/>
        <stop offset="1" stop-color="#111314"/>
      </linearGradient>
      <linearGradient id="reflection" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.035"/>
        <stop offset="0.32" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="0.8" stop-color="#FFFFFF" stop-opacity="0.025"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <rect width="6000" height="1500" fill="url(#panel)"/>
    <g stroke="#FFC220" stroke-width="2" opacity="0.045">${gridVertical}${gridHorizontal}</g>
    <rect x="0" y="1476" width="6000" height="24" fill="${COLORS.yellow}"/>

    <!-- LEFT: approved logo lockup, no decorative frame -->
    <g>
      <image href="${logoData}" x="215" y="145" width="900" height="925" preserveAspectRatio="xMidYMid meet"/>
      <text class="en" x="665" y="1222" text-anchor="middle" fill="${COLORS.yellow}" font-size="48" font-weight="700" letter-spacing="4">CR 60181 - 8</text>
      <line x1="1335" y1="145" x2="1335" y2="1330" stroke="${COLORS.white}" stroke-width="3" opacity="0.3"/>
    </g>

    <!-- CENTER: official registered business identity -->
    <g>
      <text class="ar" x="3070" y="340" text-anchor="middle" fill="${COLORS.white}" font-size="150" font-weight="800">قبان لأعمال اللحام و الديكور و الصيانة</text>
      <text class="en" x="3070" y="505" text-anchor="middle" fill="${COLORS.yellow}" font-size="75" font-weight="600" letter-spacing="2.2">QOBBAN WELDING, DECORATION, MAINTENANCE</text>
      <line x1="2500" y1="605" x2="3640" y2="605" stroke="${COLORS.yellow}" stroke-width="9"/>
      <line x1="1500" y1="795" x2="4550" y2="795" stroke="${COLORS.white}" stroke-width="3" opacity="0.42"/>
    </g>

    <!-- CENTER LOWER: single compact service strip -->
    ${services}

    <!-- RIGHT: restrained technical gate elevation -->
    <g transform="translate(4705 135)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="${COLORS.yellow}" stroke-width="6" opacity="0.78">
        <rect x="150" y="75" width="785" height="405"/>
        <line x1="542" y1="75" x2="542" y2="480"/>
        <line x1="195" y1="125" x2="495" y2="125"/><line x1="195" y1="190" x2="495" y2="190"/><line x1="195" y1="255" x2="495" y2="255"/><line x1="195" y1="320" x2="495" y2="320"/><line x1="195" y1="385" x2="495" y2="385"/>
        <line x1="590" y1="125" x2="890" y2="125"/><line x1="590" y1="190" x2="890" y2="190"/><line x1="590" y1="255" x2="890" y2="255"/><line x1="590" y1="320" x2="890" y2="320"/><line x1="590" y1="385" x2="890" y2="385"/>
        <line x1="150" y1="32" x2="935" y2="32"/><line x1="150" y1="18" x2="150" y2="46"/><line x1="935" y1="18" x2="935" y2="46"/>
        <line x1="982" y1="75" x2="982" y2="480"/><line x1="968" y1="75" x2="996" y2="75"/><line x1="968" y1="480" x2="996" y2="480"/>
        <circle cx="542" cy="255" r="14"/><line x1="512" y1="255" x2="572" y2="255"/><line x1="542" y1="225" x2="542" y2="285"/>
      </g>
      <text class="en" x="542" y="16" text-anchor="middle" fill="${COLORS.yellow}" stroke="none" font-size="22" letter-spacing="2.2">4000 mm</text>
      <text class="en" x="1015" y="282" fill="${COLORS.yellow}" stroke="none" font-size="22" transform="rotate(90 1015 282)" letter-spacing="2.2">1000 mm</text>
    </g>

    <!-- RIGHT LOWER: two contact numbers and Instagram -->
    <path d="M4665 770H5655L5740 855V955H4665Z" fill="${COLORS.yellow}"/>
    <g transform="translate(4772 827)" fill="none" stroke="${COLORS.charcoal}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
      <path d="M26 20l42 42-24 24c35 64 86 115 150 150l24-24 42 42-31 31c-10 10-25 14-38 9C92 259 23 190-12 91c-5-13-1-28 9-38z" transform="scale(.48)"/>
    </g>
    <text class="en" x="5280" y="900" text-anchor="middle" fill="${COLORS.charcoal}" font-size="104" font-weight="700" letter-spacing="5">39949004</text>

    <path d="M4665 985H5655L5740 1070V1170H4665Z" fill="${COLORS.yellow}"/>
    <g transform="translate(4772 1042)" fill="none" stroke="${COLORS.charcoal}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
      <path d="M26 20l42 42-24 24c35 64 86 115 150 150l24-24 42 42-31 31c-10 10-25 14-38 9C92 259 23 190-12 91c-5-13-1-28 9-38z" transform="scale(.48)"/>
    </g>
    <text class="en" x="5280" y="1115" text-anchor="middle" fill="${COLORS.charcoal}" font-size="104" font-weight="700" letter-spacing="5">33409004</text>

    <g transform="translate(4860 1250)" fill="none" stroke="${COLORS.white}" stroke-width="11">
      <rect x="0" y="0" width="110" height="110" rx="26"/>
      <circle cx="55" cy="55" r="25"/>
      <circle cx="87" cy="23" r="6" fill="${COLORS.yellow}" stroke="none"/>
    </g>
    <text class="en" x="5085" y="1335" fill="${COLORS.white}" font-size="72" font-weight="600" letter-spacing="2.5">qobban_bh</text>

    <path d="M0 0H6000V1500H0Z" fill="url(#reflection)" opacity="0.36"/>
  </svg>`;
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  const svgPath = path.join(DIR, 'workshop-signboard-source.svg');
  fs.writeFileSync(svgPath, sourceSvg(), 'utf8');

  await sharp(svgPath, { density: 72 })
    .resize(6000, 1500)
    .png({ compressionLevel: 9 })
    .toFile(path.join(DIR, 'workshop-signboard-flat.png'));

  await sharp(svgPath, { density: 72 })
    .resize(2000, 500)
    .png({ compressionLevel: 9 })
    .toFile(path.join(DIR, 'workshop-signboard-web-preview.png'));

  await sharp(svgPath, { density: 144 })
    .resize(12000, 3000)
    .png({ compressionLevel: 9 })
    .toFile(path.join(DIR, 'workshop-signboard-print.png'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
