const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { chromium } = require('playwright');

const ROOT = 'C:\\AI-Workspace\\Qobban\\MARKETING\\week-1-qobban-v2';
const V1 = 'C:\\AI-Workspace\\Qobban\\MARKETING\\week-1-qobban';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FONT_ROOT = path.join(ROOT, 'assets', 'fonts', 'almarai');
const LOGO = path.join(ROOT, 'assets', 'qobban-logo-lockup.png');
const OUT = path.join(ROOT, 'hook-covers-4x5');

const covers = [
  {
    id: 'post-03-services-hook-cover',
    kind: 'services',
    source: path.join(V1, 'post-03-service-carousel', 'source-renders', 'slide-01-cover-base.png'),
    finalPath: path.join(ROOT, 'post-03-service-carousel', 'finals-4x5-v2', 'slide-01-cover-v2.png'),
  },
  {
    id: 'post-07-checklist-hook-cover',
    kind: 'checklist',
    source: path.join(V1, 'post-07-checklist-carousel', 'source-renders', 'slide-01-cover.png'),
    crop: { left: 0, top: 500, width: 972, height: 1040 },
    finalPath: path.join(ROOT, 'post-07-checklist-carousel', 'finals-4x5-v2', 'slide-01-cover-v2.png'),
  },
];

function ensure(dir) { fs.mkdirSync(dir, { recursive: true }); }
function dataUrl(file, mime = 'image/png') { return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`; }

async function prepare() {
  ensure(OUT);
  ensure(path.join(ROOT, 'previous-covers'));
  for (const cover of covers) {
    const previous = path.join(ROOT, 'previous-covers', `${cover.id}-previous.png`);
    if (fs.existsSync(cover.finalPath) && !fs.existsSync(previous)) fs.copyFileSync(cover.finalPath, previous);
    cover.background = path.join(OUT, `${cover.id}-background.png`);
    let pipeline = sharp(cover.source);
    if (cover.crop) pipeline = pipeline.extract(cover.crop);
    await pipeline
      .resize(1080, 1350, { fit: 'cover', position: cover.kind === 'services' ? 'centre' : 'south' })
      .modulate({ brightness: cover.kind === 'services' ? 0.72 : 0.62, saturation: 0.88 })
      .sharpen({ sigma: 0.5 })
      .png()
      .toFile(cover.background);
  }
}

function sharedCss(fonts) {
  return `
    @font-face { font-family: 'Almarai'; src: url('${fonts.light}'); font-weight: 300; font-display: block; }
    @font-face { font-family: 'Almarai'; src: url('${fonts.regular}'); font-weight: 400; font-display: block; }
    @font-face { font-family: 'Almarai'; src: url('${fonts.bold}'); font-weight: 700; font-display: block; }
    @font-face { font-family: 'Almarai'; src: url('${fonts.extrabold}'); font-weight: 800; font-display: block; }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1080px; height: 1350px; overflow: hidden; background: #111; }
    body { font-family: 'Almarai', sans-serif; color: #F2F2F2; }
    .cover { position: relative; width: 1080px; height: 1350px; overflow: hidden; }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .logo { position: absolute; left: 64px; top: 58px; width: 158px; height: 162px; object-fit: contain; z-index: 4; }
    .page { position: absolute; right: 62px; top: 72px; z-index: 4; direction: ltr; color: #FFC220; font: 700 19px Arial, sans-serif; letter-spacing: 1.4px; }
    .page span { color: #F2F2F2; font-weight: 400; }
    .cross { position: absolute; right: 62px; top: 116px; width: 126px; height: 22px; z-index: 4; border-top: 1px solid #FFC220; }
    .cross::after { content: ''; position: absolute; right: 0; top: -9px; width: 17px; height: 17px; border: 1px solid #FFC220; border-radius: 50%; }
    .label { color: #FFC220; font: 700 17px Arial, sans-serif; letter-spacing: 3px; }
    .swipe { position: absolute; left: 64px; bottom: 60px; z-index: 5; display: flex; align-items: center; gap: 18px; color: #F2F2F2; font-size: 22px; font-weight: 700; }
    .swipe::before { content: '←'; width: 56px; height: 56px; border: 2px solid #FFC220; color: #FFC220; border-radius: 50%; display: flex; align-items: center; justify-content: center; font: 400 30px Arial, sans-serif; }
  `;
}

function servicesHtml(cover, assets) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
    ${sharedCss(assets.fonts)}
    .wash { position:absolute; inset:0; background: linear-gradient(180deg, rgba(8,8,8,.34), rgba(8,8,8,.08) 32%, rgba(8,8,8,.66) 100%); }
    .focus { position:absolute; left:74px; top:318px; width:932px; min-height:650px; padding:68px 66px 72px; background:rgba(13,13,13,.91); border:1px solid rgba(255,194,32,.72); clip-path:polygon(0 0, 93% 0, 100% 11%, 100% 100%, 7% 100%, 0 89%); }
    .focus::before { content:''; position:absolute; left:0; top:0; width:10px; height:100%; background:#FFC220; }
    .label { text-align:right; margin-bottom:30px; }
    .title { font-size:120px; line-height:1.16; font-weight:800; letter-spacing:-1px; text-align:right; }
    .title span { color:#FFC220; }
    .rule { width:180px; height:5px; background:#FFC220; margin:32px 0 28px auto; }
    .support { max-width:730px; font-size:30px; line-height:1.65; font-weight:300; text-align:right; }
  </style></head><body><div class="cover">
    <img class="bg" src="${assets.background}"><div class="wash"></div>
    <img class="logo" src="${assets.logo}"><div class="page">01 <span>/ 07</span></div><div class="cross"></div>
    <div class="focus"><div class="label">QOBBAN SERVICES</div><div class="title">شنو نقدر<br><span>ننفذ لك؟</span></div><div class="rule"></div><div class="support">حلول للمنازل، المشاريع التجارية، والتنفيذ حسب الطلب</div></div>
    <div class="swipe">اسحب وشوف الخدمات</div>
  </div></body></html>`;
}

function checklistHtml(cover, assets) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
    ${sharedCss(assets.fonts)}
    .wash { position:absolute; inset:0; background:linear-gradient(90deg,rgba(9,9,9,.94) 0%,rgba(9,9,9,.82) 58%,rgba(9,9,9,.60) 100%); }
    .number { position:absolute; left:54px; top:205px; z-index:3; color:#FFC220; font:800 430px/1 Arial,sans-serif; opacity:.98; }
    .titlebox { position:absolute; right:58px; top:292px; width:690px; z-index:4; text-align:right; }
    .label { margin-bottom:32px; }
    .title { font-size:112px; line-height:1.2; font-weight:800; letter-spacing:-.5px; text-shadow:0 5px 24px rgba(0,0,0,.7); }
    .title span { color:#FFC220; }
    .rule { width:170px; height:5px; background:#FFC220; margin:34px 0 30px auto; }
    .support { font-size:34px; line-height:1.58; font-weight:300; max-width:660px; }
    .save { position:absolute; right:58px; bottom:160px; z-index:4; padding:18px 28px; border:2px solid #FFC220; color:#FFC220; font-size:24px; font-weight:700; background:rgba(10,10,10,.72); }
  </style></head><body><div class="cover">
    <img class="bg" src="${assets.background}"><div class="wash"></div>
    <img class="logo" src="${assets.logo}"><div class="page">01 <span>/ 07</span></div><div class="cross"></div>
    <div class="number">5</div>
    <div class="titlebox"><div class="label">CONTRACTOR CHECKLIST</div><div class="title">لا تختار<br><span>على السعر بس</span></div><div class="rule"></div><div class="support">5 أشياء تأكد منها قبل تعتمد عرض سعر الأعمال المعدنية</div></div>
    <div class="save">احفظها قبل تعتمد العرض</div><div class="swipe">اسحب وراجع النقاط</div>
  </div></body></html>`;
}

async function render() {
  const font = name => dataUrl(path.join(FONT_ROOT, name), 'font/ttf');
  const fonts = { light: font('Almarai-Light.ttf'), regular: font('Almarai-Regular.ttf'), bold: font('Almarai-Bold.ttf'), extrabold: font('Almarai-ExtraBold.ttf') };
  const logo = dataUrl(LOGO);
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const cover of covers) {
    const assets = { fonts, logo, background: dataUrl(cover.background) };
    const html = cover.kind === 'services' ? servicesHtml(cover, assets) : checklistHtml(cover, assets);
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const output = path.join(OUT, `${cover.id}.png`);
    await page.screenshot({ path: output, type: 'png' });
    fs.copyFileSync(output, cover.finalPath);
    cover.output = output;
  }
  await browser.close();
}

async function contactSheet() {
  const thumbs = [];
  for (const cover of covers) thumbs.push(await sharp(cover.output).resize(432, 540).png().toBuffer());
  await sharp({ create: { width: 930, height: 588, channels: 3, background: '#111111' } })
    .composite([{ input: thumbs[0], left: 22, top: 24 }, { input: thumbs[1], left: 476, top: 24 }])
    .png()
    .toFile(path.join(OUT, 'hook-covers-contact-sheet.png'));
}

async function main() {
  await prepare();
  await render();
  await contactSheet();
  console.log('Rendered 2 hook-first carousel covers and replaced the current first slides.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
