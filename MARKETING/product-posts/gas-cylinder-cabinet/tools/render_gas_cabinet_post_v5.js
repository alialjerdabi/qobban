const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = 'C:\\AI-Workspace\\Qobban\\MARKETING';
const PRODUCT = path.join(ROOT, 'product-posts', 'gas-cylinder-cabinet');
const BASE = path.join(PRODUCT, 'base-images', 'gas-cylinder-beige-fan-holder-base-4x5-v4.png');
const LOGO = path.join(ROOT, 'week-1-qobban-v2', 'assets', 'qobban-logo-lockup.png');
const FONT_ROOT = path.join(ROOT, 'week-1-qobban-v2', 'assets', 'fonts', 'almarai');
const OUT = path.join(PRODUCT, 'finals-4x5');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function dataUrl(file, mime = 'image/png') {
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const fonts = {
    light: dataUrl(path.join(FONT_ROOT, 'Almarai-Light.ttf'), 'font/ttf'),
    regular: dataUrl(path.join(FONT_ROOT, 'Almarai-Regular.ttf'), 'font/ttf'),
    bold: dataUrl(path.join(FONT_ROOT, 'Almarai-Bold.ttf'), 'font/ttf'),
    extra: dataUrl(path.join(FONT_ROOT, 'Almarai-ExtraBold.ttf'), 'font/ttf'),
  };
  const html = `<!doctype html>
  <html lang="ar" dir="rtl">
  <head><meta charset="utf-8"><style>
    @font-face { font-family: Almarai; src: url('${fonts.light}'); font-weight:300; }
    @font-face { font-family: Almarai; src: url('${fonts.regular}'); font-weight:400; }
    @font-face { font-family: Almarai; src: url('${fonts.bold}'); font-weight:700; }
    @font-face { font-family: Almarai; src: url('${fonts.extra}'); font-weight:800; }
    * { box-sizing:border-box; }
    html,body { margin:0; width:1080px; height:1350px; overflow:hidden; background:#111; }
    body { font-family:Almarai, sans-serif; color:#F2F2F2; }
    .canvas { position:relative; width:1080px; height:1350px; overflow:hidden; }
    .photo { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
    .grade { position:absolute; inset:0; background:linear-gradient(180deg,rgba(6,6,6,.08),rgba(6,6,6,0) 48%,rgba(6,6,6,.20) 72%,rgba(6,6,6,.78) 100%); }
    .logo-card { position:absolute; left:46px; top:42px; width:192px; height:194px; z-index:4; background:rgba(10,10,10,.92); border:1px solid rgba(255,194,32,.74); clip-path:polygon(0 0,88% 0,100% 12%,100% 100%,12% 100%,0 88%); }
    .logo-card img { position:absolute; left:26px; top:22px; width:140px; height:144px; object-fit:contain; }
    .coord { position:absolute; right:54px; top:42px; z-index:5; direction:ltr; display:flex; align-items:center; gap:14px; color:#FFC220; font:700 16px Arial,sans-serif; letter-spacing:.4px; text-shadow:0 2px 8px rgba(0,0,0,.45); }
    .target { width:22px; height:22px; border:1px solid #FFC220; border-radius:50%; position:relative; }
    .target:before,.target:after { content:''; position:absolute; background:#FFC220; }
    .target:before { width:42px; height:1px; top:10px; left:-10px; }
    .target:after { width:1px; height:42px; top:-10px; left:10px; }
    .hero { position:absolute; right:48px; top:104px; width:540px; min-height:456px; z-index:4; padding:48px 50px 46px; background:rgba(12,12,12,.92); border:1px solid rgba(255,194,32,.70); clip-path:polygon(0 0,92% 0,100% 10%,100% 100%,8% 100%,0 90%); }
    .hero:before { content:''; position:absolute; right:0; top:0; width:8px; height:100%; background:#FFC220; }
    .eyebrow { direction:ltr; text-align:right; color:#FFC220; font:700 14px Arial,sans-serif; letter-spacing:2.6px; margin-bottom:20px; }
    .headline { font-size:68px; line-height:1.28; font-weight:800; letter-spacing:-.6px; }
    .headline span { color:#FFC220; }
    .rule { width:122px; height:4px; background:#FFC220; margin:25px 0 23px auto; }
    .support { font-size:24px; line-height:1.75; font-weight:300; }
    .support strong { display:block; color:#FFC220; font-size:25px; font-weight:700; }
    .mechanism { position:absolute; left:48px; top:300px; z-index:4; width:376px; min-height:112px; padding:21px 26px; background:rgba(10,10,10,.88); border-left:6px solid #FFC220; box-shadow:0 12px 34px rgba(0,0,0,.18); }
    .mechanism .en { direction:ltr; color:#FFC220; font:700 13px Arial,sans-serif; letter-spacing:2.1px; margin-bottom:9px; }
    .mechanism .ar { font-size:26px; line-height:1.48; font-weight:700; }
    .features { position:absolute; right:48px; top:600px; z-index:4; width:318px; padding:26px 25px 24px; background:rgba(12,12,12,.88); border:1px solid rgba(255,194,32,.58); backdrop-filter:blur(3px); clip-path:polygon(0 0,88% 0,100% 10%,100% 100%,0 100%); }
    .features-title { color:#FFC220; font:700 13px Arial,sans-serif; letter-spacing:2px; direction:ltr; text-align:right; margin-bottom:15px; }
    .feature { display:grid; grid-template-columns:1fr 46px; gap:14px; align-items:center; padding:14px 0; border-top:1px solid rgba(242,242,242,.15); }
    .feature:first-of-type { border-top:0; }
    .feature-text { font-size:18px; line-height:1.55; font-weight:400; text-align:right; }
    .feature-no { width:44px; height:44px; border:1px solid #FFC220; color:#FFC220; display:flex; align-items:center; justify-content:center; border-radius:10px; font:700 14px Arial,sans-serif; direction:ltr; }
    .measure { position:absolute; left:44px; top:760px; width:18px; height:300px; z-index:4; border-left:2px solid #FFC220; background:repeating-linear-gradient(to bottom,transparent 0 13px,#FFC220 13px 14px); opacity:.90; }
    .measure:before,.measure:after { content:''; position:absolute; left:-7px; width:14px; height:1px; background:#FFC220; }
    .measure:before { top:0; } .measure:after { bottom:0; }
    .measure-label { position:absolute; left:18px; top:1072px; color:#F2F2F2; font:700 12px Arial,sans-serif; writing-mode:vertical-rl; letter-spacing:2px; z-index:4; }
    .contact { position:absolute; left:46px; bottom:54px; width:988px; height:88px; z-index:6; border:2px solid #FFC220; border-radius:46px; background:rgba(8,8,8,.96); display:grid; grid-template-columns:260px 2px 330px 2px 1fr; align-items:center; padding:0 28px; direction:ltr; }
    .sep { width:2px; height:52px; background:#FFC220; }
    .contact-item { display:flex; align-items:center; justify-content:center; gap:15px; color:#F2F2F2; font:500 24px Arial,sans-serif; }
    .contact-item.phone { font-size:36px; font-weight:700; letter-spacing:1px; }
    .ig { width:39px; height:39px; border:2px solid #FFC220; border-radius:12px; position:relative; }
    .ig:before { content:''; position:absolute; left:10px; top:10px; width:15px; height:15px; border:2px solid #FFC220; border-radius:50%; }
    .ig:after { content:''; position:absolute; right:6px; top:6px; width:4px; height:4px; background:#FFC220; border-radius:50%; }
    .wa { width:39px; height:39px; border:2px solid #FFC220; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#FFC220; font:700 23px Arial,sans-serif; }
    .descriptor { direction:rtl; text-align:right; font-size:16px; line-height:1.5; font-weight:300; padding-right:18px; }
    .tagline { position:absolute; bottom:16px; left:0; width:100%; z-index:6; text-align:center; color:rgba(242,242,242,.78); font-size:14px; font-weight:300; letter-spacing:.2px; }
  </style></head>
  <body><div class="canvas">
    <img class="photo" src="${dataUrl(BASE)}"><div class="grade"></div>
    <div class="logo-card"><img src="${dataUrl(LOGO)}"></div>
    <div class="coord"><span class="target"></span><span>26.2239° N, 50.5876° E</span></div>
    <section class="hero">
      <div class="eyebrow">GAS CYLINDER CABINET</div>
      <div class="headline">حماية أنيقة.<br><span>أمان يدوم.</span></div>
      <div class="rule"></div>
      <div class="support">بوكس حماية أنبوب الغاز<strong>بقاعدة تفتح مع الأسطوانة لتبديل أسهل</strong></div>
    </section>
    <div class="mechanism"><div class="en">SWING-OUT SYSTEM</div><div class="ar">الأسطوانة تطلع مع الباب<br>بحركة واحدة</div></div>
    <section class="features">
      <div class="features-title">ENGINEERED FEATURES</div>
      <div class="feature"><div class="feature-text">حماية من الشمس والأمطار</div><div class="feature-no">01</div></div>
      <div class="feature"><div class="feature-text">تهوية آمنة ومدروسة</div><div class="feature-no">02</div></div>
      <div class="feature"><div class="feature-text">قاعدة دوّارة سهلة الاستخدام</div><div class="feature-no">03</div></div>
      <div class="feature"><div class="feature-text">مواد عالية الجودة</div><div class="feature-no">04</div></div>
    </section>
    <div class="measure"></div><div class="measure-label">EASY ACCESS</div>
    <div class="contact">
      <div class="contact-item"><span class="ig"></span><span>qobban.bh</span></div><div class="sep"></div>
      <div class="contact-item phone"><span class="wa">☎</span><span>39949004</span></div><div class="sep"></div>
      <div class="descriptor">قبان لأعمال اللحام<br>والديكور والصيانة</div>
    </div>
    <div class="tagline">جودة في كل تفصيلة &nbsp;—&nbsp; QUALITY IN EVERY DETAIL</div>
  </div></body></html>`;

  const browser = await chromium.launch({ executablePath: CHROME, headless:true, args:['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage({ viewport:{ width:1080, height:1350 }, deviceScaleFactor:1 });
  await page.setContent(html, { waitUntil:'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path:path.join(OUT, 'gas-cylinder-cabinet-post-v5.png'), type:'png' });
  await browser.close();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
